# Phase 09 — Public Projects & Case Studies

## Scope

Phase 09 turns the existing Phase 08 project CMS contract into a public project showcase. It does not build Reviews, Contact, Home/featured presentation, Analytics, or cross-cutting Phase 14 hardening.

## Gate 1 — Discovery & contract

- Re-read the Phase 08 project schema and data access contract before implementation.
- Reused the canonical `projects/{slug}` document ID/slug invariant.
- Public listing uses the existing `published == true + order asc` query.
- Public detail uses a single-document lookup for the requested slug.
- The public detail helper treats Firestore `permission-denied` for an unpublished document as "not found" rather than exposing draft existence.
- Default selection on `/projects` is the first published project in CMS order.
- Optional selection is represented by `?project=<slug>`, allowing refresh/share of the selected state.
- Media remains in Storage; Firestore stores only paths. Public media URLs are resolved with Firebase Storage `getDownloadURL()`.
- Case study is optional in the frozen Phase 05/08 schema and is rendered only when present.

## Gate 2 — Architecture/data design

The public surface is split into reusable presentation pieces:

- `Projects.tsx`: published collection loading, deterministic selection and page composition.
- `ProjectCard.tsx`: reusable project summary/selection card.
- `ProjectDetails.tsx`: reusable selected/detail presentation for overview, technologies, case study, gallery and outbound links.
- `ProjectDetail.tsx`: deep-link loading, not-found behavior and document metadata.
- `ProjectMedia.tsx`: Storage URL resolution, loading/failure fallback and lazy/eager loading policy.
- `projectPresentation.ts`: localization and SEO/media helpers.

The page never reads unpublished collection data. The detail path never calls an admin-only API and relies on Firestore rules as the authority.

## Gate 3 — Implementation

Implemented:

- Public `/projects` page.
- Published-only ordered project listing.
- Deterministic selected project with first-project fallback.
- URL-backed selected state via `?project=slug`.
- Responsive project card grid/list.
- Selected project panel.
- Dedicated `/projects/:slug` case-study experience.
- Localized title, summary, description and optional case study.
- Technology chips.
- Thumbnail and gallery rendering.
- Live demo, repository and additional external links.
- External links use `target="_blank"` + `rel="noopener noreferrer"`.
- Project media uses Firebase Storage download URLs with lazy loading except the primary detail image.
- Detail-page document title and description metadata use the project's localized SEO contract.
- Missing and unpublished project behavior is non-disclosing.
- EN/AR UI strings added with parity enforced by the existing dictionary typing.

No new runtime dependency was added.

## Gate 4 — Verification

GitHub/static verification was completed after implementation:

- route wiring inspected;
- canonical project schema/data layer reused;
- published-only list query inspected;
- single-project permission-denied handling inspected;
- URL selection/default behavior inspected;
- case-study/gallery/links fields inspected;
- Storage URL and image loading strategy inspected;
- external-link hardening inspected;
- SEO metadata wiring inspected;
- EN/AR key parity checked structurally;
- Phase 09 static verification script added and registered.

Runtime verification is intentionally pending because the user's computer is currently unavailable.

Not claimed as PASS:

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm run test:schema`
- `npm run test:rules`
- `npm run test:phase08`
- `npm run test:phase09`
- browser/responsive/accessibility testing
- real Firestore published/unpublished behavior
- real Storage media delivery
- real CMS-to-public propagation

## Gate 5 — Hardening/review

Implemented hardening visible in the code:

- public list is explicitly `publishedOnly=true`;
- detail path uses the published-only helper;
- unpublished detail access is normalized to the same not-found UI;
- no raw Firestore error is rendered;
- media failures degrade to a neutral placeholder rather than breaking the page;
- external links are opened with `noopener noreferrer`;
- images use `loading="lazy"` by default;
- no uploaded SVG or arbitrary media path is introduced by Phase 09;
- existing Firestore rules and Storage contract remain the security boundary;
- no new dependency was introduced.

Runtime performance/accessibility/SEO validation remains pending local/browser verification.

## Gate 6 — Closure/evidence

**BLOCKED / pending local verification and owner acceptance.**

Phase 09 is not marked CLOSED in `AGENTS.md`.

**I did not advance to the next phase.**
