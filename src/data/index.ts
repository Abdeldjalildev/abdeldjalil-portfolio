/**
 * Phase 05 — canonical data contract (public surface).
 *
 * The single import path for everything data-shaped: document types, closed
 * enums, Firestore/Storage path builders and runtime schemas.
 *
 * Layers, and they are not interchangeable:
 *   ./types.ts          developer contract (erased at build time)
 *   ./schema/*          runtime validation of untrusted data
 *   ../../firestore.rules / ../../storage.rules   authoritative security
 */
export * from './enums.ts'
export * from './paths.ts'
export type * from './types.ts'
export * from './schema/index.ts'
