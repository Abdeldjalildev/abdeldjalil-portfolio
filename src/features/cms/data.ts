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
import { getFirestore } from 'firebase/firestore'
import { getFirebaseApp } from '../../firebase/app.ts'
import {
  profileInputSchema,
  profileSchema,
  serviceInputSchema,
  serviceSchema,
  skillInputSchema,
  skillSchema,
  validate,
  type ProfileInput,
  type ServiceInput,
  type SkillInput,
  type Profile,
  type Service,
  type Skill,
} from '../../data/index.ts'
import { profilePath, servicePath, servicesPath, skillPath, skillsPath } from '../../data/paths.ts'
import { CmsConflictError, CmsValidationError } from './errors.ts'

const db = getFirestore(getFirebaseApp())

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

export async function getPublicProfile(): Promise<Profile | null> {
  try {
    const snapshot = await getDoc(doc(db, profilePath()))
    if (!snapshot.exists()) return null
    return documentOrThrow(profileSchema, snapshot.data())
  } catch (error) {
    if ((error as { code?: string }).code === 'permission-denied') return null
    throw error
  }
}

export async function getAdminProfile(): Promise<Profile | null> {
  return getPublicProfile()
}

export async function saveProfile(input: ProfileInput, expectedUpdatedAt?: Profile['updatedAt']): Promise<void> {
  const value = inputOrThrow(profileInputSchema, input)
  const ref = doc(db, profilePath())

  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(ref)
    if (!current.exists()) {
      if (expectedUpdatedAt) throw new CmsConflictError()
      transaction.set(ref, { ...value, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      return
    }

    const currentProfile = documentOrThrow(profileSchema, current.data())
    if (!expectedUpdatedAt || !currentProfile.updatedAt.isEqual(expectedUpdatedAt)) {
      throw new CmsConflictError()
    }

    transaction.update(ref, { ...value, updatedAt: serverTimestamp() })
  })
}

async function listCollection<T>(
  collectionName: string,
  parser: (value: unknown, path: string, issues: { path: string; message: string }[]) => T | undefined,
  publishedOnly: boolean,
): Promise<{ items: T[]; invalidCount: number }> {
  const base = collection(db, collectionName)
  const q = publishedOnly
    ? query(base, where('published', '==', true), orderBy('order', 'asc'))
    : query(base, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  const items: T[] = []
  let invalidCount = 0

  for (const item of snapshot.docs) {
    try {
      items.push(documentOrThrow(parser, item.data()))
    } catch {
      invalidCount += 1
    }
  }

  return { items, invalidCount }
}

export async function listServices(publishedOnly = false) {
  return listCollection<Service>(servicesPath(), serviceSchema, publishedOnly)
}

export type SkillRecord = Skill & { id: string }

export async function listSkills(publishedOnly = false): Promise<{ items: SkillRecord[]; invalidCount: number }> {
  const base = collection(db, skillsPath())
  const q = publishedOnly
    ? query(base, where('published', '==', true), orderBy('order', 'asc'))
    : query(base, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  const items: SkillRecord[] = []
  let invalidCount = 0
  for (const item of snapshot.docs) {
    try {
      items.push({ ...documentOrThrow(skillSchema, item.data()), id: item.id })
    } catch {
      invalidCount += 1
    }
  }
  return { items, invalidCount }
}

export async function saveService(input: ServiceInput, expectedUpdatedAt?: Service['updatedAt']): Promise<void> {
  const value = inputOrThrow(serviceInputSchema, input)
  const ref = doc(db, servicePath(value.slug))

  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(ref)
    if (!current.exists()) {
      if (expectedUpdatedAt) throw new CmsConflictError()
      transaction.set(ref, { ...value, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      return
    }

    const currentService = documentOrThrow(serviceSchema, current.data())
    if (!expectedUpdatedAt || !currentService.updatedAt.isEqual(expectedUpdatedAt)) {
      throw new CmsConflictError()
    }
    transaction.update(ref, { ...value, updatedAt: serverTimestamp() })
  })
}

export async function deleteService(service: Service): Promise<void> {
  await deleteDoc(doc(db, servicePath(service.slug)))
}

export async function saveSkill(input: SkillInput, id?: string, expectedUpdatedAt?: Skill['updatedAt']): Promise<void> {
  const value = inputOrThrow(skillInputSchema, input)
  const skillId = id ?? crypto.randomUUID()
  const ref = doc(db, `${skillsPath()}/${skillId}`)

  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(ref)
    if (!current.exists()) {
      if (expectedUpdatedAt) throw new CmsConflictError()
      transaction.set(ref, { ...value, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      return
    }

    const currentSkill = documentOrThrow(skillSchema, current.data())
    if (!expectedUpdatedAt || !currentSkill.updatedAt.isEqual(expectedUpdatedAt)) {
      throw new CmsConflictError()
    }
    transaction.update(ref, { ...value, updatedAt: serverTimestamp() })
  })
}

export async function deleteSkill(skill: SkillRecord): Promise<void> {
  await deleteDoc(doc(db, `${skillsPath()}/${skill.id}`))
}
