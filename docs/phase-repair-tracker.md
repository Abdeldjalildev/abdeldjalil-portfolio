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

### CP-01 — Missing current `firestore.indexes.json` while `firebase.json` references it — RESOLVED

The repository now contains `firestore.indexes.json` at the referenced path, with the canonical composite indexes and analytics field overrides.

**Owning areas:** Phase 05 / Phase 15 release verification.

**Status:** resolved by current repository state; remaining index deployment/runtime verification belongs to the dedicated testing stage.

### CP-02 — Phase 13 analytics Firestore read contract is incomplete — RESOLVED

The Phase 13 repair pass added an explicit `analyticsDaily/{date}` rule allowing reads only for the trusted admin claim, while browser writes remain denied.

**Owning area:** Phase 13, with Phase 05 contract dependency.
**Status:** resolved at repository level; runtime/emulator verification remains pending.

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

### CP-08 — Project-view analytics can duplicate on locale changes — RESOLVED

The Phase 13 repair pass changed the project-view effect dependency from `[project, locale]` to `[project]`, so locale changes no longer retrigger the event for the same loaded project.

**Owning area:** Phase 13.
**Status:** resolved at repository level; runtime event verification remains pending.

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

**Disposition:** fixed in the Phase 05 repair pass. Firestore rule aggregate budgets now account for the separators introduced by `join()`: technologies 1,829 and gallery paths 6,155. Boundary-acceptance tests were added to `scripts/test-schema.ts`. Runtime Emulator verification remains pending.

### P05-02 — Timestamp parser is structurally under-constrained

`src/data/schema/core.ts` checks that `seconds` and `nanoseconds` are integers, but it does not enforce the valid Firestore timestamp nanosecond range (0–999,999,999) or a meaningful seconds range.

This means the application-level parser can accept structurally malformed timestamp-shaped objects that are not valid Firestore Timestamp values.

This does not create a direct Firestore authorization bypass because Firestore rules require actual timestamp equality against `request.time` for writes. It is nevertheless a runtime schema correctness gap at the declared trust boundary.

**Disposition:** fixed in the Phase 05 repair pass. The parser now enforces the Firestore Timestamp nanosecond range (0–999,999,999) and the documented Firestore seconds range, with rejection tests added. Runtime verification remains pending.

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

### P05-CP01 — Contact-link server validation documentation overstatement — RESOLVED

The Phase 10 repair pass wired the existing `isContactTarget(type, value)` helper into the canonical `contactLinks/{linkId}` Firestore write-validation path. The current rules therefore enforce the documented per-type target contract at the server boundary.

**Disposition:** resolved by the Phase 10 repair. No additional Phase 05 code change is required.

### P05-CP02 — Analytics collections are represented in indexes/docs but not yet in the Phase 05 canonical collection map

The current `COLLECTIONS`/document schema map intentionally covers the v1 CMS documents only, while analytics is server-owned and implemented later. The indexes file and data-model document already describe `analyticsDaily` and `analyticsVisitors`.

This is not necessarily a Phase 05 defect because the AGENTS Phase 05 objective predates the later server-owned analytics design. It should remain explicitly phase-attributed so Phase 13 can own the analytics data contract.

**Disposition:** no change.

### P05-CP03 — Featured-project invariant is later hardened by Phase 08

The canonical Phase 05 model defines `settings/main.featuredProjectId`; current rules now enforce existence/publication and protect the currently featured project from deletion/unpublishing. These later hardenings must not be mistaken for original Phase 05 closure evidence.

**Disposition:** preserve phase attribution.

## Phase 05 conclusion

Two confirmed implementation/schema defects were found and repaired:
1. Schema/rules aggregate-length mismatch for maximum-size technology/gallery lists — repaired.
2. Timestamp parser accepted malformed timestamp-shaped values — repaired.

One evidence gap exists:
- no dedicated Phase 05 report or phase-specific harness.

The index-file finding previously tracked globally is resolved in the current repository.

**Phase 05 is not CLOSED.** The repair pass is complete for the two confirmed code/schema defects, but Gate 4–6 runtime/evidence requirements remain pending.


# Phase 05 — Repair Pass

## Repair status

**Phase 05 repair pass verified complete at repository level.**

The repair dependency order identifies Phase 05 as the first structural repair stage. Current repository inspection confirms that both Phase 05 implementation defects recorded by the audit are already repaired in the default branch:

1. **P05-01 — schema/rules aggregate-length mismatch:** Firestore rules now budget for the separators introduced by `join()` (technologies: 1,829; gallery paths: 6,155), matching the maximum schema-valid lists.
2. **P05-02 — malformed timestamp acceptance:** the runtime timestamp parser now enforces nanoseconds 0–999,999,999 and the supported Firestore seconds range, with rejection cases present in `scripts/test-schema.ts`.

The previously reported missing `firestore.indexes.json` is also resolved, and the Phase 10 contact-target repair has removed the related cross-phase rules/documentation mismatch.

### Verification performed in this repair pass
- Re-read the canonical Phase 05 schema core and schemas.
- Re-read `firestore.rules` and confirmed the repaired aggregate budgets.
- Re-read `scripts/test-schema.ts` and confirmed maximum-boundary acceptance plus malformed-timestamp rejection cases.
- Confirmed `firestore.indexes.json` exists at the path referenced by `firebase.json`.
- Reconciled the Phase 05 contact-link boundary with the completed Phase 10 server-side validation repair.

### Verification not performed
No local Node test, Firestore Emulator run, Storage Emulator run, index deployment, or production Firebase execution was performed. Therefore runtime Gate 4–6 evidence remains pending exactly as required by `AGENTS.md`.

**Phase 05 remains NOT CLOSED.** This repair pass does not alter the owner-controlled phase ledger.



### Repair execution note — 2026-09-25

During the repository repair execution, `firestore.rules` was found with a malformed duplicated/truncated tail after the canonical closing braces. The canonical Phase 05 rules block was restored from the intact first ruleset, preserving the repaired list budgets and server-side contact-target validation.

Repository-level recheck after the repair:
- exactly one `rules_version = '2';` declaration;
- exactly one Firestore `/databases/{database}/documents` rules block;
- technologies aggregate budget: **1,829**;
- gallery-path aggregate budget: **6,155**;
- canonical `contactLinks` validation includes `isContactTarget(...)`;
- explicit catch-all deny remains present.

Repair commit: `9987e204c88214ec0aa5faae1821fec0a4b0c120`

No local/emulator execution was performed. The phase remains **NOT CLOSED**, and no phase advancement was performed.
**I did not advance to the next phase.**


# Phase 06 — PUBLIC SHELL, NAVIGATION, FOOTER & I18N/RTL

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 06 contract
- `src/components/shell/PublicHeader.tsx`
- `src/components/shell/PublicFooter.tsx`
- `src/components/shell/MobileNav.tsx`
- `src/components/shell/LocaleSwitcher.tsx`
- `src/components/shell/navigation.ts`
- `src/routes/PublicLayout.tsx`
- `src/i18n/I18nProvider.tsx`
- `src/i18n/context.ts`
- `src/i18n/types.ts`
- `src/i18n/helpers.ts`
- `src/i18n/index.ts`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/ar.ts`
- `src/main.tsx`
- `src/App.tsx`
- current package scripts and phase-evidence availability

No local execution, build, lint, browser, responsive, keyboard, RTL, hydration, or runtime verification was performed in this audit.

## Phase 06 direct findings

### P06-01 — No dedicated Phase 06 report or verification harness

The current repository has no `docs/phase-06-report.md` and no `test:phase06` package script.

This creates an evidence gap against the Phase 06 six-gate contract, especially Gate 4/5/6. Static source inspection cannot substitute for the required EN/AR, RTL, keyboard, mobile-drawer and runtime/hydration evidence.

**Disposition:** record only. Do not fabricate historical evidence or weaken later verification.

### P06-02 — Public Home navigation item was incorrectly active on every public route

`PUBLIC_NAVIGATION` used `to: '/'` without an exact-match/end contract. React Router's `NavLink` therefore treats the root link as active for descendant paths such as `/about`, `/projects`, and `/contact`.

This is a real Phase 06 navigation-state defect: the Home item can appear selected while another public route is active.

**Action taken during this audit:** added an optional `end` field to the canonical public-navigation contract and set `end: true` for the Home item. `PublicHeader` and `MobileNav` already pass navigation properties through to `NavLink` only via the current object destructuring, so the audit also confirmed that the consumer must be updated to pass `end` for the fix to take effect.

**Important:** because the current consumers destructure only `key, to`, the first isolated patch is incomplete by itself. The final repair must update both consumers to destructure `end` and pass it to `NavLink`. This remained a small, isolated Phase 06 repair and was completed by updating both public navigation consumers to pass the exact-match field to `NavLink`.

Audit commits: `30c784c41d896031738b155c2f801ca6809c0ded` (contract field), `6a98598bf5b91e2c4a684ab2b2a0778574e5c277` (header consumer), `861b8bf7c37f7778fd967a64e1d6e0423ad3d3d6` (mobile consumer).

**Disposition:** resolved by the isolated audit fix; no broader navigation refactor was made.

### P06-03 — Runtime claims remain unproven

The source implements:
- EN/AR locale dictionaries with compile-time parity via `satisfies typeof import('./en.ts').en`;
- `<html lang>` and `<html dir>` synchronization;
- persisted locale selection;
- RTL-aware logical positioning in the shell;
- mobile drawer focus trapping, Escape handling, body-scroll locking and focus restoration;
- localized navigation/footer labels.

Static inspection cannot prove actual Arabic rendering/shaping, responsive layout, focus behavior in a browser, reduced-motion interaction, or deep-link/refresh behavior under hosting.

**Disposition:** runtime verification required.

### P06-04 — Public footer performs a client-side published-links query without explicit Firestore ordering

`PublicFooter` queries published contact links and then sorts the validated documents in JavaScript.

This is functionally deterministic for the returned set and avoids requiring an order index, so it is not a confirmed defect. However, it differs from the canonical Phase 10 contact-link public query contract, which uses server-side `where(published == true) + orderBy(order)`.

**Disposition:** record as an integration consistency point, not a Phase 06 defect. Do not change during this audit unless the canonical public-footer contract is explicitly frozen to server-side ordering.

## Phase 06 cross-phase findings

### P06-CP01 — Public shell now contains later analytics and SEO behavior

`PublicLayout` currently tracks `page_view` and renders the centralized `Seo` component. These are later-phase integrations and must not be counted as original Phase 06 Gate 3/4 evidence.

The analytics semantics remain owned by Phase 13, including the previously identified duplicate project-view-on-locale-switch issue.

**Disposition:** preserve phase attribution.

### P06-CP02 — Public footer now depends on later Phase 05/10 data contracts

The footer reads dynamic `contactLinks` data and validates it against the Phase 05 schema. This is a legitimate current integration, but it is later functionality layered onto the original shell.

Any change to contact-link schema/rules/query semantics must be owned by the data/contact phases rather than patched as an unrelated shell refactor.

**Disposition:** preserve phase attribution.

### P06-CP03 — App Check bootstrap in `main.tsx` is later-phase behavior

The current `main.tsx` initializes optional App Check before rendering the app. This was introduced for the later analytics/security boundary and does not alter the Phase 06 i18n architecture.

**Disposition:** no change.

### P06-CP04 — Admin mobile navigation is outside Phase 06 ownership

`AdminLayout` now contains its own mobile navigation and focus behavior. This is a later Phase 12 admin-operations integration and should not be used as evidence for the public Phase 06 mobile drawer.

**Disposition:** preserve phase attribution.

## Phase 06 conclusion

One simple isolated Phase 06 navigation defect was identified: the Home `NavLink` lacked an exact-match/end contract.

The contract field and both consumers were updated during the audit, so the Home exact-match defect is **resolved**.

No confirmed i18n/RTL architecture, security, data-contract, or footer correctness defect was found from static inspection.

**Phase 06 is not CLOSED.**


# Phase 07 — PROFILE, ABOUT, SERVICES & SKILLS CMS

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 07 contract
- `src/features/cms/data.ts`
- `src/features/cms/ProfileAdmin.tsx`
- `src/features/cms/ServicesAdmin.tsx`
- `src/features/cms/SkillsAdmin.tsx`
- `src/features/public/About.tsx`
- `src/features/public/Services.tsx`
- `src/data/types.ts`
- `src/data/paths.ts`
- `src/data/schema/core.ts`
- `src/data/schema/schemas.ts`
- `firestore.rules`
- `scripts/test-phase07.mjs`
- `docs/phase-07-report.md`
- Phase 05 data-model contract

No local execution, build, lint, emulator/rules test, browser CRUD test, or responsive/RTL runtime verification was performed.

## Phase 07 direct findings

### P07-01 — Phase 07 report does not satisfy the full required evidence template

`docs/phase-07-report.md` documents implementation and pending verification, but it does not fully provide all fields required by AGENTS.md §8, notably a concrete commands/results section and a complete inspected/changed-files + dependency-change record in the prescribed phase-report structure.

This is an evidence/documentation gap, not proof of a runtime defect.

**Disposition:** record only. Repair the report/evidence package during the Phase 07 repair/closure pass; do not invent execution results.

### P07-02 — Phase 07 verification harness is static and does not verify the phase's critical runtime contract

`scripts/test-phase07.mjs` checks translation parity, route wiring, schema references, transaction usage, publication filtering, localStorage absence, and rule anchors. It does not execute the schema/rules contract, CRUD operations, concurrency behavior, malformed-document handling, or CMS-to-public propagation.

The report correctly states that `test:phase07` has not been executed in the current environment, so this is an evidence limitation rather than a false PASS.

**Disposition:** record only. Do not weaken or replace the existing checks; supplement with runtime evidence in the dedicated testing stage.

### P07-03 — CMS media fields are raw Storage-path inputs rather than a media-management workflow

The Profile, Services, and Skills admin forms expose `avatarPath`, `resumePath`, and `iconPath` as plain text fields. There is no Phase 07 upload/select/delete workflow comparable to the later Project media pipeline.

This is not automatically a Phase 07 defect because the explicit Phase 07 gate contract requires admin CRUD/public rendering, while the master product contract says media belongs in Storage and Firestore stores references. The current implementation does use Storage-path references and the Storage rules, but it leaves the operator responsible for supplying the path manually.

**Disposition:** contract clarification required. Keep as an open Phase 07 operational gap until the owner confirms whether Phase 07 must provide first-class media management for profile/service/skill assets. Do not invent a new upload architecture during this audit.

### P07-04 — Public malformed-document handling is intentionally fail-soft, but its observability is limited

`listServices()` and `listSkills()` validate each returned document and skip malformed records while incrementing `invalidCount`. The public About/Services pages consume only the valid items and do not surface an invalid-record condition to visitors.

This protects the public UI from rendering malformed Firestore data, but it can also make data corruption invisible to the public-facing operator unless the admin view is used. The admin pages do expose `invalidCount`.

**Disposition:** no direct defect requiring change. Preserve the fail-soft public behavior and verify the admin invalid-count path at runtime.

## Phase 07 cross-phase findings

### P07-CP01 — Profile/service/skill Storage references are only structurally validated

Phase 05 `mediaPath()` validates a generic safe Storage path. Phase 07 fields therefore cannot prove that:
- a profile avatar points into `profile/avatar/`;
- a resume points into `profile/resume/`;
- a service icon points into `services/{id}/icon/`;
- a skill icon points into `skills/{id}/icon/`.

The Storage rules independently control which objects are readable, so this is not a demonstrated authorization bypass. It is a data-integrity/path-contract question that should be reconciled if first-class media management is required.

**Owning areas:** Phase 05 canonical contract + Phase 07 media workflow.

### P07-CP02 — Phase 07 concurrency protection is stronger for writes than deletes

Profile/service/skill updates use transactions and exact Firestore `Timestamp.isEqual()` checks for optimistic concurrency. Service and skill deletes use direct `deleteDoc()` without a compare-before-delete condition.

This does not necessarily violate the Phase 07 gate contract, which requires CRUD rather than delete concurrency semantics, but it means a stale admin tab can delete a record changed by another admin without an explicit conflict.

**Disposition:** record as hardening consideration; do not redesign deletion semantics without an explicit concurrency contract.

### P07-CP03 — Phase 07 public queries depend on the Phase 05 composite indexes

Published services/skills use `where('published', '==', true) + orderBy('order')`. The documented Phase 05 index set covers these queries.

**Disposition:** no defect. Preserve this dependency during Phase 05 repair.

## Phase 07 conclusion

No confirmed Phase 07 security bypass, publication-filter defect, schema-bypass defect, or broken CRUD contract was found by static inspection.

Open findings are primarily:
1. evidence/report completeness;
2. runtime verification still pending;
3. media-management contract clarification;
4. delete-concurrency hardening consideration.

**Phase 07 is not CLOSED.**

# Phase 07 — Repair Plan

**Repair order:**
1. **P07-R1 — Reconcile services Firestore rule with the canonical Phase 05/07 service schema — COMPLETED.** Removed the unrelated `isContactTarget(type, value)` check from `services/{serviceId}`. The service rule now validates only the documented service fields and retains admin-only authorization, timestamp constraints, publication reads, slug immutability and ordering/path/localized-content validation.
2. **P07-R2 — Regression guard — COMPLETED.** Strengthened `scripts/test-phase07.mjs` to isolate the `services/{serviceId}` rule block and assert both the expected service field contract and the absence of contact-link target validation.
3. **P07-R3 — Static re-inspection — COMPLETED.** Re-read the repaired rule block, Phase 07 harness and report. The cross-file schema/rules mismatch is no longer present in the inspected source.

Remaining Phase 07 items are not implementation blockers suitable for this repair pass: runtime verification remains pending; the media-management question requires owner/product contract clarification; delete-concurrency is a hardening consideration rather than a confirmed Phase 07 contract violation; report closure still requires execution evidence and owner acceptance.

**No local/runtime tests were executed or claimed.**

**Phase 07 repair pass is complete for the confirmed implementation defect. Phase 07 remains NOT CLOSED.**

# Phase 08 — PROJECT CMS & MEDIA PIPELINE

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 08 contract
- `src/features/cms/projects.ts`
- `src/features/cms/ProjectsAdmin.tsx`
- canonical Phase 05 project schema/types/paths
- `firestore.rules`
- `storage.rules`
- `scripts/test-phase08.mjs`
- `docs/phase-08-report.md`
- `docs/data-model.md`
- current Phase 08 package/test wiring

No local execution, build, lint, Emulator Suite rules test, Storage runtime test, browser CMS test, or real Firebase Auth session was performed in this audit.

## Phase 08 direct findings

### P08-01 — Project media can be staged before gallery-cardinality validation

`ProjectsAdmin.upload()` uploads every selected gallery file first and only afterwards checks whether the resulting gallery exceeds the 12-item limit. If the selection pushes the gallery above the limit, the UI reports the validation error but the newly uploaded draft objects have already been created and are not automatically deleted.

This can leave orphaned objects under the admin-only draft area.

**Disposition:** confirmed Phase 08 media-lifecycle defect. Repair in the Phase 08 repair pass by validating the final cardinality before staging, or by deterministically cleaning every newly staged object when validation fails. Do not weaken the 12-item contract.

### P08-02 — Project deletion is not storage/Firestore atomic and can orphan or destroy media before a denied Firestore delete

`deleteProject()` deletes all referenced Storage media before deleting the Firestore project document. The Firestore rules independently deny deletion of the currently featured project. Therefore a stale or concurrently changed featured state can cause the Storage deletion to succeed while the Firestore deletion is rejected, leaving the project document without its media.

The UI normally clears the featured reference before calling `deleteProject()`, but the data-layer operation itself does not establish an atomic precondition and cannot roll back already-deleted Storage objects.

**Disposition:** confirmed Phase 08 lifecycle/data-integrity hardening defect. Repair in Phase 08. The repair must preserve server-authoritative featured enforcement; do not bypass the Firestore rule.

### P08-03 — Delete operation has no optimistic-concurrency guard

`deleteProject()` accepts only the current `ProjectRecord` and performs a direct Firestore `deleteDoc()`. Unlike project saves, it does not compare `updatedAt` in a transaction before deleting.

A stale admin tab can therefore delete a project that another admin has modified since the first tab loaded it, assuming the project is not currently featured.

**Disposition:** confirmed concurrency hardening gap. Repair in Phase 08 or explicitly document deletion as last-write-wins. Given the existing optimistic-concurrency contract for project writes, preserving the same protection for destructive deletion is the safer consistent contract.

### P08-04 — Phase 08 report claims static checks as PASS but does not provide actual execution evidence

The report lists static verification items as PASS and separately states that `npm run test:phase08`, `test:schema`, `test:rules`, build and runtime flows were not executed.

The distinction is mostly clear, but the report does not contain a dedicated command/result transcript and therefore cannot satisfy AGENTS §8 as the final six-gate evidence package.

**Disposition:** evidence gap. Repair the report during the closure/evidence pass; do not invent execution results.

## Phase 08 cross-phase findings

### P08-CP01 — Featured-project lifecycle mismatch remains a UI/data-layer integration issue

Firestore rules prevent the currently featured project from being unpublished while it remains featured. The CMS exposes unpublish through the general save flow without automatically clearing the featured reference first.

The delete UI does clear featured first, but unpublish does not.

**Owning areas:** Phase 08 + Phase 12. Repair should keep the server-side invariant authoritative and make the CMS operation handle the lifecycle coherently.

### P08-CP02 — Full-object media promotion uses `getBytes()` + `uploadBytes()`

Promotion/unpublish movement buffers each entire object in memory. Individual project media is bounded, but repeated gallery operations can increase client memory pressure.

**Owning areas:** Phase 08 / Phase 14 performance hardening. Not a closure blocker by itself at the current file limits.

### P08-CP03 — Project media path classification is string-based

`moveMediaPaths()` infers thumbnail vs gallery from whether the source path contains `/thumbnail/` or `-thumbnail/`. Current canonical paths make this work, but the operation relies on path-shape conventions rather than an explicit media-kind parameter for every move.

**Disposition:** record as a coupling point, not a confirmed defect. Do not refactor without a demonstrated failure.

## Phase 08 conclusion

Four direct findings were recorded:
1. staged gallery uploads can become orphaned when the final cardinality is invalid;
2. deletion can remove Storage media before a Firestore delete is denied;
3. project deletion lacks the existing optimistic-concurrency protection;
4. the phase report/evidence package is incomplete for final closure.

One existing cross-phase finding is confirmed again: the featured-project unpublish lifecycle is inconsistent between UI/data layer and Firestore rules.

**Phase 08 is not CLOSED.**


# Phase 08 — Repair Pass

**Repair status: COMPLETED for the confirmed Phase 08 production-code findings.**

### P08-R1 — Pre-validate gallery cardinality and clean failed staging
- `ProjectsAdmin.upload()` now rejects a gallery selection that would exceed the canonical 12-item limit **before** any upload begins.
- Newly staged objects are tracked and deleted if a later upload in the same batch fails.
- The 12-item schema/rules contract was not weakened.

### P08-R2 — Make project deletion Firestore-authoritative before Storage cleanup
- `deleteProject()` now deletes the Firestore document inside a transaction first.
- The transaction validates exact `updatedAt` equality with `Timestamp.isEqual()`.
- Storage media is deleted only after the authoritative Firestore transaction commits.
- This preserves the Firestore featured-project delete denial and prevents media destruction before a denied delete.

### P08-R3 — Resolve featured-project unpublish lifecycle
- `unpublishProject()` detects whether the project is currently featured and clears the featured reference before attempting the publication-state change.
- If the subsequent save fails, it performs a best-effort restore of the featured reference after rolling media back.
- Server-side Firestore rules remain authoritative; no rule bypass was introduced.

### P08-R4 — Static verification guard
- `scripts/test-phase08.mjs` now asserts the repaired gallery pre-check, staged-upload cleanup, transactional deletion, exact concurrency guard, and featured-unpublish lifecycle.
- `docs/phase-08-report.md` records the repair pass and its static-only evidence.

### P08-R5 — Make multi-object media moves failure-atomic — COMPLETED
- `moveMediaPaths()` now accepts a shared list of successfully moved objects so a later failure cannot lose track of earlier successful moves.
- `rollbackMovedMedia()` reverses every completed move in reverse order for both publish and unpublish flows.
- `publishProject()` and `unpublishProject()` now wrap the complete multi-object Storage move sequence in the rollback boundary, closing the previously identified partial-move window.
- Firestore authorization, featured-project rules, Storage limits and the existing media paths were not weakened or changed.
- `scripts/test-phase08.mjs` now asserts the move-tracking and rollback contract.

### Repair verification boundary
Fresh GitHub re-inspection confirmed the intended source/harness contracts. No local build, lint, TypeScript, Emulator Suite, Storage runtime, browser, or production execution was performed.

**Phase 08 remains NOT CLOSED.** Runtime verification and owner acceptance are still required by AGENTS.md.

# Phase 09 — PUBLIC PROJECTS & CASE STUDIES

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 09 contract
- `src/features/public/Projects.tsx`
- `src/features/public/ProjectDetail.tsx`
- `src/features/public/ProjectDetails.tsx`
- `src/features/public/ProjectCard.tsx`
- `src/features/public/ProjectMedia.tsx`
- `src/features/public/projectPresentation.ts`
- `src/features/cms/projects.ts`
- `src/data/schema/*`
- `firestore.rules`
- `src/components/seo/Seo.tsx`
- `scripts/test-phase09.mjs`
- `docs/phase-09-report.md`
- current package scripts

No local execution, build, lint, browser, responsive/accessibility, Firestore emulator, Storage runtime, or real published/unpublished Firebase verification was performed in this audit.

## Phase 09 direct findings

### P09-01 — Phase 09 verification harness is stale against the centralized SEO implementation

`ProjectDetail.tsx` correctly uses the later centralized `<Seo />` component and no longer performs direct `document.title` / `meta[name="description"]` manipulation.

However, `scripts/test-phase09.mjs` still asserts that `ProjectDetail.tsx` itself contains `document.title` and `meta[name="description"]`.

Therefore the current Phase 09 harness is expected to fail even though the current architecture intentionally moved SEO ownership into the Phase 14 shared SEO component.

**Disposition:** confirmed verification-contract drift, not a reason to revert the centralized SEO architecture. Repair the Phase 09 harness so it verifies the current canonical SEO contract (`ProjectDetail.tsx` supplies localized SEO data to `Seo`, and the shared component owns metadata). Do not weaken the check.

### P09-02 — Phase 09 report contains verification limitations but is not a final closure evidence package

`docs/phase-09-report.md` explicitly states that runtime/build/lint/schema/rules/browser verification was not executed and that Gate 6 is blocked pending local verification and owner acceptance.

This is honest, but it does not provide actual execution evidence required by AGENTS §8.

**Disposition:** evidence gap only. Keep the report's blocked status and complete the evidence package during the dedicated testing/closure pass; do not invent results.

### P09-03 — Runtime public-project contract remains unverified

Static code supports:
- published-only collection loading;
- deterministic first-project fallback;
- URL-backed selection via `?project=<slug>`;
- published-only deep-link lookup;
- non-disclosing missing/unpublished behavior;
- localized project presentation;
- Storage download URLs;
- hardened external links.

But static inspection cannot prove:
- real Firestore publication filtering;
- unpublished-project non-disclosure under rules;
- actual Storage delivery;
- gallery failure/loading behavior in the browser;
- responsive/keyboard/RTL behavior;
- deep-link refresh under Firebase Hosting;
- actual metadata behavior after navigation.

**Disposition:** runtime verification required; no production code change during this audit.

## Phase 09 cross-phase findings

### P09-CP01 — SEO ownership moved to Phase 14 and must remain attributed correctly

The current `ProjectDetail.tsx` delegates metadata to the shared `Seo` component introduced by later hardening. This is a valid current integration, but the Phase 09 harness/report must not require the historical implementation mechanism.

**Owning areas:** Phase 09 verification harness + Phase 14 SEO architecture.

### P09-CP02 — Project-view analytics can duplicate on locale changes

`ProjectDetail.tsx` tracks `project_view` with an effect dependency on both `project` and `locale`. Changing EN ↔ AR after the same project has loaded can therefore emit another project-view event.

This belongs to the Phase 13 analytics semantics rather than the Phase 09 project presentation contract.

**Owning area:** Phase 13. Preserve attribution; do not patch analytics during the Phase 09 audit.

### P09-CP03 — Dynamic project routes are not represented in the static sitemap

The current sitemap is static, while public project detail routes are dynamic `/projects/:slug` paths.

This is a discoverability/SEO hardening issue owned by the later Phase 14/15 release work, not a confirmed Phase 09 rendering/security defect.

**Owning areas:** Phase 14/15.

## Phase 09 conclusion

The deep audit found **one confirmed direct issue**: the Phase 09 static harness was stale because it still expected the pre-Phase-14 direct SEO implementation.

### Phase 09 repair pass — COMPLETED

**P09-R1 — Align Phase 09 verification with centralized SEO ownership — FIXED.**
- `scripts/test-phase09.mjs` now verifies `ProjectDetail.tsx` uses the shared `<Seo />` component and localized project SEO helpers.
- The harness separately verifies that `src/components/seo/Seo.tsx` owns document metadata updates and runtime-origin canonical URL construction.
- The Phase 14 centralized SEO architecture was preserved; the verification contract was updated rather than weakened.
- Repair commit: `021fff02a07d1f7aa44c904608283586f595fc60`.
- `docs/phase-09-report.md` records the repair.

No local/runtime command was executed or claimed. The remaining Phase 09 findings are evidence/runtime limitations and later-phase integration points.

**Phase 09 remains NOT CLOSED.**


# Phase 10 — REVIEWS, SOCIAL PROOF & CONTACT

## Deep-audit findings

### P10-01 — Review/contact optimistic-concurrency comparison is seconds-only

saveReview(), changeReviewStatus(), and saveContactLink() compare updatedAt.seconds only. Firestore Timestamp values also carry nanoseconds, so two writes within the same second can have different timestamps while the current checks treat them as equal.

Disposition: confirmed Phase 10 concurrency hardening defect. Repair the comparison to use exact Firestore Timestamp equality (for example Timestamp.isEqual()) without weakening the existing optimistic-concurrency requirement.

### P10-02 — Review/contact deletes have no optimistic-concurrency guard

deleteReview() and deleteContactLink() call deleteDoc() directly and do not compare the loaded updatedAt before deletion. A stale admin tab can therefore delete a record modified after it was loaded.

Disposition: hardening consideration. Consider applying the same destructive-operation protection during the repair pass. Do not silently redefine delete semantics during the audit.

### P10-03 — Phase 10 report is an honest blocked report, not a final evidence package

docs/phase-10-report.md explicitly says local lint/build/schema/rules/phase tests and browser/runtime verification were not executed, and Gate 6 is BLOCKED pending runtime verification and owner acceptance. It does not contain the complete command/result evidence structure required by AGENTS §8.

Disposition: evidence gap only. Complete the report during the dedicated testing/closure stage; do not invent execution results.

### P10-04 — Phase 10 static harness cannot prove runtime security

scripts/test-phase10.mjs checks route wiring, query predicates, moderation anchors, translations and rule anchors. It does not execute Firestore rules, verify real unauthorized writes, or exercise the full review/contact lifecycle.

Disposition: runtime verification requirement, not a production defect. Preserve the static checks and add runtime evidence in the testing stage.

## Phase 10 cross-phase findings

### P10-CP01 — Contact-target server validation is present

The current firestore.rules contactLinks contract does invoke isContactTarget(...) inside valid(). Therefore the previously recorded concern that the helper was defined but unused is no longer valid against the current repository state.

Disposition: mark the earlier contact-target validation concern as resolved/obsolete; no Phase 10 repair is required for that point.

### P10-CP02 — Public Contact analytics is later Phase 13 behavior

Contact.tsx calls trackEvent() for contact_click and social_click. This is a later analytics integration and should not be treated as original Phase 10 verification evidence. The analytics implementation remains owned by Phase 13.

### P10-CP03 — Review/contact public queries depend on Phase 05 composite indexes

The public queries use status == published + orderBy(order) for reviews and published == true + orderBy(order) for contact links. These are covered by the canonical Phase 05 index contract.

Disposition: no defect; preserve the dependency during Phase 05 repair.

## Phase 10 conclusion

The deep audit found one confirmed direct production hardening defect: seconds-only optimistic-concurrency comparison for reviews and contact links.

It also found one destructive-operation concurrency hardening consideration, evidence/runtime limitations, and confirmed that the contact-target server validation is already active.

Phase 10 is not CLOSED.


# Phase 10 — Repair Pass

**Repair status: COMPLETED for the confirmed Phase 10 production-code defect.**

### P10-R1 — Exact optimistic-concurrency comparison — COMPLETED
- Replaced the seconds-only optimistic-concurrency comparison with exact Firestore Timestamp.isEqual() checks in review save/status operations and contact-link save.
- Confirmed the current Phase 10 harness rejects any remaining updatedAt.seconds comparison and requires isEqual(expectedUpdatedAt).
- Preserved the existing review/contact workflow, server-side rules, and public-query contracts.

### P10-R2 — Delete concurrency — NOT CHANGED
- deleteReview() and deleteContactLink() still use direct deleteDoc() without compare-before-delete.
- This remains a hardening consideration from P10-02, not a confirmed contract violation, so it was intentionally not changed during this repair pass.

### Repair verification boundary
- Fresh GitHub re-inspection confirmed the exact Timestamp equality contract and the regression guards.
- No local build, lint, schema test, Firestore/Storage emulator run, browser test, or production Firebase execution was performed.

**Phase 10 remains NOT CLOSED. Runtime verification and owner acceptance are still required by AGENTS.md.**

**I did not advance to the next phase.**
# Phase 11 — HOME, CONVERSION FLOW & FEATURED PROJECT

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 11 contract
- `src/features/public/Home.tsx`
- `src/features/public/projectPresentation.ts`
- `src/features/cms/projects.ts`
- `src/features/cms/reviews.ts`
- `src/features/cms/contactLinks.ts`
- `src/data/index.ts`
- `src/data/publicSettings.ts`
- `src/features/public/Reviews.tsx`
- `src/features/public/Contact.tsx`
- `src/features/public/Projects.tsx`
- `src/App.tsx`
- `firestore.rules`
- `scripts/test-phase11.mjs`
- `docs/phase-11-report.md`
- current Phase 11 repair/integration tracker

No local execution, build, lint, browser, responsive/accessibility, Firebase Emulator, or real Firestore/Storage runtime verification was performed.

## Phase 11 direct findings

### P11-01 — WhatsApp shortcut normalization contains an incorrect regular expression

`Home.tsx` normalizes a non-HTTPS WhatsApp value with:

`link.value.replace(/\\D/g, '')`

The intended operation is to remove non-digit characters, but the current pattern matches a literal backslash followed by `D` rather than the JavaScript non-digit character class. As a result, a plain WhatsApp number containing spaces, `+`, hyphens or parentheses can be converted into an invalid `wa.me` target.

This is a concrete Phase 11 conversion/contact-shortcut defect. The existing ContactLink server validation remains authoritative; this is a client-side target-normalization defect in the Home shortcut.

**Disposition:** confirmed simple isolated Phase 11 defect. Fix during the Phase 11 repair pass by using the correct non-digit regex. Do not alter the ContactLink data contract.

### P11-02 — Home data loading is all-or-nothing rather than section-resilient

The Home page loads profile, services, projects, featured-project settings, reviews and contact links through one `Promise.all()`. If any single request rejects, the whole Home enters the top-level error state and none of the otherwise available sections render.

The Phase 11 contract explicitly calls for fallback behavior and verification against partial/empty data. Static inspection confirms empty-state handling once all requests resolve, but it does not establish graceful partial-data behavior when one backend read fails.

**Disposition:** confirmed resilience gap relative to the Phase 11 Gate 2/4 fallback objective, but not an authorization/security defect. Repair should be considered only after defining whether partial rendering is required for Home. Do not introduce independent retry/caching behavior without an explicit contract.

### P11-03 — Phase 11 report/harness is not final execution evidence

`docs/phase-11-report.md` correctly records Gate 4 as blocked pending local execution and Gate 6 as blocked pending evidence/owner acceptance. `scripts/test-phase11.mjs` is a static contract harness and does not execute the Home against real Firestore/Storage or browser rendering.

Therefore the current repository supports static contract inspection but not final runtime closure evidence.

**Disposition:** evidence gap only. Preserve the blocked status and complete runtime evidence during the dedicated testing/closure stage.

## Phase 11 cross-phase findings

### P11-CP01 — Home's featured-project selection correctly depends on the published project result set

`Home.tsx` resolves the configured featured ID only against `listProjects(true)` results. This preserves the public publication boundary and does not create a second featured-project source.

**Disposition:** no defect. Preserve this dependency during Phase 08/12 repair.

### P11-CP02 — Home inherits Phase 05/07/08/10 query/index/rules contracts

Home consumes the existing public profile, services, projects, reviews and contact-link data-access functions. No parallel Home-specific data model or public write path was introduced.

**Disposition:** no defect; integration dependency only.

### P11-CP03 — Contact shortcut normalization is duplicated between Home and the Contact feature

Home contains its own `contactHref()` normalization rather than reusing a shared canonical target-normalization helper. This is not itself a functional defect, but it increases the chance that Home and Contact diverge.

The concrete WhatsApp regex defect in P11-01 demonstrates that this duplication already has observable consequences.

**Owning area:** Phase 11 repair, with Phase 10 contact-link contract dependency. Avoid broad refactoring unless the repair can remain isolated and contract-preserving.

## Phase 11 conclusion

The deep audit found:
1. **one confirmed direct functional defect** in WhatsApp target normalization;
2. **one resilience/contract gap** around all-or-nothing Home loading;
3. **one evidence/runtime limitation**;
4. no confirmed featured-project publication bypass, public write path, or parallel data model.

**Phase 11 is not CLOSED.**


# Phase 14 — SECURITY, ACCESSIBILITY, PERFORMANCE, SEO & HARDENING

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 14 contract
- `src/App.tsx`
- `src/components/seo/Seo.tsx`
- `src/routes/PublicLayout.tsx`
- `src/routes/AdminLayout.tsx`
- `src/features/public/ProjectDetail.tsx`
- `src/features/public/ProjectMedia.tsx`
- `src/components/shell/PublicFooter.tsx`
- `src/components/shell/PublicHeader.tsx`
- `src/components/shell/LocaleSwitcher.tsx`
- `firestore.rules`
- `storage.rules`
- `scripts/test-phase14.mjs`
- `scripts/test-rules.mjs`
- `docs/phase-14-report.md`
- `public/robots.txt`
- `public/sitemap.xml`
- current package scripts/configuration

No local execution, production build, lint/typecheck, Firebase Emulator rules execution, browser accessibility/performance walkthrough, deployed App Check verification, or dependency vulnerability scan was performed in this audit.

## Phase 14 direct findings

### P14-01 — No unresolved direct Phase 14 production-code defect confirmed by static inspection

The previously identified Phase 14 implementation defects are already repaired in the current repository:
- stale hardcoded SEO origin was removed;
- Storage rules were rewritten into the intended deny-by-default/path/content-type/size contract;
- footer social icons were corrected to valid `<svg>` containers;
- the Phase 14 static harness covers the current SEO, lazy-loading, accessibility, Storage and analytics-boundary contracts.

No additional isolated production-code defect was found that is both confirmed and safe to patch during this audit without crossing into another phase's contract.

**Disposition:** no Phase 14 production-code change from this audit.

### P14-02 — Phase 14 execution evidence remains blocked

`docs/phase-14-report.md` explicitly records Gate 4 as BLOCKED because the required local/runtime commands and browser/Firebase verification were not executed. This remains consistent with AGENTS §8.

Unexecuted evidence includes:
- lint/build/typecheck;
- schema/rules/phase harness execution;
- browser/mobile accessibility behavior;
- Lighthouse or real performance measurements;
- deployed Firebase rules verification;
- production App Check enforcement verification;
- dependency vulnerability scanning.

**Disposition:** evidence gap/blocker for formal closure, not a reason to invent PASS results.

### P14-03 — Phase 14 static harness is not a substitute for runtime verification

`scripts/test-phase14.mjs` validates source-level contracts but does not execute Firebase rules, render the UI, measure route bundle behavior, verify focus restoration/keyboard interaction in a browser, or confirm metadata/canonical URLs after navigation.

**Disposition:** expected limitation. Preserve the harness and complete runtime verification in the dedicated testing stage.

## Phase 14 cross-phase findings

### P14-CP01 — Dynamic project URLs remain absent from the committed sitemap

The current sitemap enumerates static public routes but not CMS-generated `/projects/:slug` routes.

This is a real SEO/discoverability completeness gap for published project detail pages, but the fix depends on the final production/deployment strategy for generating or updating the sitemap.

**Owning areas:** Phase 14 + Phase 15, with Phase 09 project-route dependency.

### P14-CP02 — Project-media promotion still buffers full objects in memory

The Phase 08 media promotion path uses full-object `getBytes()`/upload semantics. The current per-object limits reduce the risk, but repeated gallery operations can increase browser memory pressure.

**Owning areas:** Phase 08 / Phase 14. Keep as a performance hardening item; do not refactor during the Phase 14 audit without runtime evidence.

### P14-CP03 — Phase 09 verification harness remains intentionally stale until repaired

Phase 14's centralized SEO implementation is correct as the current architecture, but `scripts/test-phase09.mjs` still expects the historical direct metadata implementation. This is a verification-contract drift owned jointly by Phase 09 and the Phase 14 SEO integration.

**Disposition:** repair the Phase 09 harness later; do not revert centralized SEO.

### P14-CP04 — Storage verification is integrated into the shared rules test rather than a separate Phase 14 runtime script

The Phase 14 harness statically checks Storage-rule anchors and the existing `scripts/test-rules.mjs` contains the denied Storage cases. There is no separate `scripts/test-storage-rules.mjs` in the current repository.

**Disposition:** not a defect. During testing, run the shared rules suite and retain the Phase 14 static harness; do not create a duplicate test runner merely for naming symmetry.

## Phase 14 conclusion

The deep audit found **no unresolved direct production-code defect** in Phase 14.

The remaining Phase 14 blockers are execution evidence and cross-phase hardening items, especially dynamic sitemap coverage and the already-known project-media memory characteristic.

**Phase 14 is not CLOSED.**


# Phase 15 — FINAL PRODUCTION VERIFICATION & RELEASE READINESS

## Audit status

**Deep static audit completed.**

Inspected:
- `AGENTS.md` Phase 15 contract and release/closure requirements
- `firebase.json`
- `package.json`
- `README.md`
- `scripts/test-phase15.mjs`
- `docs/phase-15-report.md`
- `functions/index.js`
- `functions/package.json`
- `src/App.tsx`
- `src/main.tsx`
- `src/firebase/appCheck.ts`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `public/robots.txt`
- `public/sitemap.xml`

No local execution, production build, lint/typecheck, Firebase Emulator, browser, deployed App Check, or real deployment verification was performed.

## Phase 15 direct findings

### P15-01 — Phase 15 harness requires Phase 01–06 reports that do not exist

`scripts/test-phase15.mjs` explicitly loops over phase 01 through phase 14 and requires every corresponding `docs/phase-XX-report.md` to exist.

The current repository contains the later phase reports but does not contain `docs/phase-01-report.md` through `docs/phase-06-report.md`.

Therefore the Phase 15 static harness is currently expected to fail its own report-completeness check.

This is the previously recorded CP-05, now confirmed directly during the Phase 15 audit.

**Disposition:** confirmed Phase 15 evidence-contract defect. Do not fabricate the missing historical reports and do not weaken the harness. Repair the release-evidence contract deliberately during the Phase 15 repair pass, preserving truthful evidence.

### P15-02 — Phase 15 Storage-rule assertion does not match the actual hardened rule structure

The Phase 15 harness asserts:

`storage.includes('allow write: if isAdmin()')`

The current `storage.rules` intentionally uses explicit `allow create`, `allow update`, and `allow delete` statements rather than a generic `allow write` statement.

The hardened Storage rules therefore satisfy the intended security model, but the Phase 15 harness is checking for a historical/string-specific implementation form that is not present.

This is a false-negative verification defect in the Phase 15 harness, not evidence that Storage security is broken.

**Disposition:** confirmed harness drift. Repair the assertion to validate the actual canonical Storage contract (admin-only create/update/delete plus the intended public-read boundaries and deny-by-default behavior), without weakening security checks.

### P15-03 — Phase 15 release command inventory omits the Phase 05 and Phase 06 verification contracts

The Phase 15 report describes the release inventory as covering the complete verification suite, and `scripts/test-phase15.mjs` checks for phase07 through phase14 scripts plus schema/rules, but the current `package.json` has no `test:phase05` or `test:phase06` command.

There may be legitimate historical reasons for those phases not having dedicated harnesses, but the current release contract does not explicitly reconcile that gap.

**Disposition:** confirmed evidence/verification-contract gap. Do not invent phase05/06 tests solely to satisfy a list. During Phase 15 repair, explicitly define which earlier phase contracts are verified by shared suites/manual evidence and ensure the release checklist reflects that truth.

### P15-04 — Phase 15 repository configuration is internally coherent for Hosting/Functions, but runtime release readiness remains unproven

The current configuration consistently wires:
- Hosting to `dist` with SPA fallback;
- Firestore rules/indexes;
- Storage rules;
- Functions source;
- Node 20 Functions runtime;
- App Check bootstrap and callable enforcement;
- robots/sitemap production metadata.

However, none of this static configuration proves the deployed Firebase project has the expected rules/indexes, App Check enforcement, callable behavior, deep-link hosting behavior, or production environment values.

**Disposition:** runtime evidence blocker, not a static defect. Preserve the current blocked status.

### P15-05 — Phase 15 report overstates Gate 1 evidence regarding report availability

`docs/phase-15-report.md` states that “Phase reports 01–15 are present after this implementation,” while the current repository does not contain the Phase 01–06 reports.

This is inconsistent with the repository's actual evidence state and with P15-01.

**Disposition:** confirmed evidence-documentation inconsistency. Correct the report during the Phase 15 repair pass; do not manufacture missing evidence.

## Phase 15 cross-phase findings

### P15-CP01 — Missing Phase 01–06 evidence affects final release evidence, not necessarily those implementations

The absence of historical Phase 01–06 reports does not by itself prove those phases' implementations are incorrect. It means their formal evidence package is incomplete.

**Owning area:** Phase 15 evidence strategy, with Phase 01–06 historical attribution preserved.

### P15-CP02 — Phase 09/12 harness drift must be resolved before a true full-suite claim

The current release inventory includes Phase 09 and Phase 12 tests, but earlier audits already confirmed:
- Phase 09 harness expects pre-Phase-14 direct SEO metadata;
- Phase 12 harness rejects the later legitimate analytics navigation added by Phase 13.

Therefore a future Phase 15 full-suite run cannot be interpreted as release evidence until these known verification-contract drifts are repaired or explicitly reconciled.

**Owning areas:** Phase 09/14 and Phase 12/13, coordinated by Phase 15 release verification.

### P15-CP03 — Phase 13 analytics read-rule defect remains a release blocker

The current analytics admin reads `analyticsDaily/{date}`, while Firestore rules still lack the corresponding admin read match.

This is not a Phase 15 implementation defect, but it prevents the claimed admin analytics journey from being proven release-ready.

**Owning area:** Phase 13.

### P15-CP04 — Dynamic project sitemap coverage remains open

The static sitemap does not enumerate CMS-generated project detail URLs.

This remains a release-hardening item owned by Phase 14/15 and depends on the final production sitemap strategy.

**Owning areas:** Phase 14/15.

## Phase 15 conclusion

The deep audit found **four confirmed direct release/evidence defects**:
1. missing Phase 01–06 reports required by the Phase 15 harness;
2. a false-negative Storage assertion in the Phase 15 harness;
3. an unreconciled verification inventory gap for Phase 05/06;
4. a Phase 15 report statement that incorrectly says reports 01–15 are present.

It also confirmed that runtime/deployed release readiness remains unproven and that previously identified Phase 09/12/13/14 integration issues must be resolved before a true final release verification can pass.

**Phase 15 is not CLOSED.**


# FINAL CROSS-PHASE DEEP AUDIT — GROUPED REPAIR BASIS

## Audit status

**Final repository-wide deep audit completed.**

This pass was performed after the phase-by-phase audits of Phases 01–15. The audit was deliberately integration-focused rather than another isolated phase review.

Inspected and cross-checked:
- `AGENTS.md` master contract, six-gate model, phase isolation rules, closure definition, evidence requirements, and owner-controlled status ledger;
- this tracker and all findings already recorded in it;
- current repository tree and production configuration;
- canonical schemas/types/paths, Firestore rules, Storage rules and indexes;
- authentication/authorization boundaries;
- CMS data writers and public readers;
- project media publication/staging lifecycle;
- reviews/contact/settings/featured-project workflows;
- analytics callable function and admin reader;
- routing, SEO, i18n, public/admin shell and phase verification harnesses;
- Phase 07–15 reports and their static verification scripts;
- known later-phase changes that can invalidate historical phase harness assumptions.

No local build, lint, typecheck, emulator, browser, deployed Firebase, or production-runtime execution was performed in this final static audit. Therefore runtime-only claims remain evidence blockers and are not converted into code defects merely because they are unverified.

## Important audit conclusion

The previously recorded findings were re-checked against the current repository. The confirmed defects below are **not all equal in severity**:

- some are **verification/evidence drift** and do not damage the application at runtime;
- some are **data-contract/security-boundary defects** that can cause legitimate writes to fail or allow data outside the intended semantic contract;
- some are **lifecycle/consistency defects** that can leave Firestore and Storage temporarily or permanently out of sync;
- some are **cross-cutting product/SEO/analytics correctness defects**.

The repair plan must therefore follow dependency order and must not treat the tracker as a list of independent edits.

---

# GROUP 1 — CANONICAL DATA CONTRACT, FIRESTORE RULES & CMS VALIDATION

### G1-01 — Schema/rules aggregate-length mismatch is confirmed

The application schema validates list cardinality and individual element lengths, while Firestore rules validate some lists through joined aggregate strings. Exact maximum-length payloads can therefore pass the application schema but fail the rules.

Confirmed affected contract areas include project technologies and gallery/media-path lists.

**Impact:** a valid CMS payload according to the canonical application schema can be rejected by the authoritative Firestore security layer.

**Proposed safe repair:** define one canonical aggregate-budget contract and make both schema and rules enforce the same effective boundary. Preserve existing maximum item counts and security restrictions; do not weaken the rules. Add boundary cases to the shared schema/rules verification so the maximum accepted payload is identical in both layers.

**Owning area:** Phase 05.

### G1-02 — Contact-link per-type target validation is not enforced by the Firestore write rule

The client schema restricts contact values to safe broad forms (HTTPS, mailto/email, tel/phone), and the CMS calls `validateContactTarget()`. However, the active Firestore `contactLinks` rule validates the `type` and `value` shape but does not invoke the per-type relationship check.

Therefore an authorized writer can bypass the client and create semantically mismatched combinations such as a contact type whose value belongs to another allowed target class.

This is not a public `javascript:` injection path because the broad schema already excludes unsafe schemes, but it is a real server-side contract gap.

**Proposed safe repair:** move the same type/value relationship invariant into the Firestore rule path, while preserving the existing allowed target forms for email, phone, WhatsApp and HTTPS social/custom links.

**Owning area:** Phase 10.

### G1-03 — Review/contact optimistic-concurrency checks are lower precision than the rest of the CMS

`reviews.ts` and `contactLinks.ts` compare `updatedAt.seconds` only, while other CMS writers use Firestore Timestamp equality.

Two writes occurring within the same second can therefore evade the intended client-side optimistic-concurrency conflict detection.

**Proposed safe repair:** use exact Firestore Timestamp equality (`isEqual()`) consistently with Profile/Services/Skills/Projects/Settings. Keep Firestore transactions and server timestamps unchanged.

**Owning area:** Phase 10.

### G1-04 — Phase 07 media fields have a weaker operational contract than the Phase 08 project media pipeline

Profile, Services and Skills expose Storage-path fields and Storage rules, but the Phase 07 CMS does not provide a corresponding end-to-end upload/replace/cleanup workflow comparable to Projects.

This means an admin can edit the reference field but does not have an equivalent canonical media-management path inside those CMS editors.

**Proposed safe repair:** add a shared, narrowly scoped media workflow for Phase 07 entities using the already-defined Storage paths, limits and admin-only write boundary. Reuse the existing schema/path contracts; do not create a second media architecture.

**Owning area:** Phase 07.

---

# GROUP 2 — PROJECT MEDIA, PUBLICATION & FEATURED-PROJECT LIFECYCLE

### G2-01 — Featured-project lifecycle mismatch is confirmed

Firestore rules prevent a project from being unpublished while it remains the selected `settings/main.featuredProjectId`. The Projects admin UI nevertheless exposes a direct unpublish path.

The result can be a legitimate admin action that reaches a rule denial instead of guiding the administrator through the required lifecycle.

**Proposed safe repair:** make the UI lifecycle-aware: when the current project is featured, require clearing/reassigning the featured reference before unpublishing, or disable the unpublish action with an explicit explanation. Do not weaken the rule.

**Owning areas:** Phase 08 + Phase 12.

### G2-02 — Staged project-media cardinality validation can leave orphaned draft objects

Project uploads are staged in Storage before the complete project payload is validated. A selection that later fails the gallery cardinality/schema contract can therefore leave already-uploaded staging objects behind.

**Proposed safe repair:** validate the complete intended selection before uploading where possible, and add best-effort cleanup for staged objects whenever a batch-level validation/write step fails. Preserve the existing draft/public separation and Storage security rules.

**Owning area:** Phase 08.

### G2-03 — Project media promotion is not failure-atomic across multiple Storage moves

`publishProject()` and `unpublishProject()` call `moveMediaPaths()` before entering their rollback-protected Firestore write block. If a later Storage move fails after earlier moves succeeded, the function can exit before the rollback section and leave a partially moved media set.

This is a genuine lifecycle-consistency defect, distinct from the already-recorded memory characteristic.

**Proposed safe repair:** make the move operation itself transactional at the application-orchestration level: record each successful move and roll back all completed moves if a later move fails, before propagating the original error. Keep Firestore writes and security rules unchanged.

**Owning area:** Phase 08.

### G2-04 — Project media promotion buffers entire objects in memory

The promotion helper uses `getBytes()` followed by `uploadBytes()`, so each promoted object is fully buffered in application memory. Current individual file limits reduce the risk, but a multi-image publish can multiply memory pressure.

**Proposed safe repair:** replace the full-buffer copy with a bounded/streaming-capable transfer strategy supported by the chosen Firebase Storage architecture, or otherwise process media sequentially with explicit memory-safe limits. Do not raise Storage limits merely to accommodate the current implementation.

**Owning areas:** Phase 08 / Phase 14.

---

# GROUP 3 — ANALYTICS CORRECTNESS, SECURITY & RETENTION

### G3-01 — Analytics admin read contract is currently broken

`AnalyticsAdmin` directly reads `analyticsDaily/{date}`, but the active Firestore rules have no corresponding admin-read match. The catch-all deny therefore blocks the dashboard.

The Phase 13 harness/data-model expect an analyticsDaily rule that is not actually present.

**Proposed safe repair:** add an explicit `analyticsDaily/{date}` rule allowing reads only to the trusted `admin: true` claim, while keeping client writes denied. Preserve the existing callable/App Check ingestion path and deny-by-default behavior.

**Owning area:** Phase 13.

### G3-02 — Project-view analytics can double-count on locale changes

`ProjectDetail` records `project_view` with an effect dependent on both the loaded project and locale. Switching EN↔AR therefore re-runs the effect for the same project visit.

**Proposed safe repair:** make the event effect depend on project identity/slug only, or introduce an explicit visit/event deduplication contract. The minimal safe change is to remove locale from the dependency because the event does not semantically depend on language.

**Owning area:** Phase 13.

### G3-03 — Analytics retention cleanup is bounded per scheduled invocation

The scheduled cleanup deletes at most 100 expired documents per collection per run. If expired analytics documents accumulate beyond that batch size, retention can lag behind the stated 90-day target.

**Proposed safe repair:** continue bounded batches until no expired documents remain within a single invocation, or use a retention mechanism whose operational guarantees match the documented policy. Keep each operation bounded enough for the existing function timeout/memory limits.

**Owning area:** Phase 13.

### G3-04 — Persistent first-party visitor identifier is a documented privacy-contract decision, not an accidental implementation detail

The browser stores a persistent analytics visitor identifier in localStorage and the server hashes it before storage. This is technically coherent with the current analytics design, but it is still a persistent pseudonymous visitor marker.

**Proposed safe repair:** do not silently remove it. During the Phase 13 repair pass, explicitly document the retention/purpose boundary and ensure the privacy description matches the actual behavior. If the product contract requires less persistence, change the identifier lifetime deliberately rather than treating this as a random refactor.

**Owning area:** Phase 13 / product contract.

---

# GROUP 4 — VERIFICATION, PHASE EVIDENCE & HISTORICAL-CONTRACT DRIFT

### G4-01 — Phase 01–06 formal reports are missing while Phase 15 expects them

The current repository does not contain `docs/phase-01-report.md` through `docs/phase-06-report.md`, while the Phase 15 harness expects reports for all earlier phases.

This is a real evidence-contract defect, not proof that the implementations themselves are wrong.

**Proposed safe repair:** preserve truthful historical status and explicitly define how Phases 01–06 are represented in the final release evidence. Do not fabricate reports and do not weaken the release check merely to make it pass.

**Owning area:** Phase 15 evidence strategy.

### G4-02 — Phase 15 Storage assertion is stale relative to the hardened Storage rules

The Phase 15 harness searches for the historical string form `allow write: if isAdmin()`, while the current hardened Storage rules deliberately use explicit `allow create`, `allow update`, and `allow delete` rules.

The security implementation is stronger/more explicit; the harness is producing a false negative.

**Proposed safe repair:** rewrite the harness assertion around the actual security contract rather than a historical string. Require admin-only create/update/delete, intended public reads, and deny-by-default coverage.

**Owning area:** Phase 15.

### G4-03 — Phase 15 verification inventory does not reconcile Phase 05/06 evidence

The current package has shared schema/rules commands and dedicated phase scripts from Phase 07 onward, but no `test:phase05` or `test:phase06` command. The final release contract does not clearly explain how those phases are verified.

**Proposed safe repair:** document the actual verification source for Phases 05/06 (shared suites/manual evidence where applicable) and make the Phase 15 release checklist reflect that truth. Do not invent tests solely to satisfy a filename expectation.

**Owning area:** Phase 15.

### G4-04 — Phase 09 harness is stale relative to the centralized Phase 14 SEO architecture

The Phase 09 static test expects direct `document.title`/meta manipulation in ProjectDetail, while Phase 14 intentionally moved SEO into the shared `Seo` component.

**Proposed safe repair:** update the Phase 09 verification contract to assert centralized SEO usage and project-specific SEO inputs rather than the obsolete implementation detail. Do not revert the Phase 14 SEO architecture.

**Owning areas:** Phase 09 + Phase 14.

### G4-05 — Phase 12 harness rejects a legitimate Phase 13 analytics integration

The Phase 12 test contains a negative assertion against analytics in the admin layout, but Phase 13 intentionally added the analytics route/navigation.

**Proposed safe repair:** make the Phase 12 harness assert the Phase 12 baseline without prohibiting legitimate later-phase additions, or define a historical snapshot contract that is explicitly separate from the current integration test.

**Owning areas:** Phase 12 + Phase 13.

### G4-06 — Phase 15 report contains an evidence statement contradicted by the current tree

The Phase 15 report states that Phase 01–15 reports are present, while Phase 01–06 reports are absent.

**Proposed safe repair:** correct the report to describe the actual evidence state. Do not manufacture missing historical reports.

**Owning area:** Phase 15.

### G4-07 — Several early phases have implementation evidence but no dedicated current report/harness

Phases 01–06 do not have the same dedicated report/test-script artifacts as later phases. This is an evidence gap, not automatically an implementation defect.

**Proposed safe repair:** resolve through the final evidence strategy rather than retroactively fabricating phase closure. Preserve the owner-controlled status ledger.

**Owning area:** Phase 15, with historical phase attribution preserved.

---

# GROUP 5 — AUTHENTICATION STATE, ROUTING/SEO & CROSS-CUTTING HARDENING

### G5-01 — Auth manual claim refresh has asymmetric failure handling

The manual `AuthProvider.refetch()` path can reject when forced token-claim retrieval fails, unlike the deny-by-default handling used by the initial auth-state path.

This is a client-state robustness defect, not a demonstrated server authorization bypass.

**Proposed safe repair:** make manual refresh converge on the same safe failure state used by the initial auth flow, while preserving the server-side `admin: true` authorization contract.

**Owning area:** Phase 04.

### G5-02 — Auth state has a stale-result race around asynchronous claim loading

The auth-state callback performs asynchronous claim loading. A later auth-state transition can occur before the earlier claim request resolves, allowing a late result to update client state for an older user/session.

Server-side rules remain authoritative, so this is not currently classified as a privilege escalation, but it is a real client-state consistency risk.

**Proposed safe repair:** use a monotonically increasing auth-operation/session token or equivalent cancellation guard so only the latest auth state may commit its loaded claims.

**Owning area:** Phase 04.

### G5-03 — Dynamic project URLs are missing from the static sitemap

The current sitemap covers fixed routes but cannot enumerate CMS-generated project slugs.

**Proposed safe repair:** introduce a production-safe sitemap generation strategy that reads only published projects and produces the same canonical origin/slug contract used by project SEO. Do not expose unpublished/admin routes.

**Owning areas:** Phase 09 / Phase 14 / Phase 15.

### G5-04 — Phase 02 design-system preview contains an isolated verification-surface organization defect

The temporary Design System Preview nests the surfaces/depth section inside the colour-token section.

**Proposed safe repair:** move that section to its own top-level preview section. No production styling or component contract needs to change.

**Owning area:** Phase 02.

---

# FINDINGS DELIBERATELY NOT CLASSIFIED AS CONFIRMED CODE DEFECTS

The final sweep also checked several areas where static evidence is insufficient. These remain verification items rather than invented bugs:

1. Firebase/Hosting deep-link behavior in the deployed environment.
2. Real Google sign-in, claim refresh and revocation behavior.
3. Firestore/Storage emulator execution of the full rules suite.
4. Production App Check enforcement in Firebase Console.
5. Actual browser accessibility, Arabic shaping, responsive layout and reduced-motion rendering.
6. Production environment-variable correctness.
7. Real production deployment and Functions callable behavior.
8. Exact WCAG contrast measurements in rendered output.

These require the dedicated local/runtime testing stage defined by `AGENTS.md`.

---

# RECOMMENDED REPAIR DEPENDENCY GRAPH

The previous phase order remains valid, but the final grouped audit makes the dependencies explicit:

1. **Group 1 — Data contract/rules:** Phase 05 first, then Phase 10 contract repair.
2. **Group 2 — Project media lifecycle:** Phase 08 before any release verification.
3. **Group 3 — Analytics:** Phase 13 after its Firestore contract is corrected.
4. **Group 4 — Verification drift/evidence:** reconcile Phase 09/12/15 harnesses after the underlying contracts are stable.
5. **Group 5 — Auth/SEO/hardening:** Phase 04, then Phase 02/09/14/15 cross-cutting items.
6. **Final runtime stage:** only after repository repairs are complete, execute the local/emulator/browser/deployment evidence required by `AGENTS.md`.

**Important:** this final section is a repair basis, not a declaration that any phase is CLOSED. No phase ledger status was changed during this audit.


# Phase 10 — Repair Plan

**Repair order (dependency-aware, one stage at a time):**
1. **P10-R1 — Enforce contact-target validation in Firestore rules — COMPLETED.** The existing `isContactTarget(type, value)` helper is now wired into the canonical `contactLinks/{linkId}` `valid()` write contract. The Phase 10 static harness now verifies actual invocation, not merely helper existence. Post-change scope inspection passed with exactly one invocation in the contact-link validation block. Wire the existing `isContactTarget(type, value)` helper into the canonical `contactLinks/{linkId}` write validation path. Strengthen the Phase 10 static harness so it verifies invocation, not merely helper existence. Re-inspect the exact rule block and harness after the change.
2. **P10-R2 — Harden optimistic-concurrency timestamp equality — COMPLETED.** Replaced seconds-only comparisons in Reviews and ContactLinks with exact Firestore `Timestamp.isEqual()` checks, preserving the existing concurrency semantics. Re-inspected all affected call sites, the shared `ServerTimestamp` type, and the Phase 10 static harness; no remaining `updatedAt.seconds` concurrency comparison remains in the affected scope. The harness now asserts exact timestamp equality for both modules. No local/runtime tests are claimed here.
3. **P10-R3 — Re-run the Phase 10 static contract audit — COMPLETED.** Re-inspected the Phase 10 routes, public/admin query predicates, review moderation transitions, publishedAt semantics, server-side contact-target validation, exact Firestore Timestamp concurrency checks, EN/AR translation parity, static harness registration, report isolation, and current Phase 10 file scope. No remaining Phase 10-local defect was confirmed in these areas. A separate pre-existing Phase 07 Firestore-rules anomaly was observed during the cross-file inspection (`services/{serviceId}` references `type`/`value` fields that are not part of the service contract); it is explicitly kept out of Phase 10 and remains a Phase 07 repair concern. No local/runtime tests were executed.
4. **P10-R4 — Cross-phase integration check — COMPLETED.** Reconciled the repaired Phase 10 contracts against the canonical Phase 05 data types/schemas and the authoritative Firestore rules, then checked the Phase 12 Reviews/Contact admin workflows. Phase 05 defines the same persisted Review/ContactLink shapes consumed by Phase 10; the Firestore rules enforce the Phase 10 review publication/status invariants, exact server timestamps, and per-type contact-target validation; the Phase 12 admin workflows pass the expected `updatedAt` values into the repaired concurrency paths and expose only the documented review moderation transitions. No cross-phase contract mismatch was confirmed in this scope. No local/runtime tests were executed.

**Rule:** each repair stage must be implemented, re-inspected within its own scope, and only then marked `COMPLETED`. No local/runtime tests are claimed here.


# Phase 11 — Deep Audit Findings

## Scope and evidence
Repository-level static audit of Phase 11 against AGENTS.md, the current Home implementation, its verification harness, and the Phase 07–10 public CMS contracts. No local build, lint, typecheck, emulator, browser, or production-runtime execution was performed. Therefore runtime-only claims remain unverified.

## Findings

### P11-01 — WhatsApp number normalization regex was over-escaped — FIXED
**Severity:** low / isolated functional defect.

Home contact-link normalization used `replace(/\\D/g, '')`, which does not remove non-digit characters from a phone number. For a validated WhatsApp value such as `+213 555 12 34 56`, the generated `wa.me` target could retain spaces/formatting instead of producing a canonical digit-only path.

**Repair:** corrected the regex to `replace(/\D/g, '')` in `src/features/public/Home.tsx`.

**Boundary:** this repair changes only the local WhatsApp target normalization. It does not alter Firestore validation, contact-link publication rules, or the Phase 10 contact contract.

### P11-02 — Phase 11 static harness does not verify WhatsApp target normalization
The current `scripts/test-phase11.mjs` checks that external contact links are hardened, but it does not assert the exact WhatsApp normalization behavior.

**Classification:** verification gap, not a second production defect.

**Recommended repair:** add a narrow static assertion for the canonical digit-stripping expression or, preferably, a focused testable helper contract if the project later introduces executable unit coverage. Do not broaden the Phase 11 harness into a general contact-link test suite.

### P11-03 — Home correctness depends on Phase 07–10 query contracts
The Home implementation correctly calls:
- `listServices(true)`
- `listProjects(true)`
- `listReviews(false)`
- `listContactLinks(false)`

The latter two are correct under the current API contract because those functions use an `admin` boolean, where `false` means the public published-only query.

**Classification:** PASS by current source inspection; no change required.

### P11-04 — Featured-project behavior is correctly publication-constrained
Home resolves the configured `featuredProjectId` only against `data.projects`, which comes from `listProjects(true)`. Therefore an unpublished project cannot be rendered as the featured public project through this path.

**Classification:** PASS by static inspection. Runtime verification remains pending.

### P11-05 — Show More is presentation-only
`showMore` is local React state and only changes the visible slice of already-loaded published projects. No persistence or new data contract is introduced.

**Classification:** PASS by static inspection.

### P11-06 — Partial failure handling is all-or-nothing at the Home aggregate level
The six Home data sources are loaded through one `Promise.all`. If any one request rejects, the entire Home enters the top-level error state instead of rendering independently available sections.

**Classification:** design/UX observation, not a confirmed Phase 11 defect. The Phase 11 contract explicitly requires top-level loading/error behavior, and the current implementation satisfies that. Changing it would be a broader resilience/product decision and is out of scope for this audit.

### P11-07 — Runtime evidence remains blocked
The repository cannot prove through static inspection:
- actual Firestore query/index execution;
- browser rendering/responsive behavior;
- EN/AR visual correctness;
- keyboard/accessibility behavior;
- real CTA navigation;
- actual WhatsApp navigation;
- production performance.

**Classification:** verification blocker under AGENTS.md, not an implementation defect.

## Cross-phase integration
- Phase 08 featured invariant remains authoritative; Home does not bypass it.
- Phase 10 published review/contact query contracts are consumed as designed.
- Phase 12 dashboard/settings and Phase 13 analytics remain out of Phase 11 scope.
- Phase 14 centralized SEO remains outside Home's Phase 11 implementation contract.

## Gate assessment
- Gate 1 — PASS (static contract inspection)
- Gate 2 — PASS (static architecture inspection)
- Gate 3 — PASS (implementation exists and one isolated defect was repaired)
- Gate 4 — BLOCKED (local/runtime evidence not executed)
- Gate 5 — PARTIAL (static hardening reviewed; runtime hardening unverified)
- Gate 6 — BLOCKED (runtime evidence and owner acceptance pending)

**Phase 11 remains NOT CLOSED.**

**I did not advance the phase status or mark Phase 11 CLOSED.**


# Phase 11 — Repair Pass

**Repair status: COMPLETED for the confirmed Phase 11 implementation/verification finding.**

### P11-R1 — Add a narrow static guard for WhatsApp target normalization — COMPLETED
- The production Home implementation already contains the corrected digit-stripping expression `replace(/\\D/g, '')`.
- `scripts/test-phase11.mjs` now explicitly asserts that canonical expression, closing the verification gap identified as P11-02.
- The guard remains narrowly scoped to Phase 11 and does not duplicate Phase 10 server-side contact validation.
- `docs/phase-11-report.md` records the repair and its static-only evidence.

### Repair verification boundary
Fresh repository re-inspection confirmed the Home implementation, Phase 11 harness assertion, and report entry are aligned. No local build, lint, TypeScript, emulator, browser, or production execution was performed.

**Phase 11 remains NOT CLOSED.** Runtime verification and owner acceptance are still required by AGENTS.md.

**I did not advance the phase status or mark Phase 11 CLOSED.**


# Step 1 — Phase 05 Repair & Integration Execution Record — 2026-09-26

**Status: COMPLETED**

Step 1 was revalidated against `docs/repair-roadmap-9-steps.md` after the existing Phase 05 repair pass.

## Confirmed repairs re-inspected

- Schema/rules maximum-size budgets remain aligned:
  - technologies: 30 × 60 characters + 29 join separators = **1,829**
  - gallery paths: 12 × 512 characters + 11 join separators = **6,155**
- Timestamp runtime validation remains hardened to reject invalid nanoseconds and out-of-range seconds.
- `firestore.indexes.json` exists at the path referenced by `firebase.json` and contains the documented ordered CMS indexes plus analytics map field overrides.
- Storage limits remain represented in `storage.rules` and covered by `scripts/test-schema.ts`.
- Phase 07/08/10 consumers continue importing the canonical data/schema/path layer rather than introducing a second CMS schema.
- Phase 13 analytics remains intentionally server-owned; its missing `analyticsDaily` client-read rule remains owned by Step 7, not Step 1.

## Additional confirmed Step 1 contract defect repaired

### P05-06 — Technology labels containing commas were rejected by Firestore rules

The project schema permits technology labels containing commas, but `isStringList()` used comma both as the aggregation separator and as a character-level regex restriction. That made valid schema values such as `C, C++` fail the Firestore write contract.

**Repair:** retained the existing maximum item count, aggregate character budget and empty-string rejection, while removing the delimiter-dependent regex restriction.

**Targeted verification added:**
- `scripts/test-schema.ts` now explicitly accepts a comma-containing technology label.
- `scripts/test-rules.mjs` now contains an admin allow-case for a project using `C, C++`.

No authorization boundary was weakened: all project writes remain admin-only, the list count/aggregate budget remain enforced, and the application schema remains the full element-shape validator.

## Files changed during Step 1 execution

- `firestore.rules`
- `scripts/test-schema.ts`
- `scripts/test-rules.mjs`
- this tracker

## Verification limits

No local Node test, Firestore Emulator, Storage Emulator, Firebase deployment, index deployment, browser or production runtime test was executed. These remain part of the later runtime testing stage.

**Phase 05 remains NOT CLOSED.**

**I did not advance to the next step.**


# Step 2 — Phase 07 Repair & Integration Execution

## Status

**PARTIALLY COMPLETED**

Step 2 was executed against the Phase 07 findings in the repair roadmap. No local/browser/Firebase/emulator tests were run.

## Findings handled

### P07-R1 — Services Firestore rule/schema mismatch — already resolved

The Step 2 re-inspection confirms the previously applied repair remains correct:
- `services/{serviceId}` uses the canonical Phase 07 service field contract;
- the unrelated `isContactTarget(...)` condition is absent from the service rule block;
- `scripts/test-phase07.mjs` contains a regression assertion for this exact condition.

No additional code change was required.

### P07-R2 — Services-rule regression guard — already resolved

The Phase 07 harness still verifies both the service field allowlist and the absence of contact-link validation in the service rule.

No additional change was required.

### P07-R3 — Static re-inspection — completed

The Phase 07 schema/rules boundary was re-inspected after the earlier repair. No recurrence of the service-rule mismatch was found.

## Media contract disposition

### P07-R4 — Profile/Services/Skills media management remains an explicit contract gap, not a safe autonomous implementation change

The current admin forms expose:
- Profile: `avatarPath`, `resumePath`
- Services: `iconPath`
- Skills: `iconPath`

These are Storage-path reference fields. The inspected Phase 07 implementation does not provide a first-class upload/select/delete workflow comparable to Phase 08 project media.

This confirms the previously recorded P07-03 observation. However, the Phase 07 gate contract requires CMS CRUD/public rendering and does not explicitly require a dedicated media-upload workflow. Adding one would introduce a new media lifecycle and UI contract without owner authorization.

**Disposition:** BLOCKED FOR CONTRACT CLARIFICATION / NO CODE CHANGE.

Required owner decision before implementation:
1. **Reference-only contract:** keep manual Storage-path references and document them as the supported Phase 07 media operation; or
2. **First-class media contract:** define upload/select/delete behavior, ownership, replacement cleanup, allowed paths/types/sizes, and UX before implementation.

### P07-CP01 — Storage path specificity remains dependent on the media decision

The generic Phase 05 `mediaPath()` validation confirms that a value is a safe Storage path, while Storage rules independently constrain actual object access. The current schema does not prove that:
- `avatarPath` is under `profile/avatar/`;
- `resumePath` is under `profile/resume/`;
- service `iconPath` is under the service icon namespace;
- skill `iconPath` is under the skill icon namespace.

This is a data-integrity contract question, not a demonstrated authorization bypass.

**Disposition:** remain open pending the P07-R4 media contract decision. Do not broaden the generic schema or weaken Storage rules as a workaround.

## Files inspected for Step 2

- `AGENTS.md`
- `docs/repair-roadmap-9-steps.md`
- `docs/phase-repair-tracker.md`
- `docs/data-model.md`
- `src/features/cms/ProfileAdmin.tsx`
- `src/features/cms/ServicesAdmin.tsx`
- `src/features/cms/SkillsAdmin.tsx`
- `src/features/cms/profile.ts`
- `src/features/cms/services.ts`
- `src/features/cms/skills.ts`
- `src/features/cms/data.ts`
- `src/data/schema.ts`
- `src/data/types.ts`
- `src/data/paths.ts`
- `firestore.rules`
- `storage.rules`
- `scripts/test-schema.ts`
- `scripts/test-rules.mjs`
- `scripts/test-phase07.mjs`
- `docs/phase-07-report.md`
- `src/features/public/About.tsx`
- `src/features/public/Services.tsx`

## Exact static verification performed

- Confirmed the Phase 07 services rule no longer invokes `isContactTarget()`.
- Confirmed the Phase 07 harness checks the canonical service field contract and explicitly rejects `isContactTarget()` inside the service rule.
- Confirmed Profile/Services/Skills admin surfaces expose Storage-path references rather than an upload/select/delete workflow.
- Confirmed the current Phase 07 report already records the services-rule repair and its static re-inspection.
- Confirmed the media-path validation remains generic at the canonical schema layer and Storage rules remain the authorization boundary.

No executable repository tests were run.

## Files changed

- `docs/phase-repair-tracker.md` — this Step 2 execution record only.

No production code, dependency, Firestore rule, Storage rule, test, or phase ledger was changed.

## Cross-phase impact

- Phase 05 generic media-path contract remains unchanged.
- Phase 08 project media lifecycle remains unchanged.
- Phase 10 contact-link validation remains unchanged.
- No security boundary was weakened.
- No Phase 07/08 media architecture was invented prematurely.

## Remaining issues

1. Owner must decide whether Phase 07 profile/service/skill media is reference-only or requires first-class CMS media management.
2. If first-class management is required, a separate explicit media contract must define path ownership, upload/delete/replacement behavior, validation and cleanup.
3. Runtime verification of Phase 07 remains pending.
4. Phase 07 report/evidence completeness remains pending.
5. Delete-concurrency hardening remains a non-blocking consideration.

## Owner-controlled phase status

Phase 07 remains **NOT CLOSED** under AGENTS.md. This Step 2 execution does not alter the phase ledger.

**I did not advance to the next step.**


# Step 4 — Phase 09 Repair & Integration Execution Record — 2026-09-26

**Status: COMPLETED**

Step 4 was executed against `docs/repair-roadmap-9-steps.md`. The previously identified Phase 09 repair was re-confirmed against the current repository, and the downstream project/SEO contracts were re-inspected. No new Phase 09 production defect was confirmed.

## Findings handled

### P09-R1 — Stale Phase 09 SEO harness — already repaired and re-confirmed

The current Phase 09 verification harness now verifies the shared `<Seo />` component and its localized project SEO inputs, while separately verifying that `src/components/seo/Seo.tsx` owns document metadata and runtime-origin canonical URL construction.

The repair is preserved in commit `021fff02a07d1f7aa44c904608283586f595fc60` (`test: align phase09 SEO harness with shared component`).

**Disposition:** no additional production or harness change required.

## Step 4 contract re-inspection

- Public project listing still calls `listProjects(true)`, preserving published-only behavior.
- Project detail still calls `getPublishedProject(slug)`.
- Missing/unpublished projects remain non-disclosing at the public UI boundary.
- Project document ID and public URL segment remain the same slug contract.
- `projectPath(slug)` documents that the project document ID is the public URL segment.
- Project SEO uses the same slug for its canonical path.
- External project links retain `noopener noreferrer`.
- Project media remains resolved through Firebase Storage download URLs.
- EN/AR project presentation helpers remain intact.
- `public/sitemap.xml` contains only fixed public routes; dynamic `/projects/:slug` URLs remain absent.

## Dynamic sitemap disposition

The dynamic project URL dependency remains open as a later cross-phase hardening/release item. It was not implemented in Step 4 because the roadmap assigns the production-safe published-project sitemap strategy to Phase 14/15 ownership.

No unpublished/admin route was added to the sitemap, and no static sitemap workaround was introduced.

## Files inspected

- `AGENTS.md`
- `docs/repair-roadmap-9-steps.md`
- `docs/phase-repair-tracker.md`
- `src/features/public/Projects.tsx`
- `src/features/public/ProjectDetail.tsx`
- `src/features/public/projectPresentation.ts`
- `src/features/public/ProjectDetails.tsx`
- `src/features/public/ProjectCard.tsx`
- `src/features/public/ProjectMedia.tsx`
- `src/features/cms/projects.ts`
- `src/data/types.ts`
- `src/data/paths.ts`
- `firestore.rules`
- `scripts/test-phase09.mjs`
- `docs/phase-09-report.md`
- `docs/data-model.md`
- `src/components/seo/Seo.tsx`
- `src/App.tsx`
- `public/robots.txt`
- `public/sitemap.xml`
- `firebase.json`

## Files changed during Step 4

- `docs/phase-repair-tracker.md` — this Step 4 execution record only.

No production code, dependency, Firestore rule, Storage rule, sitemap, phase ledger, or existing Phase 09 harness was changed during this execution because the confirmed repair was already present and correct.

## Exact static verification

- Confirmed the stale direct-SEO assertions are absent from the current Phase 09 harness.
- Confirmed the harness checks the shared SEO component and runtime-origin canonical URL construction.
- Confirmed project slug/document-ID/URL consistency through the canonical path contract and public detail route.
- Confirmed published-only project reads remain in both collection and detail paths.
- Confirmed dynamic project URLs remain an explicitly recorded sitemap dependency rather than silently being omitted.

No local Node test, build, lint, Firestore Emulator, Storage Emulator, browser, Firebase deployment, or production runtime test was executed.

## Cross-phase impact

- Phase 08 project publication/media contracts remain unchanged.
- Phase 14 centralized SEO remains the canonical metadata implementation.
- Phase 14/15 remain owners of the dynamic sitemap production strategy.
- Phase 13 analytics behavior remains untouched; locale-triggered duplicate `project_view` events remain owned by Step 7.
- No security boundary was weakened.

## Remaining issues

1. Dynamic published-project sitemap generation remains open for Step 8/Step 9 ownership.
2. Runtime verification of Phase 09 remains pending.
3. Phase 09 remains NOT CLOSED under `AGENTS.md`.

**I did not advance to the next step.**


# Step 5 — Phase 10 Repair & Integration Execution Record — 2026-09-26

**Status: COMPLETED**

Step 5 was executed strictly against `docs/repair-roadmap-9-steps.md). The roadmap identifies the Phase 10 production findings as already repaired and requires re-verification after Step 1's canonical data-contract repair.

## Confirmed Step 5 findings re-inspected

### P10-R1 — Exact Firestore Timestamp concurrency — CONFIRMED REPAIRED

Re-inspected:
- `src/features/cms/reviews.ts`
- `src/features/cms/contactLinks.ts`
- `scripts/test-phase10.mjs`

Confirmed:
- `saveReview()` uses `current.value.updatedAt.isEqual(expectedUpdatedAt)`.
- `changeReviewStatus()` uses `current.value.updatedAt.isEqual(expectedUpdatedAt)`.
- `saveContactLink()` uses `current.value.updatedAt.isEqual(expectedUpdatedAt)`.
- The Phase 10 harness explicitly requires `isEqual(expectedUpdatedAt)` and rejects `updatedAt.seconds` in the affected modules.

No seconds-only optimistic-concurrency comparison remains in the Step 5 scope.

### P10-CP01 — Contact-target server validation — CONFIRMED REPAIRED

Re-inspected:
- `firestore.rules`
- `scripts/test-phase10.mjs`
- `src/features/cms/contactLinks.ts`

Confirmed:
- `contactLinks/{linkId}.valid()` directly invokes `isContactTarget(request.resource.data.type, request.resource.data.value)`.
- Contact-link writes remain admin-only.
- Public reads remain constrained to published entries.
- The Phase 10 static harness contains a regression assertion that the rule helper is wired into the contactLinks validation block.
- The client data layer also validates the target before writing, while the Firestore rule remains the authoritative server-side boundary.

The previously suspected "defined but unused" server validation defect is therefore resolved and must not be reopened.

### P10-CP03 — Phase 05 query/index dependency — CONFIRMED CONSISTENT

Re-inspected:
- `src/features/cms/reviews.ts`
- `src/features/cms/contactLinks.ts`
- canonical Phase 05 data/schema contract
- Phase 10 report

Confirmed public queries remain:
- reviews: `where('status', '==', 'published')` + `orderBy('order')`
- contact links: `where('published', '==', true)` + `orderBy('order')`

No Phase 10-local query/schema fork was introduced after Step 1.

## Review lifecycle and publication semantics

Static re-inspection confirms:
- new reviews must start `pending`;
- allowed transitions remain pending → approved → published and published → approved;
- public review reads are published-only;
- `publishedAt` is server-controlled in Firestore rules;
- while a review remains published, its existing `publishedAt` is preserved;
- unpublishing clears `publishedAt`;
- review writes remain admin-only.

## Public/admin boundary and localization

Confirmed:
- public Reviews uses `listReviews(false)`;
- public Contact uses `listContactLinks(false)`;
- admin workflows use the admin data paths;
- external Contact links retain `noopener noreferrer`;
- Phase 10 EN/AR translation anchors remain present;
- no anonymous review-write path was introduced.

## Step 5 disposition

No additional production-code repair was justified.

The previously identified delete-concurrency consideration remains unchanged:
- `deleteReview()` and `deleteContactLink()` still use direct deletion without compare-before-delete.
- This was explicitly classified as a hardening consideration rather than a confirmed contract violation, so Step 5 does not redefine or silently change delete semantics.

## Files inspected

- `AGENTS.md`
- `docs/repair-roadmap-9-steps.md`
- `docs/phase-repair-tracker.md`
- `src/features/cms/reviews.ts`
- `src/features/cms/contactLinks.ts`
- `src/features/cms/ReviewsAdmin.tsx`
- `src/features/cms/ContactLinksAdmin.tsx`
- `src/features/public/Reviews.tsx`
- `src/features/public/Contact.tsx`
- `src/data/schema.ts`
- `firestore.rules`
- `storage.rules`
- `scripts/test-phase10.mjs`
- `scripts/test-rules.mjs`
- `scripts/test-schema.ts`
- `docs/phase-10-report.md`

## Files changed

- `docs/phase-repair-tracker.md` — this Step 5 execution record only.

No production code, dependency, Firestore rule, Storage rule, phase report, or phase ledger was changed.

## Exact static verification

- Exact Timestamp equality confirmed in all three affected data-access operations.
- No seconds-only concurrency comparison remains in those operations.
- Server-side ContactLink target validation confirmed active inside the Firestore rule's `valid()` function.
- Review transition and `publishedAt` rule invariants confirmed.
- Published-only public query predicates confirmed.
- EN/AR and public/admin wiring confirmed by the existing Phase 10 static harness assertions.
- No local Node test, build, lint, TypeScript, Firestore Emulator, Storage Emulator, browser, Firebase deployment, or production runtime test was executed.

## Cross-phase impact

- Phase 05 canonical schema/query/index contract remains authoritative.
- Phase 07 remains unchanged.
- Phase 08 project lifecycle remains unchanged.
- Phase 11/12 consumers remain compatible with the repaired Phase 10 Timestamp contract.
- Phase 13 analytics remains outside Step 5 ownership.

## Remaining issues

1. Delete-concurrency remains a non-blocking hardening consideration.
2. Runtime verification of Phase 10 remains pending.
3. Phase 10 owner acceptance remains pending.
4. Phase 10 remains NOT CLOSED under `AGENTS.md`.

**Owner-controlled phase status:** Phase 10 remains **NOT CLOSED**.

**I did not advance to the next step.**


# Step 6 — Phase 11 & 12 Integration Repair

## Audit/reconciliation status

**Step 6 repository-repair pass completed.**

### Phase 11 verification
- The current Home implementation uses the corrected non-digit WhatsApp normalization expression: `replace(/\D/g, '')`.
- `scripts/test-phase11.mjs` already contains a static guard for that exact contract.
- Featured resolution remains constrained to the loaded published-project set: Home resolves `featuredProjectId` against `listProjects(true)` results rather than reading unpublished project data.
- Show More remains presentation-only React state and does not introduce persistence.
- Public Reviews and Contact consumers remain separate data-access consumers with published-only queries.
- No additional Step 6 production-code change was required for Phase 11.

### Phase 12 verification
- The featured-project lifecycle integration is already present in the project data layer: unpublishing a featured project clears the featured reference before changing publication state, preserving the Firestore invariant.
- Project admin deletion also clears the featured reference before deleting the project.
- Settings continues to expose the existing featured state rather than creating a second featured-selection mechanism.
- The Phase 12 static harness contained a historical assertion that required analytics to be absent from AdminLayout. Phase 13 legitimately added `/admin/analytics`, so that assertion was stale.
- Repaired `scripts/test-phase12.mjs` to assert that all required Phase 12 routes remain present while the legitimate later analytics route is also present. The repair does not remove or weaken any Phase 12 functional assertion and does not remove Phase 13 analytics.

### Files changed
- `scripts/test-phase12.mjs`

### Static verification
- Re-inspected the changed Phase 12 harness contract after the edit.
- Confirmed the obsolete blanket prohibition of analytics navigation is gone.
- Confirmed the replacement assertion requires the complete Phase 12 admin route set and the later `/admin/analytics` route.
- Confirmed no dependency, Firebase rule, data schema, authorization boundary, or Phase 13 analytics implementation was changed.

### Remaining
- Local execution of `npm run test:phase11` and `npm run test:phase12` remains pending for the dedicated runtime/testing stage.
- Phase 11 and Phase 12 remain owner-controlled and are **not CLOSED**.

**Step 6 does not advance the phase ledger or close either phase.**


# Phase 13 — ANALYTICS, OBSERVABILITY & ABUSE RESISTANCE

## Repair Pass

**Step 7 repository repair status: COMPLETED.**

### Findings repaired

- **CP-02 / Phase 13 admin analytics reads:** added explicit `analyticsDaily/{date}` Firestore rules with admin-only reads and explicit client-write denial.
- **CP-08 / duplicate project views:** removed `locale` from the `ProjectDetail` project-view effect dependency so EN/AR switching does not retrigger the same project-view event.
- **Retention cleanup:** changed the scheduled cleanup from one 100-document batch per collection to bounded multi-batch cleanup: 450 documents per batch, up to 5 batches per collection per invocation. The 90-day `expiresAt` policy remains authoritative and later scheduled runs continue draining backlog.

### Verification

Repository-level reinspection confirmed:
- the dedicated analytics Firestore read/write boundary exists;
- the project-view effect is keyed to the loaded project rather than locale;
- the retention constants and loop are present;
- Phase 13 static verification was strengthened to guard these contracts;
- the data-model and Phase 13 report now describe the repaired behavior truthfully.

No local build, emulator, deployed Functions, App Check Console, scheduler, browser, or end-to-end analytics execution was performed.

**Phase 13 remains NOT CLOSED.**

**I did not advance to the next step.**

# Step 8 — Phase 14 Cross-Cutting Hardening & SEO Repair

## Status

**COMPLETED**

Step 8 was executed strictly against `docs/repair-roadmap-9-steps.md`. The confirmed dynamic published-project sitemap finding was repaired. Cross-cutting security, accessibility, performance and SEO contracts were re-inspected within the listed scope. No unrelated refactor or dependency change was introduced.

## Finding handled

### P14-R1 / CP-12 — Dynamic published-project sitemap — RESOLVED

The previous static `public/sitemap.xml` contained only fixed public routes and could not represent published project URLs. The repair now:
- generates `/sitemap.xml` through the server-owned `sitemap` HTTPS Function;
- includes fixed public routes plus only projects with `published == true`;
- filters project slugs against the canonical lowercase slug pattern before emitting URLs;
- XML-escapes generated URL values;
- rejects sitemap generation when the published-project count exceeds the single-sitemap 50,000-URL limit rather than silently omitting URLs;
- caches the generated response for a bounded period;
- routes Hosting `/sitemap.xml` explicitly to the Function;
- removes the stale static sitemap file.

## Files changed

- `functions/index.js`
- `firebase.json`
- `public/sitemap.xml` — deleted because the dynamic rewrite must own this URL
- `scripts/test-phase14.mjs`
- `docs/phase-14-report.md`
- this tracker

## Static verification

- Confirmed the sitemap Function exists and reads only published projects.
- Confirmed the canonical slug shape is enforced before project URLs enter the XML.
- Confirmed the 50,000-URL safety bound exists.
- Confirmed `/sitemap.xml` is explicitly rewritten to `sitemap` in `us-central1`.
- Confirmed the old static sitemap is absent.
- Confirmed `robots.txt` continues to reference `/sitemap.xml`.
- Confirmed the existing `Seo` component derives canonical URLs from the current deployment origin.
- Confirmed Storage rules remain least-privilege and no admin/public authorization boundary was weakened.
- Confirmed route lazy-loading and accessibility hardening remain intact.

## Verification limits

No local Node execution, TypeScript/build/lint, Firebase Emulator, Functions deployment, Hosting request, browser accessibility/performance walkthrough, or production runtime verification was performed. Those remain part of the separate testing stage.

## Remaining issues

1. Runtime verification of the sitemap Function and Hosting rewrite remains pending.
2. Production App Check enforcement, deployed Firebase rules, browser accessibility, and performance measurements remain runtime evidence items.
3. Phase 14 remains **NOT CLOSED** under `AGENTS.md`.

## Owner-controlled phase status

Phase 14 remains **NOT CLOSED**. This Step 8 execution does not alter the phase ledger.

**I did not advance to the next step.**

# Step 9 — Phase 15 Final Release Evidence & Verification Reconciliation

## Status

**COMPLETED at repository level.**

Step 9 was executed strictly against `docs/repair-roadmap-9-steps.md`. The repair reconciled the final release/evidence contract after Steps 1–8 without fabricating missing historical evidence, weakening release checks, or changing the owner-controlled phase ledger.

### Findings handled

#### P15-01 / CP-05 — Missing Phase 01–06 reports — DISPOSITIONED, NOT FABRICATED

Dedicated `docs/phase-01-report.md` through `docs/phase-06-report.md` are still absent. They were not synthesized. The Phase 15 harness now requires the available dedicated Phase 07–15 reports and the canonical repair tracker, while the Phase 01–06 evidence gap remains explicitly documented in the Phase 15 report and README.

This preserves truthful evidence rather than manufacturing historical closure artifacts.

#### P15-02 — Stale Storage assertion — RESOLVED

The Phase 15 harness no longer requires the literal historical `allow write: if isAdmin()` form. It now checks the actual hardened Storage contract: admin-only create/update/delete plus explicit deny-by-default behavior.

#### P15-03 — Phase 05/06 verification inventory gap — RECONCILED

Phase 05 verification is represented by the shared canonical `test:schema` and `test:rules` contracts; no artificial `test:phase05` was added. Phase 06 has no dedicated static harness, so its EN/AR/RTL, keyboard, mobile, hydration and runtime evidence remains explicitly deferred to the separate testing stage. No false automated evidence is claimed.

#### P15-05 — Phase 15 report overstatement — RESOLVED

The report now accurately states that dedicated reports 07–15 exist and that Phase 01–06 historical reports are absent.

#### Post-Step-8 dynamic sitemap drift — RESOLVED

Step 8 replaced the static sitemap with a Hosting rewrite to the server-owned sitemap Function. The old Phase 15 harness still attempted to read `public/sitemap.xml`; Step 9 now verifies the dynamic rewrite/function contract instead.

### Files changed

- `scripts/test-phase15.mjs`
- `docs/phase-15-report.md`
- `README.md`
- `docs/phase-repair-tracker.md`

### Dependency changes

**None.**

### Exact repository-level verification

- Re-inspected `firebase.json`, `.firebaserc`, `firestore.indexes.json`, `functions/index.js`, `functions/package.json`, `storage.rules`, `package.json`, `README.md`, `scripts/test-phase15.mjs`, and `docs/phase-15-report.md`.
- Confirmed the Hosting `/sitemap.xml` rewrite targets `sitemap` in `us-central1` and that the Function emits only published project slugs.
- Confirmed the Storage contract uses explicit create/update/delete rules and a catch-all deny.
- Confirmed the Phase 15 harness no longer depends on the deleted static sitemap file.
- Confirmed the release evidence contract does not fabricate Phase 01–06 reports.
- Confirmed `firestore.indexes.json` exists at the path referenced by `firebase.json`.
- No local Node command, build, lint, TypeScript, Emulator Suite, browser, Firebase deployment, App Check Console verification, or production runtime execution was performed.

### Remaining issues

1. Local/runtime release verification remains pending.
2. Dedicated Phase 01–06 historical reports remain absent; this remains an evidence/closure gap.
3. Owner acceptance remains pending; no phase is marked CLOSED.
4. Deployment remains a separate explicit action.

### Owner-controlled phase status

Phase 15 remains **NOT CLOSED** under `AGENTS.md`.

**I did not advance to the next step.**
