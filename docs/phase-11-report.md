# Phase 11 — Home, Conversion Flow & Featured Project

## Scope

Phase 11 assembles the public home experience around the existing Phase 07–10 contracts.

Implemented:
- Hero / professional introduction.
- About preview.
- Services preview.
- Featured project section driven by `settings/main.featuredProjectId`.
- Additional published projects with Show More / Show Less behavior.
- Social proof summary and selected published reviews.
- Contact conversion CTA and published contact shortcuts.
- Existing public footer remains owned by the public shell.
- English and Arabic home copy.

Not implemented:
- Admin dashboard completion (Phase 12).
- Analytics (Phase 13).
- Cross-cutting production hardening (Phase 14).
- Final release verification (Phase 15).

## Gate 1 — Discovery & contract

PASS by repository inspection.

The current repository already contains:
- Published project queries and stable project-detail routes from the project showcase work.
- A single featured-project source in `settings/main`.
- Published-only review and contact-link queries.
- Existing public shell, navigation and footer.
- Existing EN/AR i18n contract.

The home composition therefore consumes existing contracts rather than creating parallel data models.

## Gate 2 — Architecture/data design

PASS by static inspection.

Data dependencies are loaded in parallel:
- `getPublicProfile()`
- `listServices(true)`
- `listProjects(true)`
- `getFeaturedProjectId()`
- `listReviews(false)`
- `listContactLinks(false)`

The featured section resolves the configured featured ID against the already published project set. If no valid featured project is available, the section renders an explicit empty state rather than silently inventing a featured designation.

Show More is local presentation state only; it does not introduce a new persistence contract.

Contact shortcuts reuse the existing ContactLink type and normalize email, phone and WhatsApp targets before navigation.

## Gate 3 — Implementation

PASS by static inspection.

Changed:
- `src/features/public/Home.tsx`
- `src/routes/Root.tsx`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/ar.ts`
- `scripts/test-phase11.mjs`
- `package.json`

The root route now renders the Home experience.

Home uses existing components and contracts:
- Heading / Text / Surface
- ProjectCard / ProjectDetails
- React Router links
- existing Firebase CMS data-access functions

No new runtime dependency was added.

## Gate 4 — Verification

BLOCKED / pending local execution.

Static verification was implemented in `scripts/test-phase11.mjs` and registered as `npm run test:phase11`.

The following execution evidence is intentionally NOT claimed because the project computer is currently unavailable:
- `npm run lint`
- `npm run build`
- `npm run test:schema`
- `npm run test:rules`
- `npm run test:phase07`
- `npm run test:phase08`
- `npm run test:phase09`
- `npm run test:phase10`
- `npm run test:phase11`
- browser/responsive testing
- real Firestore/Storage runtime propagation

The home public queries preserve the existing publication predicates. Firestore rules are not filters, so public queries must be constrained consistently with their rules. citeturn0search5turn0search8

The project list uses the existing published+order query contract and composite index. Firestore indexes support compound filter/order queries and the repository already declares the relevant index. citeturn0search1turn0search6

## Gate 5 — Hardening/review

PARTIAL / pending local execution.

Static review confirms:
- Published-only project/review/contact reads on Home.
- Featured project is not selected from unpublished projects.
- External contact links use `noopener noreferrer` where a new tab is used.
- Email and phone targets remain actionable without forcing an external tab.
- WhatsApp phone values are normalized to `https://wa.me/` targets.
- Home uses existing responsive utility classes and semantic sections.
- No new dependency or Firebase rule change was introduced.
- Loading and top-level error states are present.
- Empty states are present for featured projects, services, projects and reviews.

Local browser/accessibility/performance evidence remains pending.

## Deep audit after implementation

A repository-level audit was performed before Phase 12 work. One concrete Phase 11 quality issue was found: `Home.tsx` imported `localizeProjectText` but did not use it. Because the TypeScript configuration enables `noUnusedLocals`, this could block a production typecheck/build. The unused import was removed, and the Phase 11 static harness was strengthened to assert that the dead import does not return.

No Phase 11 contract, publication boundary, featured-project invariant, or scope boundary was changed during this repair.

## Gate 6 — Closure/evidence

**BLOCKED / pending local verification and owner acceptance.**

AGENTS.md phase ledger remains unchanged. Phase 11 is NOT marked CLOSED.

**I did not advance to the next phase.**
