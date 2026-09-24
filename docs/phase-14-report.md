# Phase 14 — Security, Accessibility, Performance, SEO & Hardening

## Phase / objective

Phase 14 — Security, Accessibility, Performance, SEO & Hardening.

Objective: perform a cross-cutting production-hardening pass over the existing portfolio without redesigning the product or starting Phase 15.

## Starting state

The repository already had:
- Firebase Authentication with the Phase 04 `admin` custom claim boundary.
- Firestore and Storage rules with deny-by-default fall-through.
- Schema validation for canonical CMS documents.
- Phase 13 server-owned analytics with App Check enforcement.
- Public/admin route separation.
- Reduced-motion support and visible focus styling.
- Project media lazy loading, but no route-level code splitting.
- Basic `index.html` metadata, but no centralized canonical/OG/Twitter metadata boundary.
- No committed `robots.txt` or `sitemap.xml`.
- Admin mobile navigation had no complete modal focus-management contract.
- Storage draft staging was admin-only but did not enforce image type/size at the staging boundary.

Firebase Security Rules remain authoritative for client access; Firebase documents that client libraries use Authentication + Security Rules for authorization and recommends Emulator-based rule tests before deployment. citeturn0search0turn0search1turn0search6

## Gate 1 — Discovery & contract

PASS by repository inspection.

Attack surfaces reviewed:
- Public and admin routes.
- Authentication and admin boundary.
- Firestore public/admin reads and admin-only writes.
- Storage public media, admin media and draft staging.
- Phase 13 callable analytics boundary.
- External links.
- CMS-controlled text, URLs and media references.
- Images/media loading.
- Mobile navigation and keyboard focus.
- HTML metadata, crawler directives and public sitemap.
- Translation parity and true RTL/LTR shell behavior.
- Production bundle structure and route loading strategy.
- Existing tests and dependency configuration.

No Phase 15 release/deployment work was started.

## Gate 2 — Design / acceptance criteria

PASS by static design review.

Security:
- Keep Firebase rules authoritative and deny-by-default.
- Keep privileged analytics server-owned.
- Keep App Check enforcement on the analytics callable.
- Validate staged media server-side.
- Do not add client-side secrets or Admin SDK credentials.
- Preserve existing timestamp, publication, review workflow and featured-project invariants.

Accessibility:
- Preserve visible keyboard focus.
- Add skip navigation.
- Make admin mobile navigation a real dialog-like interaction with Escape, focus containment, focus restoration and background scroll locking.
- Keep controls comfortably sized.
- Preserve reduced-motion behavior.
- Preserve EN/AR direction handling.

Performance:
- Split public/admin feature modules by route using native dynamic imports through React lazy.
- Preserve eager loading only for critical above-the-fold project media.
- Keep other project media lazy.
- Avoid new runtime dependencies.

SEO:
- Centralize title/description/robots/canonical/OG/Twitter metadata.
- Keep project detail metadata data-driven.
- Add crawler directives and sitemap.
- Keep admin/sign-in out of indexing.

## Gate 3 — Implementation

PASS by repository inspection.

### Performance / bundle architecture

Updated `src/App.tsx`:
- Public Home/About/Services/Projects/ProjectDetail/Reviews/Contact are lazy-loaded.
- Admin Dashboard/Projects/Services/Skills/Reviews/Profile/Contact/Analytics/Settings are lazy-loaded.
- Development-only design-system preview is lazy-loaded.
- Removed eager imports of feature pages from the main application module.

This uses standard dynamic-import code splitting; route-oriented splitting reduces the initial JavaScript footprint by loading only the modules needed by the visited route. citeturn0search2

### SEO

Added:
- `src/components/seo/Seo.tsx`
- `public/robots.txt`
- `public/sitemap.xml`

Updated:
- `index.html`
- `src/routes/PublicLayout.tsx`
- `src/features/public/ProjectDetail.tsx`

The SEO boundary manages:
- document title;
- description;
- robots;
- canonical URL;
- Open Graph title/description/type/url;
- Twitter card/title/description.

Project detail SEO remains generated from the validated CMS project data rather than duplicating metadata logic.

The canonical origin is derived from the current deployment origin, avoiding a hardcoded production host in client runtime metadata.

The committed sitemap currently uses the Firebase default hosting hostname `abdeldjalil-portfolio.web.app`. If the final production deployment uses another hostname/custom domain, the sitemap host must be updated as part of the deployment/release configuration. This is intentionally not guessed as a different domain.

### Accessibility

Updated:
- `src/routes/PublicLayout.tsx`
- `src/routes/AdminLayout.tsx`
- `src/components/shell/LocaleSwitcher.tsx`
- `src/components/shell/PublicHeader.tsx`
- `src/components/shell/PublicFooter.tsx`
- EN/AR locale files.

Added:
- public skip link + `#main-content`;
- admin skip link + `#admin-main-content`;
- admin mobile dialog semantics;
- Escape-to-close;
- Tab/Shift+Tab containment;
- focus moved into the menu on open;
- focus restored to the trigger on close;
- background scroll locking;
- larger interactive targets.

The existing global focus ring and reduced-motion behavior remain intact. These changes align with WCAG 2.2 expectations around visible keyboard focus and minimum target sizing. citeturn1search0turn1search2turn1search4

### Media performance

Updated:
- `src/features/public/ProjectMedia.tsx`

Critical media can now use:
- `loading="eager"`;
- `fetchPriority="high"`.

Non-critical project media remains lazy-loaded.

### Storage security

Updated:
- `storage.rules`

Draft project staging now requires:
- admin claim;
- safe scope/file segments;
- a project thumbnail/gallery staging scope;
- raster image content type;
- maximum 5 MiB object size.

The previous generic admin-only staging write was therefore narrowed to the actual Phase 08 project-media staging contract.

Firebase Storage Rules can validate path, content type and object size, making this server-side boundary appropriate for upload hardening. citeturn0search4turn0search12

### Storage rule tests

Updated:
- `scripts/test-rules.mjs`

Added denied cases for:
- SVG upload into project staging;
- PDF upload into image-only project staging;
- uncontracted storage paths.

Existing public-read/admin-write and list-denial cases remain.

### Footer correctness

A concrete defect discovered during the Phase 14 audit was fixed:
- social icons were returned as bare SVG `path`/`circle` nodes instead of being wrapped in an `<svg>` element.

They now render inside a valid SVG container with `aria-hidden` semantics while the anchor retains its localized accessible label.

### Diagnostics

Updated:
- `src/components/shell/PublicFooter.tsx`

Non-blocking footer load failures now retain a diagnostic `console.warn` rather than being silently swallowed.

Phase 13 analytics remains intentionally failure-isolated because analytics must never block the application.

### Verification harness

Added:
- `scripts/test-phase14.mjs`

Registered:
- `npm run test:phase14`

The harness statically verifies the Phase 14 contracts across:
- lazy loading;
- SEO;
- robots/sitemap;
- media priority;
- admin dialog/focus behavior;
- skip navigation;
- target sizing;
- storage validation;
- storage security tests;
- analytics security boundary;
- translation additions;
- phase report integrity.

No new root runtime dependency was added.

## Gate 4 — Verification

BLOCKED pending local/runtime execution.

Static audit performed after implementation:
- Re-read AGENTS.md Phase 14 contract.
- Re-inspected route architecture.
- Re-inspected Firestore and Storage security boundaries.
- Re-inspected Phase 13 analytics boundary.
- Re-inspected public media loading.
- Re-inspected public/admin navigation.
- Re-inspected translations.
- Re-inspected crawler metadata.
- Added and reviewed a dedicated Phase 14 static audit harness.
- Found and fixed a concrete footer SVG rendering defect during the post-implementation audit.
- Added additional Storage denied-case coverage.

The following commands are NOT claimed as executed in this environment:
- `npm run lint`
- `npm run build`
- `npm run test:schema`
- `npm run test:rules`
- `npm run test:phase07`
- `npm run test:phase08`
- `npm run test:phase09`
- `npm run test:phase10`
- `npm run test:phase11`
- `npm run test:phase12`
- `npm run test:phase13`
- `npm run test:phase14`
- browser/mobile accessibility walkthrough;
- Lighthouse/real performance measurements;
- Firebase deployed-rule verification;
- production App Check verification;
- dependency vulnerability scan.

Therefore no execution-based PASS is claimed for these items.

Vite's production build is the authoritative way to generate the deployable static bundle, and `vite preview` is the local production-build inspection path. citeturn1search6turn1search3

## Gate 5 — Hardening / deep review

PARTIAL pending runtime evidence.

### Findings resolved during the Phase 14 audit

1. **Route bundle concentration**
   - Feature modules were eagerly imported.
   - Fixed with route-level lazy imports.

2. **Missing centralized SEO contract**
   - Fixed with the `Seo` boundary.

3. **Project detail metadata duplication**
   - Fixed by moving it onto the shared SEO boundary.

4. **Missing crawler controls**
   - Added robots policy and sitemap.

5. **Admin mobile keyboard contract**
   - Fixed with focus containment, Escape, focus restoration and scroll locking.

6. **Missing skip navigation**
   - Added to both public and admin shells.

7. **Small shell controls**
   - Increased key interactive targets.

8. **Weak Storage staging validation**
   - Draft project media now has server-side scope/type/size restrictions.

9. **Storage security test gap**
   - Added invalid SVG/PDF staging tests.

10. **Footer SVG defect**
   - Fixed invalid bare SVG child elements.

11. **Footer error diagnostics**
   - Added non-blocking diagnostics instead of silently dropping the failure.

### Security review result

No new client authorization path was introduced.

The existing Firebase rule boundary remains authoritative. Firebase explicitly recommends keeping Security Rules as the protection layer and testing them with the Emulator Suite before production deployment. citeturn0search1turn0search3

The Phase 13 analytics collections remain protected:
- daily aggregates: admin read only;
- visitor markers: client read/write denied;
- callable: App Check enforced.

### Performance review result

No new dependency was introduced.

The largest structural improvement in this phase is route-level lazy loading. Actual bundle-size reduction still requires the real production build and must not be fabricated from source inspection.

### Accessibility review result

The code now has:
- semantic main landmarks;
- skip navigation;
- visible focus;
- reduced-motion handling;
- mobile navigation focus containment;
- Escape handling;
- focus restoration;
- accessible menu/dialog labels;
- larger shell targets;
- meaningful image alt text where project/review imagery is informative.

A real browser/keyboard/mobile audit remains required before claiming full accessibility verification.

## Gate 6 — Closure / evidence

BLOCKED.

Reason:
- The master contract requires actual lint/typecheck/build/test/runtime evidence for closure.
- The local project environment was not available for execution.
- Production Firebase deployment/App Check verification has not been performed.
- Owner acceptance has not yet been recorded.

Therefore:

**Phase 14 is implemented and deeply statically audited, but it is NOT formally CLOSED.**

## Known issues / limitations

1. Runtime verification remains pending.
2. The sitemap currently assumes the Firebase default hosting hostname `abdeldjalil-portfolio.web.app`; a final custom/alternate production host must replace it if used.
3. No deployment configuration was added because deployment/release configuration is outside this phase's implementation scope and Phase 15 owns final release verification.
4. Actual bundle-size/Lighthouse measurements require the production build and browser environment.
5. Dependency vulnerability status has not been claimed without running the dependency audit.
6. Firebase deployed-rule state has not been claimed from repository files alone; local Emulator/deployed verification is still required.

## Out of scope

- Phase 15 final production verification.
- Deployment/publishing.
- Firebase project identity changes.
- New application dependencies without necessity.
- Visual redesign.
- Rewriting the CMS architecture.
- New analytics event types.
- GA4/Google Analytics.
- Broad refactors unrelated to a verified Phase 14 finding.

## Recommended next action

Run the Phase 14 local verification suite first, then perform the Firebase Emulator/security checks and browser accessibility/performance walkthrough. Resolve any runtime findings before formal closure.

**I did not advance to the next phase.**
