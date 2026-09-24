import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { getFirebaseApp } from '../firebase/app.ts'
import { settingsPath } from './paths.ts'
import { siteSettingsSchema, validate } from './schema/index.ts'
import type { Locale } from './enums.ts'

const db = getFirestore(getFirebaseApp())

export async function getPublicDefaultLocale(): Promise<Locale | null> {
  try {
    const snapshot = await getDoc(doc(db, settingsPath()))
    if (!snapshot.exists()) return null
    const result = validate(siteSettingsSchema, snapshot.data(), 'settings/main')
    return result.ok ? result.value.defaultLocale : null
  } catch {
    return null
  }
}
