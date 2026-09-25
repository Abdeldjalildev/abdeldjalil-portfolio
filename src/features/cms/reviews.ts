import { collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, runTransaction, serverTimestamp, where } from 'firebase/firestore'
import { getFirebaseApp } from '../../firebase/app.ts'
import { reviewsPath } from '../../data/paths.ts'
import { reviewInputSchema, reviewSchema, validate } from '../../data/schema/index.ts'
import type { Review, ReviewInput } from '../../data/types.ts'
import type { ReviewStatus } from '../../data/enums.ts'

const db = getFirestore(getFirebaseApp())
export type ReviewRecord = Review & { id: string }

export async function listReviews(admin = false): Promise<{ items: ReviewRecord[]; invalidCount: number }> {
  const q = admin ? query(collection(db, reviewsPath()), orderBy('order')) : query(collection(db, reviewsPath()), where('status', '==', 'published'), orderBy('order'))
  const snapshot = await getDocs(q)
  let invalidCount = 0
  const items = snapshot.docs.flatMap(item => {
    const parsed = validate(reviewSchema, item.data(), item.ref.path)
    if (!parsed.ok) { invalidCount += 1; return [] }
    return [{ ...parsed.value, id: item.id }]
  })
  return { items, invalidCount }
}

export async function saveReview(id: string, input: ReviewInput, expectedUpdatedAt?: Review['updatedAt']): Promise<void> {
  if (!validate(reviewInputSchema, input, 'review').ok) throw new Error('INVALID_REVIEW')
  if (input.status !== 'published') input = { ...input, publishedAt: null }
  await runTransaction(db, async transaction => {
    const reference = doc(db, reviewsPath(), id)
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists()) {
      if (input.status !== 'pending') throw new Error('NEW_REVIEW_MUST_START_PENDING')
      transaction.set(reference, { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      return
    }
    const current = validate(reviewSchema, snapshot.data(), reference.path)
    if (!current.ok) throw new Error('INVALID_STORED_REVIEW')
    if (expectedUpdatedAt && !current.value.updatedAt.isEqual(expectedUpdatedAt)) throw new Error('CONCURRENT_REVIEW_EDIT')
    if (input.status !== current.value.status) {
      const allowed = (current.value.status === 'pending' && input.status === 'approved') ||
        (current.value.status === 'approved' && input.status === 'published') ||
        (current.value.status === 'published' && input.status === 'approved')
      if (!allowed) throw new Error('INVALID_REVIEW_TRANSITION')
    }
    const publicationTimestamp =
      input.status !== 'published'
        ? null
        : current.value.status === 'published'
          ? current.value.publishedAt
          : serverTimestamp()
    transaction.update(reference, {
      ...input,
      publishedAt: publicationTimestamp,
      updatedAt: serverTimestamp(),
    })
  })
}

export async function changeReviewStatus(id: string, status: ReviewStatus, expectedUpdatedAt: Review['updatedAt']): Promise<void> {
  await runTransaction(db, async transaction => {
    const reference = doc(db, reviewsPath(), id)
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists()) throw new Error('REVIEW_NOT_FOUND')
    const current = validate(reviewSchema, snapshot.data(), reference.path)
    if (!current.ok) throw new Error('INVALID_STORED_REVIEW')
    if (!current.value.updatedAt.isEqual(expectedUpdatedAt)) throw new Error('CONCURRENT_REVIEW_EDIT')
    const allowed = status === current.value.status ||
      (current.value.status === 'pending' && status === 'approved') ||
      (current.value.status === 'approved' && status === 'published') ||
      (current.value.status === 'published' && status === 'approved')
    if (!allowed) throw new Error('INVALID_REVIEW_TRANSITION')
    transaction.update(reference, { status, publishedAt: status === 'published' ? serverTimestamp() : null, updatedAt: serverTimestamp() })
  })
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, reviewsPath(), id))
}
