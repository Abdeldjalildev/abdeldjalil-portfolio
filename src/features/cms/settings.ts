import { doc, getDoc, getFirestore, runTransaction, serverTimestamp } from 'firebase/firestore'
import { getFirebaseApp } from '../../firebase/app.ts'
import { settingsPath } from '../../data/paths.ts'
import { siteSettingsInputSchema, siteSettingsSchema, validate } from '../../data/schema/index.ts'
import type { SiteSettings, SiteSettingsInput } from '../../data/types.ts'
import { CmsConflictError, CmsValidationError } from './errors.ts'

const db = getFirestore(getFirebaseApp())

function parseInput(input: SiteSettingsInput): SiteSettingsInput {
  const result = validate(siteSettingsInputSchema, input, 'settings')
  if (!result.ok) throw new CmsValidationError(result.issues)
  return result.value
}

function parseDocument(data: unknown): SiteSettings {
  const result = validate(siteSettingsSchema, data, 'settings/main')
  if (!result.ok) throw new CmsValidationError(result.issues)
  return result.value
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snapshot = await getDoc(doc(db, settingsPath()))
  return snapshot.exists() ? parseDocument(snapshot.data()) : null
}

export async function saveSiteSettings(
  input: SiteSettingsInput,
  expectedUpdatedAt?: SiteSettings['updatedAt'],
): Promise<void> {
  const value = parseInput(input)
  const reference = doc(db, settingsPath())

  await runTransaction(db, async transaction => {
    const current = await transaction.get(reference)
    if (!current.exists()) {
      if (expectedUpdatedAt) throw new CmsConflictError()
      transaction.set(reference, {
        ...value,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return
    }

    const currentSettings = parseDocument(current.data())
    if (!expectedUpdatedAt || !currentSettings.updatedAt.isEqual(expectedUpdatedAt)) {
      throw new CmsConflictError()
    }
    transaction.update(reference, { ...value, updatedAt: serverTimestamp() })
  })
}
