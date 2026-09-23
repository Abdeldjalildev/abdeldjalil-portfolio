import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  contactLinkSchema,
  profileSchema,
  projectSchema,
  reviewSchema,
  serviceSchema,
  siteSettingsSchema,
  skillSchema,
  validate,
} from '../src/data/schema/index.ts'
import { STORAGE_LIMITS } from '../src/data/paths.ts'

const NOW = { seconds: 1_760_000_000, nanoseconds: 0 }

function timestamps() {
  return { createdAt: NOW, updatedAt: NOW }
}

function localized(en: string, ar = '') {
  return { en, ar }
}

function validProfile() {
  return {
    ...timestamps(),
    fullName: localized('Abdeldjalil'),
    headline: localized('Frontend engineer'),
    bio: localized('Portfolio bio'),
    avatarPath: null,
    resumePath: null,
    published: true,
  }
}

function validSettings() {
  return {
    ...timestamps(),
    siteTitle: localized('Portfolio'),
    siteDescription: localized('Description'),
    defaultLocale: 'en',
    featuredProjectId: null,
  }
}

function validProject() {
  return {
    ...timestamps(),
    title: localized('Project'),
    slug: 'project',
    summary: localized('Summary'),
    description: localized('Description'),
    caseStudy: null,
    technologies: ['React', 'TypeScript'],
    category: 'frontend',
    thumbnailPath: 'projects/project/thumbnail/cover.webp',
    galleryPaths: [],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com/example/project',
    links: [{ label: localized('Demo'), url: 'https://example.com/demo' }],
    seo: { title: localized('Project'), description: localized('SEO description') },
    published: true,
    order: 1,
  }
}

function validService() {
  return {
    ...timestamps(),
    title: localized('Service'),
    slug: 'web-development',
    summary: localized('Summary'),
    description: localized('Description'),
    iconPath: null,
    published: true,
    order: 1,
  }
}

function validSkill() {
  return {
    ...timestamps(),
    name: 'React',
    group: 'frontend',
    iconPath: null,
    published: true,
    order: 1,
  }
}

function validReview() {
  return {
    ...timestamps(),
    reviewerName: 'Client',
    reviewerRole: localized('Founder'),
    rating: 5,
    content: localized('Excellent work'),
    avatarPath: null,
    relatedServiceId: 'web-development',
    relatedProjectId: 'project',
    status: 'published',
    publishedAt: NOW,
    order: 1,
  }
}

function validContactLink() {
  return {
    ...timestamps(),
    type: 'github',
    label: localized('GitHub'),
    value: 'https://github.com/example',
    published: true,
    order: 1,
  }
}

test('all canonical document schemas accept representative valid documents', () => {
  const cases = [
    ['profile', profileSchema, validProfile()],
    ['settings', siteSettingsSchema, validSettings()],
    ['projects', projectSchema, validProject()],
    ['services', serviceSchema, validService()],
    ['skills', skillSchema, validSkill()],
    ['reviews', reviewSchema, validReview()],
    ['contactLinks', contactLinkSchema, validContactLink()],
  ] as const

  for (const [name, schema, value] of cases) {
    const result = validate(schema, value, name)
    assert.equal(result.ok, true, name + ' should accept the representative document')
  }
})

test('schemas reject structural and security-sensitive malformed values', () => {
  const badProject = { ...validProject(), title: { en: 'Only English' } }
  assert.equal(validate(projectSchema, badProject, 'project').ok, false)

  const extraField = { ...validProject(), isAdmin: true }
  assert.equal(validate(projectSchema, extraField, 'project').ok, false)

  const badUrl = { ...validProject(), liveUrl: 'javascript:alert(1)' }
  assert.equal(validate(projectSchema, badUrl, 'project').ok, false)

  const badMedia = { ...validProject(), thumbnailPath: '../secret.webp' }
  assert.equal(validate(projectSchema, badMedia, 'project').ok, false)
  const tooManyGalleryImages = { ...validProject(), galleryPaths: Array.from({ length: 13 }, (_, index) => `projects/project/gallery/${index}.webp`) }
  assert.equal(validate(projectSchema, tooManyGalleryImages, 'project').ok, false)

  const tooManyProjectLinks = { ...validProject(), links: Array.from({ length: 11 }, (_, index) => ({ label: localized(`Link ${index}`), url: 'https://example.com' })) }
  assert.equal(validate(projectSchema, tooManyProjectLinks, 'project').ok, false)

  const badRating = { ...validReview(), rating: 6 }
  assert.equal(validate(reviewSchema, badRating, 'review').ok, false)

  const badTimestamp = { ...validProfile(), createdAt: { seconds: 'now', nanoseconds: 0 } }
  assert.equal(validate(profileSchema, badTimestamp, 'profile').ok, false)

  const badContact = { ...validContactLink(), value: 'javascript:alert(1)' }
  assert.equal(validate(contactLinkSchema, badContact, 'contact').ok, false)
})

test('storage limits remain represented in the Storage rules contract', () => {
  const rules = readFileSync(
    fileURLToPath(new URL('../storage.rules', import.meta.url)),
    'utf8',
  )

  for (const [name, bytes] of Object.entries(STORAGE_LIMITS)) {
    assert.ok(
      rules.includes(String(bytes)),
      'storage limit ' + name + '=' + bytes + ' must be represented in storage.rules',
    )
  }
})
