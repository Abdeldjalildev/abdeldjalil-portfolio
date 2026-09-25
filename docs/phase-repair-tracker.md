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
