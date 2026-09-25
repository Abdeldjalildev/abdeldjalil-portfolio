# Phase-by-Phase Repair & Integration Tracker

## Purpose

This file is the living repair map for the portfolio repository.

It records:
- defects that affect a phase's own contract;
- cross-phase integration deviations;
- ambiguities that must be resolved before repair;
- the dependency relationship between findings.

Simple, isolated, low-risk defects may be fixed immediately during the corresponding audit. Structural, cross-phase, security, data-contract, lifecycle, or architectural findings are recorded here first and repaired later in dependency order.

**Rule:** this tracker does not close phases and does not replace `AGENTS.md`. The phase ledger remains owner-controlled.

---

# Phase 01 — FOUNDATION, REPOSITORY BASELINE & FIREBASE BOOTSTRAP

## Audit status

**Deep static audit completed.**

Scope inspected:
- `AGENTS.md` Phase 01 contract
- repository baseline/configuration relevant to Phase 01
- `.gitignore`
- `.env.example`
- `.firebaserc`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `src/firebase/app.ts`
- `src/main.tsx`
- current Firebase configuration boundaries
- current repository history around the foundation/public-shell implementation
- downstream references that depend on the Phase 01 Firebase bootstrap

No local execution, build, lint, Firebase emulator test, or browser verification was performed in this audit.

## Phase 01 direct findings

### P01-01 — No confirmed direct Phase 01 code defect found

The current Firebase application boundary is structurally coherent:
- configuration is environment-driven;
- required Firebase Web configuration variables are checked;
- missing configuration fails explicitly;
- the Firebase app is initialized through a single `getFirebaseApp()` boundary;
- `getApps()/getApp()` protects against duplicate initialization during HMR;
- Firebase product initialization is not embedded inside `src/firebase/app.ts`;
- real environment files are ignored while `.env.example` remains tracked;
- the Firebase project identity in `.firebaserc` is `abdeldjalil-portfolio`.

**Disposition:** no change.

### P01-02 — Phase 01 runtime verification remains unproven

The Phase 01 contract requires execution evidence for lint, typecheck/build, dev startup, Firebase initialization sanity, and secret-exposure checks. Current repository inspection alone cannot prove those gates.

**Disposition:** record only. Verify later during the dedicated testing stage.

### P01-03 — Current `main.tsx` contains later-phase App Check bootstrap, but this is not a Phase 01 defect

`src/main.tsx` now initializes optional App Check before the application and then initializes the Firebase app. This was introduced by Phase 13 for the analytics security boundary.

The Phase 01 Firebase app module itself still respects the original boundary: it initializes only the Firebase app.

**Disposition:** no rollback. Treat as an intentional later-phase integration.

### P01-04 — Current repository contains later-phase Firebase configuration outside the original Phase 01 scope

The current `firebase.json`, Firestore rules, Storage rules, Functions configuration, and App Check integration are later-phase artifacts. Therefore they must not be used to retroactively claim that Phase 01 itself implemented those services.

**Disposition:** no code change. Preserve phase attribution.

## Phase 01 conclusion

**No simple isolated Phase 01 defect was found that is safe and necessary to patch now.**

The Phase 01 bootstrap is **not marked CLOSED** because execution evidence has not yet been produced.

---

# Cross-phase findings observed while auditing Phase 01

These are NOT assigned to Phase 01 and must be repaired in their owning phase.

### CP-01 — Missing current `firebase.indexes.json` while `firebase.json` references it

Current `firebase.json` declares:

`firestore.indexes.json`

but the repository currently does not expose that file at the referenced path.

**Owning areas:** Phase 05 / Phase 15 release verification.

**Status:** record; do not repair during Phase 01 audit.

### CP-02 — Phase 13 analytics Firestore read contract is incomplete

The previously identified Phase 13 issue remains:
- `AnalyticsAdmin` reads `analyticsDaily/{date}`;
- current Firestore rules do not provide the corresponding rule;
- Phase 13 test/data-model expectations are therefore out of sync.

**Owning area:** Phase 13, with Phase 05 contract dependency.

### CP-03 — Phase 09 verification contract conflicts with Phase 14 SEO architecture

The Phase 09 test still expects direct document metadata manipulation, while Phase 14 centralized SEO into `Seo.tsx`.

**Owning areas:** Phase 09 + Phase 14 verification contract.

### CP-04 — Phase 12 verification contract conflicts with Phase 13 analytics navigation

Phase 12's test rejects the presence of analytics in the admin layout, although Phase 13 legitimately added the analytics route.

**Owning areas:** Phase 12/13 verification strategy.

### CP-05 — Phase 15 verification requires missing Phase 01–06 reports

The Phase 15 harness expects `docs/phase-01-report.md` through `docs/phase-06-report.md`, while the current repository does not contain those reports.

**Owning area:** Phase 15 evidence/release contract.

### CP-06 — Featured project lifecycle mismatch

Firestore rules prevent unpublishing the current featured project while it remains featured, while the Project CMS UI can expose the direct unpublish action without first clearing the featured reference.

**Owning areas:** Phase 08 + Phase 12.

### CP-07 — Schema/rules boundary-length mismatch

The canonical schema and Firestore rule aggregate limits can disagree at exact maximum lengths because rule validation uses joined list representations.

**Owning area:** Phase 05.

### CP-08 — Project-view analytics can duplicate on locale changes

The project detail analytics effect depends on locale, allowing a language switch to create another `project_view` for the same project visit.

**Owning area:** Phase 13.

### CP-09 — Phase 07 media-management contract may be incomplete

Profile/services/skills expose media-path fields and Storage contracts, but their CMS workflows are weaker than the Phase 08 project media pipeline.

**Owning area:** Phase 07. Requires contract-level inspection before deciding whether this is a defect.

### CP-10 — Project media staging can leave orphaned draft objects after validation failure

Some project upload paths can stage media before final gallery cardinality validation, so an invalid selection can leave staged objects.

**Owning area:** Phase 08.

### CP-11 — Project media promotion currently buffers full objects

The project media promotion path uses full-object download/upload semantics. This is not currently classified as a blocker because the configured individual file limit is small, but it should be reviewed under the Phase 08/14 performance-hardening pass.

**Owning areas:** Phase 08 / Phase 14.

### CP-12 — Sitemap does not currently enumerate dynamic project routes

The static sitemap does not include CMS-generated `/projects/:slug` URLs.

**Owning area:** Phase 14, with Phase 09 route/data dependency.

### CP-13 — Phase 10 concurrency contract requires inspection

Review/contact optimistic-concurrency behavior may rely on lower-precision timestamp comparison than other CMS areas.

**Owning area:** Phase 10.

### CP-14 — Contact-link server-side target validation requires inspection

The Firestore rules define contact-target validation helpers, but the active contact-link validation path may not invoke the per-type target validation. Client-side validation alone is not sufficient as the canonical server-side data contract.

**Owning area:** Phase 10.

---

## Repair dependency order

The detailed repair sequence will be maintained as each phase is audited:

1. Phase 05 — canonical data/rules/storage contract
2. Phase 07 — core CMS/media contract
3. Phase 08 — project lifecycle/media/featured invariant
4. Phase 09 — public project contract and verification compatibility
5. Phase 10 — reviews/contact/concurrency/rules
6. Phase 11 — Home integration
7. Phase 12 — admin operations/settings/navigation
8. Phase 13 — analytics security/semantics/admin reads
9. Phase 14 — cross-cutting hardening/SEO/sitemap
10. Phase 15 — release verification/evidence

Phases 01–04 and 06 remain subject to their own deep audits before the final repair plan is considered complete.

**Important:** This tracker is a finding ledger, not a declaration that any listed phase is closed.


# Phase 02 — DESIGN SYSTEM, THEME, TYPOGRAPHY & MOTION

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 02 contract
- `src/styles/tokens.css`
- `src/styles/base.css`
- `src/index.css`
- all current Phase 02 UI primitives under `src/components/ui/`
- `src/design-system/DesignSystemPreview.tsx`
- current application integration points that consume the Phase 02 tokens/primitives
- package/configuration relevant to Tailwind 4 and the Phase 02 CSS pipeline

No local execution, build, lint, browser, contrast, responsive, Arabic-shaping, or reduced-motion verification was performed.

## Phase 02 direct findings

### P02-01 — Phase 02 has no dedicated report or verification harness in the current repository

The repository currently contains phase reports beginning at Phase 07 and phase test scripts beginning at Phase 07. There is no current `docs/phase-02-report.md` and no `test:phase02` script.

This does not prove the design system is incorrect, but it creates an evidence gap against the six-gate Phase 02 contract, especially Gate 4/5.

**Disposition:** record only. Do not fabricate historical evidence and do not weaken later verification. Phase 15's evidence contract must account for this.

### P02-02 — Design-system preview has an organizational/verification-surface defect

`src/design-system/DesignSystemPreview.tsx` places the "Surfaces, depth and glass" `SectionFrame` inside the "Colour tokens" section's grid container, with a divider between the two portions of that section.

The JSX structure is syntactically structured, but the verification surface is semantically confusing: the surface/depth section is rendered as part of the colour-token section rather than as a separate top-level verification section.

This does not alter production application logic, but it weakens the Phase 02 internal verification surface.

**Disposition:** low-risk Phase 02 correction candidate. It is isolated to the temporary verification page; repair can be made directly without touching downstream logic.

### P02-03 — Phase 02 defines a duration scale but the shared transition utility hard-codes only the base duration

`tokens.css` defines `--duration-fast`, `--duration-base`, and `--duration-slow`, while `transition-standard` always uses `--duration-base`.

This is not necessarily a defect: the contract can intentionally standardize normal transitions on one duration and expose the other durations for explicit animation classes. However, the current comments imply a fixed scale rather than clearly defining when fast/base/slow should be consumed.

**Disposition:** ambiguity to resolve during Phase 02 repair review, not a code change now.

### P02-04 — Phase 02 token contract is coherent, but runtime accessibility/visual claims remain unproven

The source contains semantic color tokens, Arabic typography rules, visible focus styles, logical layout conventions, and global reduced-motion rules. Static inspection cannot establish actual WCAG contrast ratios, font shaping quality, responsive behavior, browser rendering, or reduced-motion behavior.

**Disposition:** record only; verify in the later testing stage.

## Phase 02 cross-phase findings

### P02-CP01 — Later-phase code must be checked for design-token bypasses

Phase 02 explicitly states that later phases should consume tokens and primitives rather than invent raw color/radius/shadow/timing values. A full repository-wide violation inventory should be performed during the Phase 02 repair pass or as a dedicated cross-cutting check.

**Disposition:** open integration check. Do not broadly refactor during this audit.

### P02-CP02 — Phase 14 adds later hardening that must not be mistaken for Phase 02 evidence

Current accessibility, SEO, performance and App Check-related changes belong to later phases. They do not retroactively provide Phase 02 Gate 4/5 evidence.

**Disposition:** preserve phase attribution.

## Phase 02 conclusion

No confirmed production logic/security/data-contract defect was found in the Phase 02 token primitives themselves.

The main actionable Phase 02 issue found is the isolated organization of the temporary Design System Preview; the evidence/harness gap is recorded separately.

**Phase 02 is not CLOSED.**

# Phase 03 — APPLICATION ARCHITECTURE, ROUTING, LAYOUTS & ERROR MODEL

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 03 contract
- `src/App.tsx`
- `src/routes/Root.tsx`
- `src/routes/PublicLayout.tsx`
- `src/routes/AdminLayout.tsx`
- `src/routes/AdminAccessBoundary.tsx` (later-phase integration, not attributed to Phase 03)
- `src/routes/ErrorFallback.tsx`
- `src/routes/NotFound.tsx`
- `src/components/ui/LoadingFallback.tsx`
- `tsconfig.app.json`
- current route/error/loading integration in the application
- current phase-report/test-script availability

No local execution, build, lint, browser, deep-navigation, refresh, mobile or runtime error verification was performed in this audit.

## Phase 03 direct findings

### P03-01 — Current repository has no dedicated Phase 03 report or verification harness

The current repository has phase reports/test scripts beginning later in the project history, but no `docs/phase-03-report.md` and no `test:phase03` script.

This creates an evidence gap against the Phase 03 six-gate contract, especially Gate 4/5. It does not by itself prove the router implementation is incorrect.

**Disposition:** record only. Do not fabricate historical evidence or weaken later verification.

### P03-02 — Unused router placeholder helper in `src/App.tsx`

`App.tsx` contained a `placeholder()` helper plus `useI18n` and `TranslationKey` imports that were no longer used by the current route tree.

The project explicitly enables `noUnusedLocals: true` in `tsconfig.app.json`, so this was a genuine isolated compile/typecheck risk.

**Action taken during this audit:** removed the dead helper and its now-unused imports. No route behavior, architecture boundary, dependency, or later-phase contract was changed.

Commit: `d5c2b5e283de06f556fea43b42929e24752607e7`

### P03-03 — `Root.tsx` is currently a dead architectural artifact

`src/routes/Root.tsx` exports `RootHandle` and a `Root` component, but the active router in `App.tsx` does not use the `Root` component; it imports only the `RootHandle` type.

This is not a functional defect by itself, and deleting/restructuring it would cross into architectural cleanup without a demonstrated need.

**Disposition:** record only. Do not remove or redesign it during this audit.

### P03-04 — Route handles are currently duplicated/dead metadata

The router defines `handle: { title: ... }` metadata using hardcoded English strings, while the active AdminLayout navigation/header resolves translated labels from `TranslationKey` values and PublicLayout derives titles separately from pathname/i18n.

No current code inspected in this audit requires the `RootHandle.title` strings for navigation or SEO.

This creates a duplicated route-label contract and a potential future drift point, but it is not safe to refactor without defining the intended route metadata consumer.

**Disposition:** architecture ambiguity; record for later integration review, no change now.

## Phase 03 cross-phase findings

### P03-CP01 — Current App router contains later-phase feature routes

The Phase 03 contract says the initial implementation should establish the routing/layout skeleton with no feature pages. The current `App.tsx` contains later public CMS/project/review/contact routes and admin feature routes.

These are later-phase additions and must not be treated as Phase 03 implementation evidence. They are also not evidence that Phase 03 itself was scoped incorrectly.

**Disposition:** preserve phase attribution; no rollback.

### P03-CP02 — Admin route protection belongs to Phase 04, not Phase 03

The current `/admin` route is wrapped by `AdminAccessBoundary`, which is a later authentication/authorization integration. This is correct as a current-system integration, but it must not be counted as Phase 03 security evidence.

**Disposition:** preserve phase attribution; Phase 04 owns authentication/authorization correctness.

### P03-CP03 — Analytics/SEO logic now lives in the Phase 03/06 public shell

`PublicLayout.tsx` currently contains later analytics tracking and SEO integration. These are later-phase additions and are not attributable to the original Phase 03 shell contract.

The previously tracked Phase 13 analytics concerns remain owned by Phase 13.

**Disposition:** no rollback during Phase 03 audit.

### P03-CP04 — Runtime route behavior remains unproven

Static inspection establishes the intended route tree, nested layouts, generic route error element, 404 route, and Suspense loading boundary. It cannot prove browser refresh/deep-link behavior under the deployed hosting rewrite, lazy-chunk failure behavior, unknown-route behavior, or mobile navigation behavior.

**Disposition:** verify during the dedicated testing stage; do not claim Gate 4 PASS from static inspection.

## Phase 03 conclusion

One simple isolated defect was found and fixed: the dead `placeholder()` helper/imports in `App.tsx`.

No confirmed routing, layout, error-model, security-boundary, or data-contract defect requiring structural change was found during this static audit.

**Phase 03 is not CLOSED.**

# Phase 04 — AUTHENTICATION, ADMIN IDENTITY & AUTHORIZATION

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 04 contract
- `src/auth/AuthProvider.tsx`
- `src/auth/context.ts`
- `src/auth/types.ts`
- `src/routes/AdminAccessBoundary.tsx`
- `src/routes/SignIn.tsx`
- `src/firebase/app.ts`
- `scripts/provision-admin.mjs`
- current Firestore/Storage authorization helpers and privileged-write boundaries
- current application router integration
- current package scripts and phase-evidence availability

No local execution, Firebase emulator rules test, real Google sign-in, token-refresh test, claim-revocation test, or browser verification was performed in this audit.

## Phase 04 direct findings

### P04-01 — Phase 04 has no dedicated report or verification harness in the current repository

The repository currently has no `docs/phase-04-report.md` and no `test:phase04` script.

This is an evidence gap against the six-gate Phase 04 contract, especially the authenticated/unauthenticated/unauthorized and claim-refresh verification required by Gate 4, plus the denied-case evidence required by Gates 5/6.

**Disposition:** record only. Do not fabricate evidence or add a synthetic PASS.

### P04-02 — `AuthProvider.refetch()` does not handle claim-read failure

`refetch()` awaits `loadClaims(user, true)` without a `try/catch`.

The initial `onAuthStateChanged` path deliberately uses deny-by-default handling when token claims cannot be read. The manual `Refresh access` path does not have the same failure handling: if `getIdTokenResult(true)` rejects, the returned promise rejects and the current auth state is left unchanged.

This is not a direct privilege-escalation path because the client cannot create the trusted custom claim and Firestore/Storage authorization remains server-side. It is, however, an inconsistency in the authentication failure/recovery contract and can leave stale UI state after a failed forced refresh.

**Disposition:** confirmed hardening defect. Record for repair; do not patch during this audit because the requested workflow is audit-first and the fix should be made in the Phase 04 repair pass.

### P04-03 — Async auth-state callback has a potential stale-result race

`onAuthStateChanged` invokes an async callback that awaits `loadClaims()`. A later auth-state change (including sign-out) can occur before the earlier token-read promise resolves. There is no generation/request guard to prevent a late result from calling `setState({ status: 'authenticated', ... })` after a newer auth state has already been established.

The security boundary remains authoritative in Firestore/Storage rules, so this is primarily a client-state consistency issue rather than a demonstrated privilege-escalation bypass. It can nevertheless produce stale authenticated/admin UI during rapid account/session changes.

**Disposition:** hardening finding. Repair during Phase 04 repair pass with a cancellation/generation guard; do not broaden into unrelated auth refactoring.

### P04-04 — Admin claim provisioning is correctly kept outside the browser

`scripts/provision-admin.mjs` uses Firebase Admin SDK/Application Default Credentials and exposes explicit `status`, `grant`, and `revoke` commands. No browser route, localStorage value, or client field can assign the trusted claim.

The script also revokes refresh tokens on admin removal. The repository documents the remaining limitation that an already-issued ID token can remain valid until expiry; this is consistent with Firebase custom-claim/token semantics and must be covered by runtime verification rather than treated as an immediate client-state revocation mechanism.

**Disposition:** no code change.

### P04-05 — Authorization model is deny-by-default and server-authoritative in current rules

Current Firestore and Storage rules use `request.auth.token.admin == true` as the trusted admin boundary. Public reads are separately constrained by publication state, and unmatched paths fall through to explicit deny rules.

This is an important current-system integration of Phase 04, but the actual allow/deny behavior still requires emulator/runtime evidence. Static inspection cannot claim the rules execute correctly in Firebase.

**Disposition:** no code change during Phase 04 audit; verify with denied-case tests later.

## Phase 04 cross-phase findings

### P04-CP01 — Current privileged CMS behavior depends on the Phase 05+ rules contract

The Phase 04 admin identity is consumed by later Firestore/Storage rules and CMS features. Any repair to the claim shape or admin boundary must therefore preserve the exact `admin: true` contract used by those rules.

**Disposition:** dependency constraint; do not alter claim naming/type casually.

### P04-CP02 — Phase 13 App Check is additional protection, not a replacement for Phase 04 authorization

The current application also initializes App Check and the analytics callable enforces it, but App Check does not replace Firebase Auth custom-claim authorization for admin CMS operations.

**Disposition:** preserve phase attribution; no change.

### P04-CP03 — Real claim-refresh/revocation behavior remains unverified

Static code shows:
- forced token refresh after sign-in;
- a manual `Refresh access` action;
- server-side claim provisioning;
- refresh-token revocation on admin removal.

It does not prove the live Firebase token actually changes, that a newly granted claim becomes visible without a fresh sign-in, or that revoked sessions lose access as expected after token expiry/refresh.

**Disposition:** runtime verification required.

## Phase 04 conclusion

No confirmed browser-side self-promotion, client-side authorization bypass, or insecure admin-claim assignment path was found.

Two hardening findings were identified:
1. `refetch()` lacks deny-by-default error handling.
2. The async auth-state listener has a potential stale-result race.

No code was changed during this audit because both findings belong to the Phase 04 repair pass rather than being trivial isolated syntax/unused-code corrections.

**Phase 04 is not CLOSED.**

# Phase 05 — DATA MODEL, SCHEMAS, INDEXES & STORAGE CONTRACT

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 05 contract
- `src/data/types.ts`
- `src/data/enums.ts`
- `src/data/paths.ts`
- `src/data/schema/core.ts`
- `src/data/schema/schemas.ts`
- `src/data/schema/index.ts`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `docs/data-model.md`
- `scripts/test-schema.ts`
- `scripts/test-rules.mjs`
- current package scripts and phase-evidence availability

No local execution, Emulator Suite run, schema test, rules test, index deployment validation, or production Firebase verification was performed in this audit.

## Phase 05 direct findings

### P05-01 — Schema/rules maximum-length contract mismatch

This is the main confirmed Phase 05 contract defect.

The runtime schema allows:
- `projects.technologies`: up to 30 strings × 60 characters each.
- `projects.galleryPaths`: up to 12 paths × 512 characters each.

The Firestore rules enforce these lists through `join()` plus an aggregate joined-string limit:
- technologies: `maxJoinedLength = 1800`
- gallery paths: `maxJoinedLength = 6144`

The separators added by `join()` mean a schema-valid maximum-size list can exceed the rules aggregate budget. For example:
- technologies at 30×60 characters require 1,829 joined characters with 29 commas, so the rules can reject a value accepted by the schema.
- gallery paths at 12×512 characters require 6,155 joined characters with 11 separators, so the rules can reject a value accepted by the schema.

This directly violates the documented intent that the runtime schema and rules should describe the same structural contract.

**Disposition:** confirmed Phase 05 blocker-level contract mismatch. Fix in the Phase 05 repair pass. Do not solve by weakening the rules or by silently lowering schema limits; first reconcile the canonical intended limits and then make both layers/test evidence agree.

### P05-02 — Timestamp parser is structurally under-constrained

`src/data/schema/core.ts` checks that `seconds` and `nanoseconds` are integers, but it does not enforce the valid Firestore timestamp nanosecond range (0–999,999,999) or a meaningful seconds range.

This means the application-level parser can accept structurally malformed timestamp-shaped objects that are not valid Firestore Timestamp values.

This does not create a direct Firestore authorization bypass because Firestore rules require actual timestamp equality against `request.time` for writes. It is nevertheless a runtime schema correctness gap at the declared trust boundary.

**Disposition:** confirmed schema hardening defect. Repair in Phase 05; add explicit rejection cases to the schema test.

### P05-03 — Phase 05 has no dedicated phase report or `test:phase05` harness

The repository contains `scripts/test-schema.ts` and the broader `test:rules` harness, but no dedicated `docs/phase-05-report.md` and no `test:phase05` package script.

This is an evidence/closure gap, not proof that the implementation itself is wrong.

**Disposition:** record only; do not fabricate historical Gate 4–6 evidence.

### P05-04 — Rules-language limitation for list element typing is explicitly documented

`isStringList()` and `isMediaPathList()` use aggregate `join()` checks because Firestore rules cannot perform the same per-element validation as the runtime schema. `scripts/test-rules.mjs` deliberately records a non-string technology element as a documented limitation rather than falsely treating it as a security PASS.

This is acceptable as a declared division of responsibility for an admin-only write boundary, provided the application schema is always used by CMS writers and the security boundary does not depend on element typing for authorization.

**Disposition:** no direct change during audit. Preserve the explicit limitation and ensure Phase 05 documentation does not imply the rules independently validate every list element.

### P05-05 — Firestore indexes file is present and aligned with the documented ordered queries

The previously tracked missing-index-file concern is no longer applicable to the current repository state: `firestore.indexes.json` exists and contains the six documented composite indexes plus field overrides for analytics maps.

**Disposition:** close/remove CP-01 from the active repair queue if it remains listed as an unresolved finding.

## Phase 05 cross-phase findings

### P05-CP01 — Contact-link server validation documentation currently overstates the rules boundary

`docs/data-model.md` states that contact target safety is checked in both Firestore rules and the application validation layer. The current `contactLinks.valid()` rule validates the allowed type and string shape but does not call the defined `isContactTarget()` helper.

The application schema does reject obvious unsafe schemes, but the server rules do not currently enforce the per-type target contract described in the documentation.

This is primarily owned by the later Phase 10 contact-link contract, but the mismatch originates in the canonical Phase 05 rules/data contract and must be reconciled before final closure.

**Disposition:** record cross-phase; do not make the Phase 10-specific repair during this Phase 05 audit.

### P05-CP02 — Analytics collections are represented in indexes/docs but not yet in the Phase 05 canonical collection map

The current `COLLECTIONS`/document schema map intentionally covers the v1 CMS documents only, while analytics is server-owned and implemented later. The indexes file and data-model document already describe `analyticsDaily` and `analyticsVisitors`.

This is not necessarily a Phase 05 defect because the AGENTS Phase 05 objective predates the later server-owned analytics design. It should remain explicitly phase-attributed so Phase 13 can own the analytics data contract.

**Disposition:** no change.

### P05-CP03 — Featured-project invariant is later hardened by Phase 08

The canonical Phase 05 model defines `settings/main.featuredProjectId`; current rules now enforce existence/publication and protect the currently featured project from deletion/unpublishing. These later hardenings must not be mistaken for original Phase 05 closure evidence.

**Disposition:** preserve phase attribution.

## Phase 05 conclusion

Two confirmed implementation/schema defects were found:
1. Schema/rules aggregate-length mismatch for maximum-size technology/gallery lists.
2. Timestamp parser accepts malformed timestamp-shaped values.

One evidence gap exists:
- no dedicated Phase 05 report or phase-specific harness.

The index-file finding previously tracked globally is resolved in the current repository.

**Phase 05 is not CLOSED.**
