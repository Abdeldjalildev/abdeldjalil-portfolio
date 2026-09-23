/**
 * Phase 05 — canonical document types for the portfolio data contract.
 *
 * These types describe the persisted Firestore document shape. They are the
 * developer-facing contract; `src/data/schema` is the runtime contract that
 * validates untrusted data, and `firestore.rules` is the authoritative security
 * contract. The three layers describe the same documents and must not drift.
 *
 * Timestamps are the Firestore `Timestamp` type, because that is what documents
 * actually contain. Firestore timestamp types are deliberately NOT conflated
 * with serialized/JSON domain values: a later serialization boundary, if one is
 * ever needed, would convert explicitly rather than by type erosion.
 */
import type { Timestamp } from 'firebase/firestore'
import type { ContactLinkType, Locale, ReviewStatus, SkillGroup } from './enums.ts'

/**
 * Localized content contract.
 * `en` is always written and must be non-empty. `ar` may be an empty string to
 * mean "translation pending"; Phase 06 owns the public fallback rule.
 */
export type LocalizedText = {
  en: string
  ar: string
}

/** A server-managed Firestore timestamp. */
export type ServerTimestamp = Timestamp

/** An outbound link attached to a project. */
export type ExternalLink = {
  label: LocalizedText
  url: string
}

/** Optional per-document search/share metadata. */
export type SeoMetadata = {
  title: LocalizedText | null
  description: LocalizedText | null
}

/**
 * Fields every document carries.
 * `createdAt` is immutable after creation; `updatedAt` is rewritten on every
 * write. Both must be server timestamps — rules reject backdated values.
 */
export type DocumentTimestamps = {
  createdAt: ServerTimestamp
  updatedAt: ServerTimestamp
}

// ------------------------------------------------------------------- documents
/** `profile/main` — the portfolio owner's public profile. Singleton. */
export type Profile = DocumentTimestamps & {
  fullName: LocalizedText
  headline: LocalizedText
  bio: LocalizedText
  /** Storage object path, or null. See profileAvatarObjectPath(). */
  avatarPath: string | null
  /** Storage object path, or null. See profileResumeObjectPath(). */
  resumePath: string | null
  published: boolean
}

/**
 * `settings/main` — public site configuration. Singleton.
 *
 * Contains only public-safe values: Firestore rules cannot filter fields on
 * read, so the whole document is world-readable. Private or secret settings must
 * live in a separate document with an admin-only read rule, never here.
 */
export type SiteSettings = DocumentTimestamps & {
  siteTitle: LocalizedText
  siteDescription: LocalizedText
  defaultLocale: Locale
  /**
   * The single source of truth for "the featured project".
   * A single field holds at most one value, so "exactly one featured project"
   * holds structurally. Cross-document checks — that the id exists and is
   * published — are not expressible in rules and are a CMS/server
   * responsibility, recorded in docs/data-model.md.
   */
  featuredProjectId: string | null
}

/** `projects/{slug}` — a portfolio project. The document id IS the slug. */
export type Project = DocumentTimestamps & {
  title: LocalizedText
  /** Equals the document id; immutable after creation so public URLs are stable. */
  slug: string
  summary: LocalizedText
  description: LocalizedText
  /** Long-form case study. Null until written (Phase 09 renders it). */
  caseStudy: LocalizedText | null
  /**
   * Technology display labels (e.g. "React", "Firestore").
   * Deliberately labels rather than skill-document references: a project may use
   * a technology that is not in the skills catalogue, and requiring referential
   * integrity would force a join and block authoring. See docs/data-model.md.
   */
  technologies: string[]
  /** Optional grouping slug, or null. */
  category: string | null
  thumbnailPath: string | null
  galleryPaths: string[]
  liveUrl: string | null
  repoUrl: string | null
  links: ExternalLink[]
  seo: SeoMetadata
  published: boolean
  /** Display order within the published list. */
  order: number
}

/** `services/{slug}` — a service offered. The document id IS the slug. */
export type Service = DocumentTimestamps & {
  title: LocalizedText
  slug: string
  summary: LocalizedText
  description: LocalizedText
  iconPath: string | null
  published: boolean
  order: number
}

/** `skills/{skillId}` — a technology or skill in the catalogue. */
export type Skill = DocumentTimestamps & {
  /** Proper noun, not translated (e.g. "React"). */
  name: string
  /** Closed enum; its label is localized in UI translation files. */
  group: SkillGroup
  iconPath: string | null
  published: boolean
  order: number
}

/** `reviews/{reviewId}` — a client review. Workflow: pending -> approved -> published. */
export type Review = DocumentTimestamps & {
  reviewerName: string
  reviewerRole: LocalizedText | null
  /** Integer 1-5 inclusive. */
  rating: number
  content: LocalizedText
  avatarPath: string | null
  relatedServiceId: string | null
  relatedProjectId: string | null
  /** Public visibility equals 'published'. 'approved' is internal only. */
  status: ReviewStatus
  /** Null unless status is 'published'; server-stamped at publication. */
  publishedAt: ServerTimestamp | null
  order: number
}

/** `contactLinks/{linkId}` — a public social or contact link. */
export type ContactLink = DocumentTimestamps & {
  type: ContactLinkType
  label: LocalizedText
  /**
   * Target value. Format depends on type: https:// for web links, a mailto: or
   * bare address for email, a tel: target for phone.
   */
  value: string
  published: boolean
  order: number
}

// --------------------------------------------------------------- input shapes
/**
 * Write payloads: the document without its server-managed timestamps.
 * The writer adds `createdAt`/`updatedAt` with serverTimestamp().
 */
export type ProfileInput = Omit<Profile, 'createdAt' | 'updatedAt'>
export type SiteSettingsInput = Omit<SiteSettings, 'createdAt' | 'updatedAt'>
export type ProjectInput = Omit<Project, 'createdAt' | 'updatedAt'>
export type ServiceInput = Omit<Service, 'createdAt' | 'updatedAt'>
export type SkillInput = Omit<Skill, 'createdAt' | 'updatedAt'>
export type ReviewInput = Omit<Review, 'createdAt' | 'updatedAt'>
export type ContactLinkInput = Omit<ContactLink, 'createdAt' | 'updatedAt'>
