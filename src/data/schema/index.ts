/**
 * Phase 05 — runtime schema layer (public surface).
 *
 * Import from here rather than reaching into individual files, so the contract
 * has one entry point for every later phase.
 */
export * from './core.ts'
export {
  contactLinkInputSchema,
  contactLinkSchema,
  documentSchemas,
  profileInputSchema,
  profileSchema,
  projectInputSchema,
  projectSchema,
  reviewInputSchema,
  reviewSchema,
  serviceInputSchema,
  serviceSchema,
  siteSettingsInputSchema,
  siteSettingsSchema,
  skillInputSchema,
  skillSchema,
} from './schemas.ts'
