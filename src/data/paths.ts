/**
 * Phase 05 — canonical Firestore and Storage path contract.
 *
 * Pure string builders with no Firebase runtime import, so the contract can be
 * inspected and verified without initialising an SDK. Phase 07+ wraps these in
 * collection()/doc()/ref() calls and must not invent its own paths.
 */

export const COLLECTIONS = {
  profile: 'profile',
  settings: 'settings',
  projects: 'projects',
  services: 'services',
  skills: 'skills',
  reviews: 'reviews',
  contactLinks: 'contactLinks',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]

/**
 * Documents that exist exactly once under a fixed id. Any other id in these
 * collections is unmatched by the security rules and therefore denied.
 */
export const SINGLETON_IDS = {
  profile: 'main',
  settings: 'main',
} as const

export const MAX_SLUG_LENGTH = 80
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Slug validity. `projects` and `services` document ids ARE slugs, so this is
 * also the document-id validity rule for those collections.
 */
export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= MAX_SLUG_LENGTH && SLUG_PATTERN.test(value)
}

// ------------------------------------------------------------- Firestore paths
export function profilePath(): string {
  return `${COLLECTIONS.profile}/${SINGLETON_IDS.profile}`
}

export function settingsPath(): string {
  return `${COLLECTIONS.settings}/${SINGLETON_IDS.settings}`
}

export function projectsPath(): string {
  return COLLECTIONS.projects
}

/** The project document id IS the slug, so this is also the public URL segment. */
export function projectPath(slug: string): string {
  return `${COLLECTIONS.projects}/${slug}`
}

export function servicesPath(): string {
  return COLLECTIONS.services
}

export function servicePath(slug: string): string {
  return `${COLLECTIONS.services}/${slug}`
}

export function skillsPath(): string {
  return COLLECTIONS.skills
}

export function reviewsPath(): string {
  return COLLECTIONS.reviews
}

export function contactLinksPath(): string {
  return COLLECTIONS.contactLinks
}

// --------------------------------------------------------------- Storage paths
export const STORAGE_ROOTS = {
  drafts: 'drafts',
  profile: 'profile',
  projects: 'projects',
  services: 'services',
  skills: 'skills',
  reviews: 'reviews',
} as const

/**
 * Staging area for media that must not be public before publication.
 * Storage rules cannot read the referencing Firestore document, so anything
 * uploaded for unpublished content stays here (admin-only) until it is published.
 */
export function draftObjectPath(scope: string, fileName: string): string {
  return `${STORAGE_ROOTS.drafts}/${scope}/${fileName}`
}

export function profileAvatarObjectPath(fileName: string): string {
  return `${STORAGE_ROOTS.profile}/avatar/${fileName}`
}

export function profileResumeObjectPath(fileName: string): string {
  return `${STORAGE_ROOTS.profile}/resume/${fileName}`
}

export function projectThumbnailObjectPath(projectId: string, fileName: string): string {
  return `${STORAGE_ROOTS.projects}/${projectId}/thumbnail/${fileName}`
}

export function projectGalleryObjectPath(projectId: string, fileName: string): string {
  return `${STORAGE_ROOTS.projects}/${projectId}/gallery/${fileName}`
}

export function serviceIconObjectPath(serviceId: string, fileName: string): string {
  return `${STORAGE_ROOTS.services}/${serviceId}/icon/${fileName}`
}

export function skillIconObjectPath(skillId: string, fileName: string): string {
  return `${STORAGE_ROOTS.skills}/${skillId}/icon/${fileName}`
}

export function reviewAvatarObjectPath(reviewId: string, fileName: string): string {
  return `${STORAGE_ROOTS.reviews}/${reviewId}/avatar/${fileName}`
}

// ------------------------------------------------------- media contract limits
/**
 * Upload ceilings. These MUST stay identical to the numbers in storage.rules —
 * they are asserted equal by scripts/test-schema.ts so the two layers can never
 * silently drift apart.
 */
export const STORAGE_LIMITS = {
  profileAvatar: 2 * 1024 * 1024,
  profileResume: 10 * 1024 * 1024,
  projectThumbnail: 5 * 1024 * 1024,
  projectGallery: 5 * 1024 * 1024,
  serviceIcon: 1024 * 1024,
  skillIcon: 512 * 1024,
  reviewAvatar: 2 * 1024 * 1024,
} as const

/**
 * Accepted content types. Mirrors storage.rules.
 * SVG is deliberately excluded: an uploaded SVG is an active document, so
 * serving one from the site origin is a script-injection vector. Site icons are
 * inline SVG in the app, not uploaded media.
 */
export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
] as const

export const ALLOWED_DOCUMENT_CONTENT_TYPES = ['application/pdf'] as const
