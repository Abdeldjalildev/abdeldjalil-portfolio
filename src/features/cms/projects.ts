import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { deleteObject, getBytes, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFirebaseApp } from '../../firebase/app.ts'
import {
  projectInputSchema,
  projectSchema,
  siteSettingsSchema,
  validate,
  type Project,
  type ProjectInput,
  type SiteSettings,
} from '../../data/index.ts'
import {
  draftObjectPath,
  projectGalleryObjectPath,
  projectPath,
  projectThumbnailObjectPath,
  projectsPath,
} from '../../data/paths.ts'
import { CmsConflictError, CmsValidationError } from './errors.ts'

const app = getFirebaseApp()
const db = getFirestore(app)
const storage = getStorage(app)

function inputOrThrow<T>(parser: (value: unknown, path: string, issues: { path: string; message: string }[]) => T | undefined, value: unknown): T {
  const result = validate(parser, value)
  if (!result.ok) throw new CmsValidationError(result.issues)
  return result.value
}

function documentOrThrow<T>(
  parser: (value: unknown, path: string, issues: { path: string; message: string }[]) => T | undefined,
  value: unknown,
): T {
  const result = validate(parser, value)
  if (!result.ok) throw new CmsValidationError(result.issues)
  return result.value
}

export type ProjectRecord = Project & { id: string }

export async function listProjects(publishedOnly = false): Promise<{ items: ProjectRecord[]; invalidCount: number }> {
  const base = collection(db, projectsPath())
  const q = publishedOnly
    ? query(base, where('published', '==', true), orderBy('order', 'asc'))
    : query(base, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  const items: ProjectRecord[] = []
  let invalidCount = 0
  for (const item of snapshot.docs) {
    try {
      items.push({ ...documentOrThrow(projectSchema, item.data()), id: item.id })
    } catch {
      invalidCount += 1
    }
  }
  return { items, invalidCount }
}

export async function getProject(slug: string): Promise<ProjectRecord | null> {
  const snapshot = await getDoc(doc(db, projectPath(slug)))
  if (!snapshot.exists()) return null
  return { ...documentOrThrow(projectSchema, snapshot.data()), id: snapshot.id }
}

export async function getFeaturedProjectId(): Promise<string | null> {
  const snapshot = await getDoc(doc(db, 'settings/main'))
  if (!snapshot.exists()) return null
  const settings = documentOrThrow(siteSettingsSchema, snapshot.data())
  return settings.featuredProjectId
}

function safeFileName(file: File): string {
  const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : ''
  const stem = file.name
    .slice(0, Math.max(0, file.name.length - extension.length))
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'media'
  return `${stem}-${crypto.randomUUID().slice(0, 8)}${extension}`
}

export async function uploadProjectMedia(
  projectId: string,
  kind: 'thumbnail' | 'gallery',
  file: File,
): Promise<{ path: string; url: string }> {
  const fileName = safeFileName(file)
  const path = draftObjectPath(`project-${projectId}-${kind}`, fileName)
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, { contentType: file.type })
  return { path, url: await getDownloadURL(storageRef) }
}

async function copyStorageObject(fromPath: string, toPath: string): Promise<void> {
  const source = ref(storage, fromPath)
  const bytes = await getBytes(source)
  const target = ref(storage, toPath)
  await uploadBytes(target, bytes)
}

async function moveStorageObject(fromPath: string, toPath: string): Promise<void> {
  await copyStorageObject(fromPath, toPath)
  await deleteObject(ref(storage, fromPath))
}

async function moveMediaPaths(projectId: string, paths: string[], toPublic: boolean): Promise<string[]> {
  const moved: string[] = []
  for (const source of paths) {
    const fileName = source.split('/').pop()
    if (!fileName) throw new Error('Invalid media path')
    const target = toPublic
      ? (source.includes('/thumbnail/') || source.includes('-thumbnail/')
          ? projectThumbnailObjectPath(projectId, fileName)
          : projectGalleryObjectPath(projectId, fileName))
      : draftObjectPath(`project-${projectId}-${source.includes('/thumbnail/') ? 'thumbnail' : 'gallery'}`, fileName)
    if (source !== target) {
      await moveStorageObject(source, target)
      moved.push(target)
    } else {
      moved.push(source)
    }
  }
  return moved
}

async function deleteMedia(paths: string[]): Promise<void> {
  for (const path of paths) {
    await deleteObject(ref(storage, path))
  }
}

export async function saveProject(
  input: ProjectInput,
  expectedUpdatedAt?: Project['updatedAt'],
): Promise<void> {
  const value = inputOrThrow(projectInputSchema, input)
  const refDoc = doc(db, projectPath(value.slug))

  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(refDoc)
    if (!current.exists()) {
      if (expectedUpdatedAt) throw new CmsConflictError()
      transaction.set(refDoc, { ...value, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      return
    }
    const currentProject = documentOrThrow(projectSchema, current.data())
    if (!expectedUpdatedAt || !currentProject.updatedAt.isEqual(expectedUpdatedAt)) {
      throw new CmsConflictError()
    }
    transaction.update(refDoc, { ...value, updatedAt: serverTimestamp() })
  })
}

export async function publishProject(
  project: ProjectRecord,
  input: ProjectInput,
): Promise<void> {
  const value = inputOrThrow(projectInputSchema, input)
  if (!value.published) {
    await saveProject(value, project.updatedAt)
    return
  }

  const thumbnail = value.thumbnailPath
    ? await moveMediaPaths(project.id, [value.thumbnailPath], true)
    : []
  const gallery = await moveMediaPaths(project.id, value.galleryPaths, true)
  const promoted: ProjectInput = {
    ...value,
    thumbnailPath: thumbnail[0] ?? null,
    galleryPaths: gallery,
  }

  try {
    await saveProject(promoted, project.updatedAt)
  } catch (error) {
    throw error
  }
}

export async function unpublishProject(project: ProjectRecord, input: ProjectInput): Promise<void> {
  const value = inputOrThrow(projectInputSchema, input)
  const all = [value.thumbnailPath, ...value.galleryPaths].filter((path): path is string => Boolean(path))
  const staged = await moveMediaPaths(project.id, all, false)
  const thumbnail = staged.find((path) => path.includes('-thumbnail/')) ?? null
  const gallery = staged.filter((path) => path.includes('-gallery/'))
  await saveProject({ ...value, published: false, thumbnailPath: thumbnail, galleryPaths: gallery }, project.updatedAt)
}

export async function deleteProject(project: ProjectRecord): Promise<void> {
  const media = [project.thumbnailPath, ...project.galleryPaths].filter((path): path is string => Boolean(path))
  if (media.length) await deleteMedia(media)
  await deleteDoc(doc(db, projectPath(project.slug)))
}

export async function setFeaturedProject(projectId: string | null): Promise<void> {
  const settingsRef = doc(db, 'settings/main')
  await runTransaction(db, async (transaction) => {
    const settingsSnapshot = await transaction.get(settingsRef)
    if (!settingsSnapshot.exists()) throw new Error('Site settings must exist before selecting a featured project.')
    if (projectId) {
      const projectSnapshot = await transaction.get(doc(db, projectPath(projectId)))
      if (!projectSnapshot.exists()) throw new Error('The selected project does not exist.')
      const project = documentOrThrow(projectSchema, projectSnapshot.data())
      if (!project.published) throw new Error('Only a published project can be featured.')
    }
    transaction.update(settingsRef, { featuredProjectId: projectId, updatedAt: serverTimestamp() })
  })
}
