/**
 * Phase 04 — Admin authorization contract.
 *
 * Defines the minimum claim surface that the admin authorization model
 * relies on. Claims are set server-side (privileged environment only) and
 * flow to the client through Firebase ID tokens.
 */
export type Claims = {
  /** True if the user is an authorized admin. Set via Admin SDK. */
  admin: boolean
}
