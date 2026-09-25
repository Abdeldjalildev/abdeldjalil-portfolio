import { collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, runTransaction, serverTimestamp, where } from 'firebase/firestore'
import { getFirebaseApp } from '../../firebase/app.ts'
import { contactLinksPath } from '../../data/paths.ts'
import { contactLinkInputSchema, contactLinkSchema, validate } from '../../data/schema/index.ts'
import type { ContactLink, ContactLinkInput } from '../../data/types.ts'

const db = getFirestore(getFirebaseApp())
export type ContactLinkRecord = ContactLink & { id: string }

export function validateContactTarget(type: ContactLink['type'], value: string): boolean {
  const trimmed = value.trim()
  if (type === 'email') return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed) || /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)
  if (type === 'phone') return /^\+?[0-9][0-9\s-]{4,19}$/.test(trimmed) || /^tel:\+?[0-9][0-9\s-]{4,19}$/.test(trimmed)
  if (type === 'whatsapp') return /^https:\/\/.+/.test(trimmed) || /^\+?[0-9][0-9\s-]{4,19}$/.test(trimmed)
  return /^https:\/\/.+/.test(trimmed)
}

export async function listContactLinks(admin = false): Promise<{ items: ContactLinkRecord[]; invalidCount: number }> {
  const q = admin ? query(collection(db, contactLinksPath()), orderBy('order')) : query(collection(db, contactLinksPath()), where('published', '==', true), orderBy('order'))
  const snapshot = await getDocs(q)
  let invalidCount = 0
  const items = snapshot.docs.flatMap(item => {
    const parsed = validate(contactLinkSchema, item.data(), item.ref.path)
    if (!parsed.ok || !validateContactTarget(parsed.value.type, parsed.value.value)) { invalidCount += 1; return [] }
    return [{ ...parsed.value, id: item.id }]
  })
  return { items, invalidCount }
}

export async function saveContactLink(id: string, input: ContactLinkInput, expectedUpdatedAt?: ContactLink['updatedAt']): Promise<void> {
  if (!validate(contactLinkInputSchema, input, 'contactLink').ok || !validateContactTarget(input.type, input.value)) throw new Error('INVALID_CONTACT_LINK')
  await runTransaction(db, async transaction => {
    const reference = doc(db, contactLinksPath(), id)
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists()) {
      transaction.set(reference, { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      return
    }
    const current = validate(contactLinkSchema, snapshot.data(), reference.path)
    if (!current.ok) throw new Error('INVALID_STORED_CONTACT_LINK')
    if (expectedUpdatedAt && !current.value.updatedAt.isEqual(expectedUpdatedAt)) throw new Error('CONCURRENT_CONTACT_EDIT')
    transaction.update(reference, { ...input, updatedAt: serverTimestamp() })
  })
}

export async function deleteContactLink(id: string): Promise<void> { await deleteDoc(doc(db, contactLinksPath(), id)) }
