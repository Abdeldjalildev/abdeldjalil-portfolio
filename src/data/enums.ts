/**
 * Phase 05 — canonical enumerations for the portfolio data contract.
 *
 * These are the single source of truth for closed value sets. Collections and
 * schemas import from here; feature phases must not redefine them.
 *
 * Declared as `as const` arrays (with derived union types) rather than TypeScript
 * `enum`s, so that the same values can be iterated at runtime for validation and
 * `erasableSyntaxOnly` remains satisfied.
 */

/** Public site locales. Phase 06 owns the actual i18n implementation. */
export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

/**
 * Review moderation workflow: pending -> approved -> published.
 * Public visibility equals `published`; `approved` is internal only.
 */
export const REVIEW_STATUSES = ['pending', 'approved', 'published'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

/**
 * Skill grouping. The label for each group is localized in UI translation files
 * (Phase 06), never stored in CMS data — UI translation and CMS content stay
 * separate.
 */
export const SKILL_GROUPS = [
  'frontend',
  'backend',
  'database',
  'devops',
  'tooling',
  'design',
  'other',
] as const
export type SkillGroup = (typeof SKILL_GROUPS)[number]

/** Supported social / contact link types. */
export const CONTACT_LINK_TYPES = [
  'email',
  'phone',
  'whatsapp',
  'github',
  'linkedin',
  'instagram',
  'facebook',
  'x',
  'telegram',
  'youtube',
  'behance',
  'dribbble',
  'custom',
] as const
export type ContactLinkType = (typeof CONTACT_LINK_TYPES)[number]

/**
 * Contact link types whose target must be an https:// URL.
 * `email` uses a mailto: target and `phone`/`whatsapp` use tel:/https, so a
 * blanket https-only rule would be wrong; the schema validates per type.
 */
export const HTTPS_ONLY_CONTACT_TYPES: readonly ContactLinkType[] = [
  'github',
  'linkedin',
  'instagram',
  'facebook',
  'x',
  'telegram',
  'youtube',
  'behance',
  'dribbble',
  'custom',
]

/** Rating bounds for a review. */
export const MIN_RATING = 1
export const MAX_RATING = 5
