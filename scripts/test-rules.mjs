#!/usr/bin/env node
/**
 * Phase 05 — deterministic Firebase Security Rules verification.
 *
 * Runs against the Firebase Emulator Suite only. It never touches the real
 * project and creates no production data. Run it with:
 *
 *   npm run test:rules
 *
 * WHAT THIS PROVES
 *   Actual allow/deny behaviour for representative actors (anonymous,
 *   authenticated non-admin, authenticated admin) against the real ruleset.
 *   It complements the runtime document schemas: rules enforce security and
 *   structural invariants; src/data/schema enforces the application-level shape.
 *
 * HONESTY
 *   A failing expectation fails the script (non-zero exit). Denials only count
 *   as proof when Firestore/Storage actually reports `permission-denied` — any
 *   other error is reported as ERROR, so a crashing rule can never masquerade as
 *   a correctly denied one.
 */
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getBytes, listAll, ref, uploadBytes } from 'firebase/storage'

const PROJECT_ID = 'abdeldjalil-portfolio'

// Denials are the expected outcome for much of this suite, so the SDK's
// per-request PERMISSION_DENIED logging is silenced. The result table is the
// evidence, and an unexpected error still fails its own row.
setLogLevel('silent')

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
    host: '127.0.0.1',
    port: 8080,
  },
  storage: {
    rules: readFileSync('storage.rules', 'utf8'),
    host: '127.0.0.1',
    port: 9199,
  },
})

const results = []

function code(error) {
  return String(error?.code ?? error?.message ?? error)
}

function record(label, expected, outcome, ok, detail) {
  results.push({ label, expected, outcome, ok, detail })
}

async function expectAllow(label, run) {
  try {
    await run()
    record(label, 'ALLOW', 'ALLOW', true)
  } catch (error) {
    record(label, 'ALLOW', 'DENY', false, code(error))
  }
}

async function expectDeny(label, run) {
  try {
    await run()
    record(label, 'DENY', 'ALLOW', false, 'operation unexpectedly succeeded')
  } catch (error) {
    const c = code(error)
    // Firestore reports `permission-denied`; the Storage SDK reports
    // `storage/unauthorized`. Both mean the rules refused the operation.
    if (c.includes('permission-denied') || c.includes('storage/unauthorized')) {
      record(label, 'DENY', 'DENY', true)
    } else {
      record(label, 'DENY', `ERROR(${c})`, false, 'expected a rules denial')
    }
  }
}

/**
 * Records an observed ALLOW that is a DECLARED LIMITATION of the rules language
 * rather than a security hole. The limitation text is printed with the result so
 * it cannot be mistaken for a passing security assertion, and it is repeated in
 * the phase report.
 */
async function expectAllowDocumented(label, limitation, run) {
  try {
    await run()
    record(label, 'ALLOW (documented limitation)', 'ALLOW', true, limitation)
  } catch (error) {
    record(
      label,
      'ALLOW (documented limitation)',
      'DENY',
      false,
      `behaviour changed: now denied (${code(error)}) - update the contract note`,
    )
  }
}

// ---------------------------------------------------------------- fixtures
const NOW = Timestamp.now()
/**
 * A clearly backdated timestamp, used for the "a client cannot forge
 * timestamps" cases instead of Timestamp.now(). Timestamp.now() can legitimately
 * fall in the same millisecond as request.time, which would make the assertion
 * depend on timing rather than on the rule.
 */
const BACKDATED = Timestamp.fromMillis(Date.now() - 60000)
const localized = (en, ar = '') => ({ en, ar })

function validProject(slug, overrides = {}) {
  return {
    title: localized(`${slug} title`),
    slug,
    summary: localized(`${slug} summary`),
    description: localized(`${slug} description`),
    caseStudy: localized(`${slug} case study`),
    technologies: ['React', 'Firestore'],
    category: 'web-app',
    thumbnailPath: `projects/${slug}/thumbnail/cover.webp`,
    galleryPaths: [`projects/${slug}/gallery/one.webp`],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com/example/repo',
    links: [{ label: localized('Docs'), url: 'https://example.com/docs' }],
    seo: { title: localized('SEO title'), description: null },
    published: true,
    order: 1,
    ...overrides,
  }
}

function validReview(overrides = {}) {
  return {
    reviewerName: 'Client Name',
    reviewerRole: localized('CTO'),
    rating: 5,
    content: localized('Great work'),
    avatarPath: null,
    relatedServiceId: null,
    relatedProjectId: null,
    status: 'pending',
    order: 1,
    publishedAt: null,
    ...overrides,
  }
}

function validProfile(overrides = {}) {
  return {
    fullName: localized('Abdeldjalil'),
    headline: localized('Frontend engineer'),
    bio: localized('Bio'),
    avatarPath: null,
    resumePath: null,
    published: true,
    ...overrides,
  }
}

function validSettings(overrides = {}) {
  return {
    siteTitle: localized('Portfolio'),
    siteDescription: localized('Description'),
    defaultLocale: 'en',
    featuredProjectId: null,
    ...overrides,
  }
}

function validService(serviceId, overrides = {}) {
  return {
    title: localized('Service'),
    slug: serviceId,
    summary: localized('Summary'),
    description: localized('Description'),
    iconPath: null,
    order: 1,
    published: true,
    ...overrides,
  }
}

function validSkill(overrides = {}) {
  return {
    name: 'React',
    group: 'frontend',
    iconPath: null,
    order: 1,
    published: true,
    ...overrides,
  }
}

function validContactLink(overrides = {}) {
  return {
    type: 'github',
    label: localized('GitHub'),
    value: 'https://github.com/example',
    published: true,
    order: 1,
    ...overrides,
  }
}

// Seed fixtures with rules disabled — this is setup, not a rules assertion.
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore()
  const seeded = { createdAt: NOW, updatedAt: NOW }

  await setDoc(doc(db, 'projects', 'published-project'), {
    ...validProject('published-project'),
    ...seeded,
  })
  await setDoc(doc(db, 'projects', 'draft-project'), {
    ...validProject('draft-project', { published: false }),
    ...seeded,
  })
  await setDoc(doc(db, 'profile', 'main'), { ...validProfile(), ...seeded })
  await setDoc(doc(db, 'profile', 'hidden'), {
    ...validProfile({ published: false }),
    ...seeded,
  })
  await setDoc(doc(db, 'settings', 'main'), { ...validSettings(), ...seeded })
  await setDoc(doc(db, 'reviews', 'published-review'), {
    ...validReview({ status: 'published', publishedAt: NOW }),
    ...seeded,
  })
  await setDoc(doc(db, 'reviews', 'approved-review'), {
    ...validReview({ status: 'approved' }),
    ...seeded,
  })
  await setDoc(doc(db, 'reviews', 'pending-review'), { ...validReview(), ...seeded })
  await setDoc(doc(db, 'services', 'web-development'), {
    ...validService('web-development'),
    ...seeded,
  })
  await setDoc(doc(db, 'skills', 'react'), { ...validSkill(), ...seeded })
  await setDoc(doc(db, 'contactLinks', 'github'), { ...validContactLink(), ...seeded })

  // A collection that no rule matches at all.
  await setDoc(doc(db, 'secretInternal', 'x'), { value: 1 })

  // Storage fixtures used by the read/deny checks.
  await uploadBytes(
    ref(ctx.storage(), 'profile/avatar/seeded.png'),
    new Uint8Array([1, 2, 3]),
    { contentType: 'image/png' },
  )
  await uploadBytes(
    ref(ctx.storage(), 'drafts/project-published-project-thumbnail/wip.webp'),
    new Uint8Array([1, 2, 3]),
    { contentType: 'image/webp' },
  )
})

// ------------------------------------------------------------ actor contexts
const anon = testEnv.unauthenticatedContext()
const nonAdmin = testEnv.authenticatedContext('user-1', {})
const admin = testEnv.authenticatedContext('admin-1', { admin: true })

const anonDb = anon.firestore()
const userDb = nonAdmin.firestore()
const adminDb = admin.firestore()

// =========================================================================
// A. PUBLIC READ CASES
// =========================================================================
await expectAllow('anon read published project', () =>
  getDoc(doc(anonDb, 'projects/published-project')),
)
await expectDeny('anon read unpublished project', () =>
  getDoc(doc(anonDb, 'projects/draft-project')),
)
await expectAllow('anon read published profile (profile/main)', () =>
  getDoc(doc(anonDb, 'profile/main')),
)
await expectDeny('anon read unpublished profile (profile/hidden)', () =>
  getDoc(doc(anonDb, 'profile/hidden')),
)
await expectAllow('anon read public site settings', () =>
  getDoc(doc(anonDb, 'settings/main')),
)
await expectAllow('anon read published review', () =>
  getDoc(doc(anonDb, 'reviews/published-review')),
)
await expectDeny('anon read pending review', () =>
  getDoc(doc(anonDb, 'reviews/pending-review')),
)
await expectDeny('anon read approved-but-unpublished review', () =>
  getDoc(doc(anonDb, 'reviews/approved-review')),
)
await expectAllow('anon read published service', () =>
  getDoc(doc(anonDb, 'services/web-development')),
)
await expectAllow('anon read published skill', () => getDoc(doc(anonDb, 'skills/react')))
await expectAllow('anon read published contact link', () =>
  getDoc(doc(anonDb, 'contactLinks/github')),
)
await expectAllow('anon list projects filtered to published (query contract)', () =>
  getDocs(query(collection(anonDb, 'projects'), where('published', '==', true), orderBy('order'))),
)
await expectDeny('anon list projects without the published filter', () =>
  getDocs(query(collection(anonDb, 'projects'), orderBy('order'))),
)

// =========================================================================
// B. ANONYMOUS AND NON-ADMIN WRITES — must all be denied
// =========================================================================
await expectDeny('anon create project', () =>
  setDoc(doc(anonDb, 'projects/anon-project'), {
    ...validProject('anon-project'),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('anon write site settings', () =>
  updateDoc(doc(anonDb, 'settings/main'), {
    featuredProjectId: 'published-project',
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('non-admin create project', () =>
  setDoc(doc(userDb, 'projects/user-project'), {
    ...validProject('user-project'),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('non-admin update published project', () =>
  updateDoc(doc(userDb, 'projects/published-project'), {
    published: false,
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('non-admin write site settings', () =>
  updateDoc(doc(userDb, 'settings/main'), {
    siteTitle: localized('Owned'),
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('non-admin write private collection (would-be admin config)', () =>
  setDoc(doc(userDb, 'adminOnlyConfig/x'), { value: 1 }),
)

// =========================================================================
// C. UNKNOWN PATHS — deny by default
// =========================================================================
await expectDeny('anon read unknown collection', () =>
  getDoc(doc(anonDb, 'secretInternal/x')),
)
await expectDeny('anon write unknown collection', () =>
  setDoc(doc(anonDb, 'secretInternal/y'), { value: 2 }),
)
await expectDeny('non-admin read unknown collection', () =>
  getDoc(doc(userDb, 'secretInternal/x')),
)
await expectDeny('non-admin write unknown collection', () =>
  setDoc(doc(userDb, 'secretInternal/z'), { value: 3 }),
)
await expectDeny('anon read unmatched singleton document (profile/other)', () =>
  getDoc(doc(anonDb, 'profile/other')),
)

// =========================================================================
// D. ADMIN CASES — authenticated with the Phase 04 { admin: true } claim
// =========================================================================
await expectAllow('admin read unpublished project', () =>
  getDoc(doc(adminDb, 'projects/draft-project')),
)
await expectAllow('admin list all projects (no published filter needed)', () =>
  getDocs(query(collection(adminDb, 'projects'), orderBy('order'))),
)
await expectAllow('admin read pending review', () =>
  getDoc(doc(adminDb, 'reviews/pending-review')),
)
await expectAllow('admin create valid project', () =>
  setDoc(doc(adminDb, 'projects/new-project'), {
    ...validProject('new-project'),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin update project (slug unchanged)', () =>
  updateDoc(doc(adminDb, 'projects/new-project'), {
    published: false,
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin delete project', () =>
  deleteDoc(doc(adminDb, 'projects/new-project')),
)
await expectAllow('admin set featuredProjectId (single-source-of-truth field)', () =>
  updateDoc(doc(adminDb, 'settings/main'), {
    featuredProjectId: 'published-project',
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin feature an unpublished project', () =>
  updateDoc(doc(adminDb, 'settings/main'), {
    featuredProjectId: 'draft-project',
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin unpublish the currently featured project', () =>
  updateDoc(doc(adminDb, 'projects/published-project'), {
    published: false,
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin delete the currently featured project', () =>
  deleteDoc(doc(adminDb, 'projects/published-project')),
)
await expectAllow('admin update profile content', () =>
  updateDoc(doc(adminDb, 'profile/main'), {
    headline: localized('Senior frontend engineer'),
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin create review as pending with publishedAt null', () =>
  setDoc(doc(adminDb, 'reviews/new-review'), {
    ...validReview(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin publish a pending review directly', () =>
  updateDoc(doc(adminDb, 'reviews/new-review'), {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin approve a pending review (pending -> approved)', () =>
  updateDoc(doc(adminDb, 'reviews/new-review'), {
    status: 'approved',
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin publish an approved review (approved -> published)', () =>
  updateDoc(doc(adminDb, 'reviews/new-review'), {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin unpublish a review (published -> approved)', () =>
  updateDoc(doc(adminDb, 'reviews/new-review'), {
    status: 'approved',
    publishedAt: null,
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin create valid service', () =>
  setDoc(doc(adminDb, 'services/new-service'), {
    ...validService('new-service'),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin create valid skill', () =>
  setDoc(doc(adminDb, 'skills/new-skill'), {
    ...validSkill(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)
await expectAllow('admin create valid contact link', () =>
  setDoc(doc(adminDb, 'contactLinks/new-link'), {
    ...validContactLink(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
)

// =========================================================================
// E. WRITE VALIDATION — admin, but malformed payloads must be rejected
// =========================================================================
const withStamps = (data) => ({
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

await expectDeny('admin create project where slug != document id', () =>
  setDoc(doc(adminDb, 'projects/mismatch'), withStamps(validProject('other-slug'))),
)
await expectDeny('admin create project with a non-slug-shaped document id', () =>
  setDoc(doc(adminDb, 'projects/Bad_Id'), withStamps(validProject('Bad_Id'))),
)
await expectDeny('admin create project with an unexpected extra field', () =>
  setDoc(
    doc(adminDb, 'projects/extra-field'),
    withStamps({ ...validProject('extra-field'), isAdmin: true }),
  ),
)
await expectDeny('admin create project with order as a string', () =>
  setDoc(doc(adminDb, 'projects/bad-order'), withStamps(validProject('bad-order', { order: '1' }))),
)
await expectDeny('admin create project with a non-https liveUrl', () =>
  setDoc(
    doc(adminDb, 'projects/bad-url'),
    withStamps(validProject('bad-url', { liveUrl: 'javascript:alert(1)' })),
  ),
)
await expectDeny('admin create project with localized text missing the ar key', () =>
  setDoc(
    doc(adminDb, 'projects/bad-locale'),
    withStamps(validProject('bad-locale', { title: { en: 'Only English' } })),
  ),
)
await expectDeny('admin create project with an empty en translation', () =>
  setDoc(
    doc(adminDb, 'projects/empty-en'),
    withStamps(validProject('empty-en', { title: localized('') })),
  ),
)
// DELIBERATELY recorded as an observation, not a security pass.
await expectAllowDocumented(
  'admin create project with a non-string technology entry',
  'Firestore rules cannot type-check individual list elements; join() coerces. Rejected by src/data/schema (verified separately).',
  () =>
    setDoc(
      doc(adminDb, 'projects/bad-tech'),
      withStamps(validProject('bad-tech', { technologies: ['React', 123] })),
    ),
)
await expectDeny('admin create project with a backdated client createdAt', () =>
  setDoc(doc(adminDb, 'projects/bad-created'), {
    ...validProject('bad-created'),
    createdAt: BACKDATED,
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin create project with a media path containing traversal', () =>
  setDoc(
    doc(adminDb, 'projects/bad-media'),
    withStamps(validProject('bad-media', { thumbnailPath: 'projects/../../secret.webp' })),
  ),
)
await expectDeny('admin create project with seo missing the description key', () =>
  setDoc(
    doc(adminDb, 'projects/bad-seo'),
    withStamps(validProject('bad-seo', { seo: { title: localized('t') } })),
  ),
)
await expectDeny('admin update project changing the slug (immutable)', () =>
  updateDoc(doc(adminDb, 'projects/published-project'), {
    slug: 'renamed-slug',
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin update project with a backdated client updatedAt', () =>
  updateDoc(doc(adminDb, 'projects/published-project'), {
    order: 2,
    updatedAt: BACKDATED,
  }),
)
await expectDeny('admin move an approved review back to pending', () =>
  updateDoc(doc(adminDb, 'reviews/new-review'), {
    status: 'pending',
    publishedAt: null,
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin create contact link with javascript target', () =>
  setDoc(doc(adminDb, 'contactLinks/bad-target'), withStamps(validContactLink({ type: 'github', value: 'javascript:alert(1)' }))),
)
await expectDeny('admin create contact link with invalid phone target', () =>
  setDoc(doc(adminDb, 'contactLinks/bad-phone'), withStamps(validContactLink({ type: 'phone', value: 'not-a-phone' }))),
)
await expectDeny('admin create review with rating 6', () =>
  setDoc(doc(adminDb, 'reviews/bad-rating-high'), withStamps(validReview({ rating: 6 }))),
)
await expectDeny('admin create review with rating 0', () =>
  setDoc(doc(adminDb, 'reviews/bad-rating-low'), withStamps(validReview({ rating: 0 }))),
)
await expectDeny('admin create review with a non-integer rating', () =>
  setDoc(doc(adminDb, 'reviews/bad-rating-type'), withStamps(validReview({ rating: '5' }))),
)
await expectDeny('admin create pending review that already has publishedAt', () =>
  setDoc(
    doc(adminDb, 'reviews/bad-publishedat'),
    withStamps(validReview({ status: 'pending', publishedAt: NOW })),
  ),
)
await expectDeny('admin create review with an unknown status', () =>
  setDoc(doc(adminDb, 'reviews/bad-status'), withStamps(validReview({ status: 'archived' }))),
)
await expectDeny('admin create settings with an unsupported defaultLocale', () =>
  setDoc(
    doc(adminDb, 'settings/other'),
    withStamps(validSettings({ defaultLocale: 'fr' })),
  ),
)
await expectDeny('admin set a non-slug featuredProjectId', () =>
  updateDoc(doc(adminDb, 'settings/main'), {
    featuredProjectId: 'Not A Slug',
    updatedAt: serverTimestamp(),
  }),
)
await expectDeny('admin create skill with an unknown group', () =>
  setDoc(doc(adminDb, 'skills/bad-group'), withStamps(validSkill({ group: 'marketing' }))),
)
await expectDeny('admin create service where slug != document id', () =>
  setDoc(doc(adminDb, 'services/mismatch'), withStamps(validService('different-slug'))),
)
await expectDeny('admin create contact link with an unknown type', () =>
  setDoc(
    doc(adminDb, 'contactLinks/bad-type'),
    withStamps(validContactLink({ type: 'myspace' })),
  ),
)
await expectDeny('admin delete settings/main (singleton must always exist)', () =>
  deleteDoc(doc(adminDb, 'settings/main')),
)
await expectDeny('admin delete profile/main (singleton must always exist)', () =>
  deleteDoc(doc(adminDb, 'profile/main')),
)

// =========================================================================
// F. STORAGE
// =========================================================================
const anonStorage = anon.storage()
const userStorage = nonAdmin.storage()
const adminStorage = admin.storage()

const png = (bytes = 8) => ({ contentType: 'image/png', data: new Uint8Array(bytes) })

await expectAllow('anon get a public avatar object', () =>
  getBytes(ref(anonStorage, 'profile/avatar/seeded.png')),
)
await expectDeny('anon get a drafts object (staging is admin-only)', () =>
  getBytes(ref(anonStorage, 'drafts/project-published-project-thumbnail/wip.webp')),
)
await expectDeny('anon list a public projects folder (get is public, list is not)', () =>
  listAll(ref(anonStorage, 'projects/published-project/thumbnail')),
)
await expectAllow('admin upload a valid profile avatar (image/png)', () =>
  uploadBytes(ref(adminStorage, 'profile/avatar/new.png'), png().data, {
    contentType: png().contentType,
  }),
)
await expectDeny('admin upload an SVG as an avatar (active content refused)', () =>
  uploadBytes(ref(adminStorage, 'profile/avatar/evil.svg'), new Uint8Array(8), {
    contentType: 'image/svg+xml',
  }),
)
await expectDeny('admin upload a PNG as the resume (wrong content type)', () =>
  uploadBytes(ref(adminStorage, 'profile/resume/cv.png'), png().data, {
    contentType: png().contentType,
  }),
)
await expectAllow('admin upload a PDF resume', () =>
  uploadBytes(ref(adminStorage, 'profile/resume/cv.pdf'), new Uint8Array(8), {
    contentType: 'application/pdf',
  }),
)
await expectDeny('admin upload a skill icon above the 512KB ceiling', () =>
  uploadBytes(ref(adminStorage, 'skills/react/icon/big.png'), new Uint8Array(600 * 1024), {
    contentType: 'image/png',
  }),
)
await expectAllow('admin upload a project thumbnail', () =>
  uploadBytes(
    ref(adminStorage, 'projects/published-project/thumbnail/cover.webp'),
    new Uint8Array(8),
    { contentType: 'image/webp' },
  ),
)
await expectDeny('admin upload a file whose name starts with a dot', () =>
  uploadBytes(
    ref(adminStorage, 'projects/published-project/thumbnail/.hidden.png'),
    png().data,
    { contentType: png().contentType },
  ),
)
await expectDeny('non-admin upload a profile avatar', () =>
  uploadBytes(ref(userStorage, 'profile/avatar/user.png'), png().data, {
    contentType: png().contentType,
  }),
)
await expectDeny('anon upload a profile avatar', () =>
  uploadBytes(ref(anonStorage, 'profile/avatar/anon.png'), png().data, {
    contentType: png().contentType,
  }),
)
await expectDeny('non-admin read a drafts object', () =>
  getBytes(ref(userStorage, 'drafts/project-published-project-thumbnail/wip.webp')),
)
await expectAllow('admin read a drafts object', () =>
  getBytes(ref(adminStorage, 'drafts/project-published-project-thumbnail/wip.webp')),
)
await expectDeny('admin upload to an uncontracted storage path', () =>
  uploadBytes(ref(adminStorage, 'misc/random.png'), png().data, {
    contentType: png().contentType,
  }),
)
await expectDeny('admin upload SVG into a project staging path', () =>
  uploadBytes(ref(adminStorage, 'drafts/project-published-project-thumbnail/evil.svg'), new Uint8Array(8), {
    contentType: 'image/svg+xml',
  }),
)
await expectDeny('admin upload a PDF into an image-only project staging path', () =>
  uploadBytes(ref(adminStorage, 'drafts/project-published-project-thumbnail/file.pdf'), new Uint8Array(8), {
    contentType: 'application/pdf',
  }),
)

// =========================================================================
// RESULTS
// =========================================================================
console.log('')
console.log('| # | Expectation | Expected | Observed | Result |')
console.log('| --- | --- | --- | --- | --- |')
results.forEach((r, i) => {
  const detail = r.detail ? ` (${r.detail})` : ''
  console.log(
    `| ${i + 1} | ${r.label} | ${r.expected} | ${r.outcome}${detail} | ${r.ok ? 'PASS' : 'FAIL'} |`,
  )
})

const failed = results.filter((r) => !r.ok)
console.log('')
console.log(`TOTAL=${results.length} PASS=${results.length - failed.length} FAIL=${failed.length}`)

if (failed.length > 0) {
  console.log('\nFailures:')
  failed.forEach((r) => console.log(`  - ${r.label}: expected ${r.expected}, got ${r.outcome}`))
}

await testEnv.cleanup()
process.exit(failed.length === 0 ? 0 : 1)
