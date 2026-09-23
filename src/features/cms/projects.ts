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
import { ALLOWED_IMAGE_CONTENT_TYPES, STORAGE_LIMITS } from '../../data/paths.ts'

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

export async function getPublishedProject(slug: string): Promise<ProjectRecord | null> {
  try {
    const snapshot = await getDoc(doc(db, projectPath(slug)))
    if (!snapshot.exists()) return null

    const project = documentOrThrow(projectSchema, snapshot.data())
    return project.published ? { ...project, id: snapshot.id } : null
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code)
      : ''
    if (code === 'permission-denied') return null
    throw error
  }
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
  const maxBytes = kind === 'thumbnail' ? STORAGE_LIMITS.projectThumbnail : STORAGE_LIMITS.projectGallery
  if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number])) {
    throw new Error('Only PNG, JPEG, WebP and AVIF images are accepted.')
  }
  if (file.size > maxBytes) {
    throw new Error(`This file exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit.`)
  }
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

async function cleanupRemovedMedia(previous: ProjectRecord, next: ProjectInput): Promise<void> {
  const keep = new Set([next.thumbnailPath, ...next.galleryPaths].filter((path): path is string => Boolean(path)))
  const old = [previous.thumbnailPath, ...previous.galleryPaths].filter((path): path is string => Boolean(path))
  const removed = old.filter((path) => !keep.has(path))
  if (removed.length) await deleteMedia(removed)
}

export async function publishProject(
  project: ProjectRecord,
  input: ProjectInput,
): Promise<void> {
  const value = inputOrThrow(projectInputSchema, input)
  if (!value.published) {
    await unpublishProject(project, value)
    return
  }

  const original = [value.thumbnailPath, ...value.galleryPaths].filter((path): path is string => Boolean(path))
  const thumbnail = value.thumbnailPath ? await moveMediaPaths(project.id, [value.thumbnailPath], true) : []
  const gallery = await moveMediaPaths(project.id, value.galleryPaths, true)
  const promoted: ProjectInput = { ...value, thumbnailPath: thumbnail[0] ?? null, galleryPaths: gallery }

  try {
    await saveProject(promoted, project.updatedAt)
  } catch (error) {
    // Best-effort rollback keeps failed writes from leaving promoted objects behind.
    const promotedPaths = [promoted.thumbnailPath, ...promoted.galleryPaths].filter((path): path is string => Boolean(path))
    for (const path of promotedPaths) {
      if (!original.includes(path)) {
        try {
          const fileName = path.split('/').pop()
          if (fileName) await moveStorageObject(path, draftObjectPath(`project-${project.id}-${path.includes('/thumbnail/') ? 'thumbnail' : 'gallery'}`, fileName))
        } catch { /* preserve the original write error */ }
      }
    }
    throw error
  }
  await cleanupRemovedMedia(project, promoted)
}

export async function unpublishProject(project: ProjectRecord, input: ProjectInput): Promise<void> {
  const value = inputOrThrow(projectInputSchema, input)
  const all = [value.thumbnailPath, ...value.galleryPaths].filter((path): path is string => Boolean(path))
  const staged = await moveMediaPaths(project.id, all, false)
  const thumbnail = staged.find((path) => path.includes('-thumbnail/')) ?? null
  const gallery = staged.filter((path) => path.includes('-gallery/'))
  const next = { ...value, published: false, thumbnailPath: thumbnail, galleryPaths: gallery }
  try {
    await saveProject(next, project.updatedAt)
  } catch (error) {
    const stagedPaths = [next.thumbnailPath, ...next.galleryPaths].filter((path): path is string => Boolean(path))
    for (const path of stagedPaths) {
      try {
        const fileName = path.split('/').pop()
        if (fileName) await moveStorageObject(path, path.includes('-thumbnail/') ? projectThumbnailObjectPath(project.id, fileName) : projectGalleryObjectPath(project.id, fileName))
      } catch { /* preserve the original write error */ }
    }
    throw error
  }
}

export async function deleteProjectMedia(path: string): Promise<void> {
  await deleteObject(ref(storage, path))
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
