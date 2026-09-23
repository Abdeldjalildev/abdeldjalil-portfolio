/**
 * Phase 05 — runtime schemas for every canonical document (v1 contract).
 *
 * Each schema is authored as an *input* shape (everything except the
 * server-managed timestamps) and the document schema is derived with
 * withTimestamps(), so an input schema and its document schema can never drift.
 *
 * These mirror firestore.rules exactly on field names and closed value sets, so
 * a document that passes one layer does not fail the other for a structural
 * reason. The rules remain the security boundary; this layer is the fuller
 * application-level shape check and the layer that the CMS will run payloads
 * through before writing.
 */
import {
  CONTACT_LINK_TYPES,
  LOCALES,
  MAX_RATING,
  MIN_RATING,
  REVIEW_STATUSES,
  SKILL_GROUPS,
} from '../enums.ts'
import {
  boolean,
  httpsUrl,
  integer,
  list,
  localized,
  mediaPath,
  nullable,
  object,
  oneOf,
  slug,
  string,
  timestamp,
  withTimestamps,
} from './core.ts'
import type { ObjectParser, Parser } from './core.ts'
import type {
  ContactLink,
  Profile,
  Project,
  Review,
  Service,
  SiteSettings,
  Skill,
} from '../types.ts'

/** Display-ordering field, shared by every ordered collection. */
const orderField = integer({ min: 0, max: 100000 })

/** Reused by every localized field of the same budget. */
const seoTitle = localized(160)

/** { label, url } — an outbound project link. */
const externalLink = object({
  label: localized(120),
  url: httpsUrl(),
})

/** Optional per-document share metadata. */
const seoMetadata = object({
  title: nullable(seoTitle),
  description: nullable(localized(320)),
})

/**
 * Contact link target.
 *
 * A single pattern for the five legitimate target forms: an https:// URL, a
 * mailto: target, a bare email address, a tel: target, or a bare phone number.
 * This blocks javascript:/data: and other scheme abuse. Which of the five is
 * correct for a given `type` is enforced by the Phase 07 form, not here, because
 * it depends on a sibling field.
 */
const CONTACT_LINK_VALUE_PATTERN =
  /^(https:\/\/.+|mailto:[^@\s]+@[^@\s]+\.[^@\s]+|[^@\s]+@[^@\s]+\.[^@\s]+|tel:\+?[0-9][0-9\s-]{4,19}|\+?[0-9][0-9\s-]{4,19})$/

function contactLinkValue(): Parser<string> {
  return string({
    minLength: 1,
    maxLength: 2048,
    pattern: CONTACT_LINK_VALUE_PATTERN,
    patternMessage:
      'must be an https:// URL, a mailto:/tel: target, an email address or a phone number',
  })
}

// ------------------------------------------------------------- input schemas
/** `profile/main` */
export const profileInputSchema = object({
  fullName: localized(120),
  headline: localized(160),
  bio: localized(20000),
  avatarPath: nullable(mediaPath()),
  resumePath: nullable(mediaPath()),
  published: boolean(),
})

/** `settings/main` — public-safe site configuration only. */
export const siteSettingsInputSchema = object({
  siteTitle: localized(160),
  siteDescription: localized(320),
  defaultLocale: oneOf(LOCALES),
  featuredProjectId: nullable(slug()),
})

/** `projects/{slug}` */
export const projectInputSchema = object({
  title: localized(120),
  slug: slug(),
  summary: localized(320),
  description: localized(20000),
  caseStudy: nullable(localized(40000)),
  technologies: list(string({ minLength: 1, maxLength: 60 }), { maxItems: 30 }),
  category: nullable(slug()),
  thumbnailPath: nullable(mediaPath()),
  galleryPaths: list(mediaPath(), { maxItems: 12 }),
  liveUrl: nullable(httpsUrl()),
  repoUrl: nullable(httpsUrl()),
  links: list(externalLink, { maxItems: 10 }),
  seo: seoMetadata,
  published: boolean(),
  order: orderField,
})

/** `services/{slug}` */
export const serviceInputSchema = object({
  title: localized(120),
  slug: slug(),
  summary: localized(320),
  description: localized(20000),
  iconPath: nullable(mediaPath()),
  published: boolean(),
  order: orderField,
})

/** `skills/{skillId}` */
export const skillInputSchema = object({
  name: string({ minLength: 1, maxLength: 60 }),
  group: oneOf(SKILL_GROUPS),
  iconPath: nullable(mediaPath()),
  published: boolean(),
  order: orderField,
})

/** `reviews/{reviewId}` */
export const reviewInputSchema = object({
  reviewerName: string({ minLength: 1, maxLength: 120 }),
  reviewerRole: nullable(localized(160)),
  rating: integer({ min: MIN_RATING, max: MAX_RATING }),
  content: localized(4000),
  avatarPath: nullable(mediaPath()),
  relatedServiceId: nullable(slug()),
  relatedProjectId: nullable(slug()),
  status: oneOf(REVIEW_STATUSES),
  publishedAt: nullable(timestamp()),
  order: orderField,
})

/** `contactLinks/{linkId}` */
export const contactLinkInputSchema = object({
  type: oneOf(CONTACT_LINK_TYPES),
  label: localized(80),
  value: contactLinkValue(),
  published: boolean(),
  order: orderField,
})

// ---------------------------------------------------------- document schemas
/*
 * Annotating the derived schema with the canonical document type is deliberate:
 * it makes TypeScript prove, at build time, that the runtime schema and the
 * declared type describe the same shape. A field rename or type change in one
 * layer without the other becomes a compile error rather than a silent drift.
 */
export const profileSchema: ObjectParser<Profile> = withTimestamps(profileInputSchema)
export const siteSettingsSchema: ObjectParser<SiteSettings> =
  withTimestamps(siteSettingsInputSchema)
export const projectSchema: ObjectParser<Project> = withTimestamps(projectInputSchema)
export const serviceSchema: ObjectParser<Service> = withTimestamps(serviceInputSchema)
export const skillSchema: ObjectParser<Skill> = withTimestamps(skillInputSchema)
export const reviewSchema: ObjectParser<Review> = withTimestamps(reviewInputSchema)
export const contactLinkSchema: ObjectParser<ContactLink> =
  withTimestamps(contactLinkInputSchema)

/**
 * Collection name -> document schema.
 * Phase 07+ reads from here rather than defining its own validators.
 */
export const documentSchemas = {
  profile: profileSchema,
  settings: siteSettingsSchema,
  projects: projectSchema,
  services: serviceSchema,
  skills: skillSchema,
  reviews: reviewSchema,
  contactLinks: contactLinkSchema,
} as const
