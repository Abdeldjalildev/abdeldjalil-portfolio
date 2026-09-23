# Phase 08 — Project CMS & Media Pipeline Report

## Status

**Implementation complete on GitHub. Formal Phase 08 closure remains pending local/runtime verification and owner acceptance.**

The AGENTS.md phase ledger was intentionally not changed to CLOSED.

## Objective

Build the project management and media system while preserving the frozen Phase 05 data contract and enforcing the featured-project invariant at the security boundary.

## Starting state

- Phase 05 already defined the canonical `Project` document, project input schema, storage limits and project thumbnail/gallery paths.
- Phase 07 established the CMS data-access pattern, runtime validation, optimistic concurrency and localized admin UI.
- Project admin/public feature pages were still placeholders.
- Storage rules already had project public paths and an admin-only drafts area, but the Phase 08 publishing lifecycle was not implemented.
- The previous data-model note explicitly reserved project media promotion and featured-project cross-document enforcement for Phase 08.

## Implemented

### Project CMS

Added `src/features/cms/ProjectsAdmin.tsx` and connected the admin Projects route.

The CMS supports:

- create project
- edit project
- delete project
- publish/unpublish
- immutable slug/document ID
- EN/AR localized title, summary, description and case study
- technologies
- category
- thumbnail
- gallery
- live demo URL
- repository URL
- additional external links
- SEO title/description in EN/AR
- display order
- featured-project selection/clearing
- loading/empty/error/saved states
- malformed-document reporting
- media removal

### Project data/media layer

Added `src/features/cms/projects.ts`.

It provides:

- validated project reads/writes using the canonical Phase 05 schema
- ordered admin/public project queries
- optimistic concurrency using `updatedAt`
- transactional Firestore project writes
- client-side media type/size validation
- Storage uploads
- draft-media staging
- promotion from drafts to public project paths on publication
- movement of public media back to drafts on unpublish
- deletion of removed media
- deletion of project media when deleting a project
- best-effort media rollback if the Firestore write fails after promotion
- featured-project transaction

No new validation dependency was introduced.

## Featured-project invariant

The previous model used `settings/main.featuredProjectId` as the source of truth.

Phase 08 strengthens this at the Firestore rules layer.

Rules now require:

1. a non-null featured ID to reference an existing project;
2. the referenced project to be published;
3. a featured project cannot be unpublished;
4. a featured project cannot be deleted;
5. changing the featured project remains a single settings-document transaction.

This means the invariant is no longer merely a UI/CMS convention.

## Media security lifecycle

Because Firebase Storage rules cannot inspect Firestore publication state:

- draft uploads go under admin-only `drafts/`;
- public project media is only promoted into `projects/{slug}/thumbnail/*` or `projects/{slug}/gallery/*` as part of publication;
- unpublishing moves referenced public media back into the admin-only draft area;
- SVG remains rejected;
- PNG/JPEG/WebP/AVIF are accepted;
- Storage ceilings remain aligned with the Phase 05 contract;
- public objects are individually readable but the bucket remains non-listable.

The lifecycle is documented in `docs/data-model.md`.

## Security-rule verification additions

Extended `scripts/test-rules.mjs` with explicit cases for:

- admin attempting to feature an unpublished project → DENY expected
- admin attempting to unpublish the currently featured project → DENY expected
- admin attempting to delete the currently featured project → DENY expected

The existing Phase 05 rules suite remains the authoritative executable rules test; no test was weakened.

## Schema verification additions

Extended `scripts/test-schema.ts` to reject:

- more than 12 project gallery images
- more than 10 additional project links

## Static verification performed after implementation

A fresh GitHub inspection verified:

- EN/AR translation parity: **144 / 144**
- project route wiring: **PASS**
- canonical project schema usage: **PASS**
- transactional writes: **PASS**
- media type/size validation: **PASS**
- draft/public media promotion pipeline: **PASS**
- removed-media cleanup: **PASS**
- project links and SEO fields exposed: **PASS**
- featured-project security invariant present in Firestore rules: **PASS**
- project Storage paths and draft staging contract: **PASS**
- featured invariant rule tests added: **PASS**
- project gallery/link schema-bound tests added: **PASS**
- `npm run test:phase08` registered: **PASS**
- data-model documentation updated: **PASS**

Latest GitHub HEAD:

`92a9c11d34f4261107b69cbcdb460d21986efe19`

## Verification still pending

As agreed earlier, local/runtime execution is deferred until the computer is available.

Not claimed as runtime PASS:

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run test:schema`
- `npm run test:rules`
- `npm run test:phase08`
- actual Firebase Emulator execution of the updated rules
- actual Storage upload/promotion/unpublish/delete flows
- real Admin Auth session
- browser interaction and responsive testing
- RTL/keyboard testing
- real CMS → Firestore → public propagation

## Gate assessment

| Gate | Status | Evidence |
|---|---|---|
| 1 — Discovery & contract | PASS | Existing Phase 05 project/schema/storage contracts re-read and reused |
| 2 — Architecture/data design | PASS | Project lifecycle, media staging and featured invariant documented |
| 3 — Implementation | PASS | CMS, data layer, media pipeline, route and security changes present |
| 4 — Verification | BLOCKED / pending local | GitHub static verification complete; runtime execution unavailable |
| 5 — Hardening/review | PARTIAL / pending local | Featured invariant, media validation, staging, cleanup and rule tests implemented; runtime regression remains |
| 6 — Closure/evidence | BLOCKED | Local evidence and owner acceptance remain required |

## Out of scope

- Phase 09 public Projects/case-study experience
- Phase 10 Reviews/Contact
- Phase 11 Home/featured presentation
- Phase 12 Admin dashboard completion
- Phase 13 Analytics
- Phase 14 cross-cutting hardening
- Phase 15 release readiness

**I did not advance to the next phase.**
