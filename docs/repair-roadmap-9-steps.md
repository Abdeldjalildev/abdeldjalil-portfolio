# Portfolio — 9-Step Repair & Integration Execution Plan

## Purpose

This file is the operational roadmap for the repository repair pass following the deep audits. It converts the findings in `docs/phase-repair-tracker.md` into 9 sequential execution steps.

Start a step by saying: `Based on docs/repair-roadmap-9-steps.md, execute Step N.`

This file does not close phases and does not replace `AGENTS.md` or the phase-repair tracker.

## Global Rules

1. Read `AGENTS.md` and the relevant section of `docs/phase-repair-tracker.md` before every step.
2. Inspect every primary file listed for the step before changing anything.
3. Work only on confirmed findings in the current step.
4. Do not automatically advance to the next step.
5. Do not change the owner-controlled phase ledger or mark phases CLOSED.
6. Evidence first: confirm the finding still exists, make the smallest safe repair, re-inspect the changed scope, then update the tracker/report.
7. Do not run arbitrary local/browser/Firebase/emulator tests during repository repair unless the owner explicitly starts the testing stage.
8. Never weaken tests, validation, Firestore/Storage rules, security boundaries, or historical evidence just to obtain PASS.
9. Do not introduce dependencies or broad refactors without a proven requirement.
10. Cross-phase findings are repaired only in their owning step unless a tiny isolated compile-blocking defect is clearly safe to fix immediately.
11. Never commit secrets or service-account credentials.
12. A step is repository-repair complete only after its confirmed findings are repaired/dispositioned, changed scope is re-inspected, downstream contracts are checked, and the tracker is updated.
13. Repository repair is separate from later local/runtime verification.

## Step 1 — Phase 05: Canonical Data, Rules, Indexes & Storage Contract

Objective: stabilize the canonical data contract before downstream CMS, project and analytics repairs.

Main findings: schema/rules boundary-length mismatch; Firestore rule/data-model consistency; index/configuration consistency.

Files to visit:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `docs/data-model.md`
- `src/data/schema.ts`
- `src/data/index.ts`
- `src/features/cms/data.ts`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `firebase.json`
- `scripts/test-schema.ts`
- `scripts/test-rules.mjs`
- `package.json`

Also inspect downstream consumers in Phase 07 CMS data, Phase 08 project data, Phase 10 reviews/contact, and Phase 13 analytics.

Required: establish one canonical limit, preserve security, reconcile docs/rules/indexes, inspect affected consumers, update only targeted static verification.

Do not weaken rules, remove validation, raise limits merely to make code pass, or redesign the data model without evidence.

## Step 2 — Phase 07: Profile, Services, Skills CMS & Media Contract

Objective: repair Phase 07 CMS contracts and resolve the open media-management question.

Main findings: possible media-management contract gap; Phase 07 service-rule anomaly observed during Phase 10 inspection; inherited schema/rules consistency.

Files to visit:
- `AGENTS.md`
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
- `firestore.rules`
- `storage.rules`
- `scripts/test-schema.ts`
- `scripts/test-rules.mjs`
- Phase 07 report/harness, if present
- `src/features/public/About.tsx`
- `src/features/public/Services.tsx`
- `src/features/public/Skills.tsx`
- current shared media component(s)

Required: verify whether media fields are references or fully CMS-managed, compare Storage paths with workflows, inspect the service-rule anomaly against the real schema, and repair only confirmed defects.

## Step 3 — Phase 08: Projects, Media Lifecycle & Featured Invariant

Objective: repair project lifecycle and media-pipeline integrity.

Main findings: featured-project lifecycle mismatch; orphaned staged objects after gallery validation failure; incomplete multi-object promotion rollback; full-object media buffering.

Files to visit:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `docs/data-model.md`
- `src/features/cms/projects.ts`
- `src/features/cms/ProjectsAdmin.tsx`
- `src/features/cms/projectPresentation.ts`
- `src/data/schema.ts`
- `firestore.rules`
- `storage.rules`
- `scripts/test-phase08.mjs`
- `scripts/test-schema.ts`
- `scripts/test-rules.mjs`
- `docs/phase-08-report.md`
- `src/features/public/Projects.tsx`
- `src/features/public/ProjectDetail.tsx`

Required: reconcile UI and Firestore featured transitions, validate gallery cardinality before staging where practical, make failed promotion bounded/consistent, review memory behavior, preserve published/draft separation.

Do not remove the featured invariant, bypass rules, delete unrelated media, or increase file limits as a workaround.

## Step 4 — Phase 09: Public Projects, Case Studies & SEO Verification

Objective: repair Phase 09 and reconcile its verification contract with centralized SEO.

Main findings: stale Phase 09 SEO harness; public project compatibility with Phase 08; dynamic project URLs as a sitemap dependency.

Files to visit:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `src/features/public/Projects.tsx`
- `src/features/public/ProjectDetail.tsx`
- `src/features/public/projectPresentation.ts`
- `src/features/cms/projects.ts`
- `scripts/test-phase09.mjs`
- `docs/phase-09-report.md`
- `docs/data-model.md`
- `src/components/seo/Seo.tsx`
- `src/App.tsx`
- `public/robots.txt`
- `public/sitemap.xml`, if present
- `firebase.json`

Required: align the Phase 09 harness with centralized `Seo`, preserve published-only project behavior, verify slug/canonical consistency, and record the dynamic sitemap dependency.

Do not revert Phase 14 SEO merely to satisfy a stale test.

## Step 5 — Phase 10: Reviews, Contact Links & Concurrency

Objective: verify the repaired reviews/contact contract after Step 1.

Known repaired findings: contact-target validation wired into rules; exact Firestore Timestamp equality; Phase 10 static audit; Phase 05/12 integration check.

Files to visit:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `src/features/cms/reviews.ts`
- `src/features/cms/contactLinks.ts`
- `src/features/cms/ReviewsAdmin.tsx`
- `src/features/cms/ContactLinksAdmin.tsx`
- `src/features/public/Reviews.tsx`
- `src/features/public/Contact.tsx`
- `src/data/schema.ts`
- `src/data/index.ts`
- `firestore.rules`
- `storage.rules`
- `scripts/test-phase10.mjs`
- `scripts/test-rules.mjs`
- `scripts/test-schema.ts`
- `docs/phase-10-report.md`

Required: reconfirm server-side target validation, exact concurrency, review transitions, `publishedAt`, published-only public queries, EN/AR, and admin/public boundaries.

Do not create anonymous review writes, bypass moderation, weaken contact validation, or return to seconds-only concurrency.

## Step 6 — Phase 11 & 12: Home Integration + Admin Operations

Objective: repair the application integration layer after its dependent CMS contracts are stable.

Phase 11 files:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `src/features/public/Home.tsx`
- `src/features/public/projectPresentation.ts`
- `src/features/public/Reviews.tsx`
- `src/features/public/Contact.tsx`
- `src/features/cms/projects.ts`
- `src/features/cms/reviews.ts`
- `src/features/cms/contactLinks.ts`
- `scripts/test-phase11.mjs`
- `docs/phase-11-report.md`

Phase 12 files:
- `src/features/cms/Dashboard.tsx`
- `src/features/cms/SettingsAdmin.tsx`
- `src/features/cms/settings.ts`
- `src/data/publicSettings.ts`
- `src/routes/AdminLayout.tsx`
- `src/features/cms/ProfileAdmin.tsx`
- `src/features/cms/ServicesAdmin.tsx`
- `src/features/cms/SkillsAdmin.tsx`
- `scripts/test-phase12.mjs`
- `docs/phase-12-report.md`
- `src/i18n/I18nProvider.tsx`
- `src/i18n/helpers.ts`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/ar.ts`

Main findings: Phase 11 WhatsApp normalization was repaired and guarded; Phase 12 harness historically rejects legitimate Phase 13 analytics navigation.

Required: recheck Home publication/featured behavior and public consumers; preserve presentation-only Show More; reconcile dashboard/settings; update Phase 12 verification without prohibiting legitimate later analytics; preserve auth and EN/AR parity.

## Step 7 — Phase 13: Analytics, Observability & Abuse Resistance

Objective: repair analytics security, correctness and retention.

Files to visit:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `src/features/cms/AnalyticsAdmin.tsx`
- `src/features/public/ProjectDetail.tsx`
- current analytics Functions/callable implementation
- current analytics schemas/types
- `firestore.rules`
- `firestore.indexes.json`
- `scripts/test-phase13.mjs`
- `docs/phase-13-report.md`
- `docs/data-model.md`
- `src/main.tsx`

Main findings: missing admin read rule for `analyticsDaily/{date}`; duplicate project views on locale changes; bounded retention cleanup; persistent visitor-marker privacy contract; App Check Console enforcement cannot be proven from source alone.

Required: add admin-only analyticsDaily reads while keeping client writes denied; preserve `admin: true`; prevent locale-triggered duplicate events; reconcile retention with documented policy; document visitor-marker purpose/lifetime; reconcile tests/data-model/rules.

Do not allow browser writes to analyticsDaily or replace Auth authorization with App Check.

## Step 8 — Phase 14: Cross-Cutting Security, Accessibility, Performance & SEO

Objective: apply final cross-cutting hardening after feature contracts are stable.

Files to visit:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `src/components/seo/Seo.tsx`
- `src/App.tsx`
- `src/main.tsx`
- `src/components/layout/PublicHeader.tsx`
- `src/components/layout/PublicFooter.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/routes/AdminLayout.tsx`
- `storage.rules`
- `firestore.rules`
- `public/robots.txt`
- `public/sitemap.xml`
- `scripts/test-phase14.mjs`
- `docs/phase-14-report.md`
- `src/features/public/ProjectDetail.tsx`
- `src/features/public/Projects.tsx`
- `src/features/cms/ProjectsAdmin.tsx`
- shared media components
- Phase 02 token files/primitives

Main findings: dynamic project URLs are absent from the static sitemap; cross-cutting verification must reflect final architecture; earlier harnesses must not conflict with intentional Phase 14 design.

Required: define a production-safe sitemap for published project slugs; verify canonical origin/SEO; preserve least-privilege Storage; verify accessibility hardening; inspect relevant token bypasses; inspect lazy-loading boundaries; reconcile Phase 14 harness/report.

Do not expose unpublished/admin routes in SEO or weaken Storage rules.

## Step 9 — Phase 15: Final Release Evidence & Verification Reconciliation

Objective: perform the final repository-level release-readiness reconciliation after Steps 1–8.

Files to visit:
- `AGENTS.md`
- `docs/phase-repair-tracker.md`
- `docs/repair-roadmap-9-steps.md`
- `firebase.json`
- `.firebaserc`
- `package.json`
- `package-lock.json`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `functions/` configuration/package files
- `scripts/test-phase15.mjs`
- `docs/phase-15-report.md`
- `README.md`
- `docs/phase-01-report.md` through `docs/phase-15-report.md`
- available `scripts/test-phase*.mjs`
- `scripts/test-schema.ts`
- `scripts/test-rules.mjs`

Known findings: Phase 01–06 reports are missing while Phase 15 historically expects them; a Storage assertion may be stale relative to explicit create/update/delete rules; early-phase verification inventory is unclear; Phase 15 report previously claimed all phase reports were present.

Required: inspect all earlier repair results; reconcile final harness assertions; preserve truthful early-phase evidence; correct stale report statements; confirm Firebase references existing files; confirm repository security boundaries; produce final repository-repair evidence.

Do not fabricate reports or weaken release checks.

Step 9 does not claim local build, emulator, Firebase deployment, Google sign-in, App Check Console enforcement, browser accessibility, production Hosting behavior, or callable Function execution. Those belong to the separate runtime testing stage.

## Global Completion Checklist

- [ ] Steps 1–9 executed in order.
- [ ] No step silently skipped.
- [ ] `docs/phase-repair-tracker.md` reflects all confirmed repairs.
- [ ] No phase marked CLOSED automatically.
- [ ] No unrelated dependency churn introduced.
- [ ] No security rule weakened.
- [ ] No test weakened or removed to obtain PASS.
- [ ] No fake historical evidence created.
- [ ] Phase 05–15 contracts and verification artifacts are reconciled.
- [ ] Only then start local/runtime testing.

## Mandatory Output After Every Step

Report: Step name; status (`COMPLETED`, `PARTIALLY COMPLETED`, `BLOCKED`, or `NO CHANGE REQUIRED`); findings handled; files inspected; files changed; exact static verification; cross-phase impact; remaining issues; next action; owner-controlled phase status.

Always end the step report with:
> I did not advance to the next step.

## Final Principle

The goal is not merely a green repository. The goal is agreement between implementation, security rules, data contracts, verification harnesses and documentation without inventing evidence, weakening safeguards, or hiding unresolved runtime work.

Repository repair comes first. Runtime verification comes after. Phase closure remains an owner decision under `AGENTS.md`.
---

# Post-Execution Reconciliation — 2026-09-26

This section records the final repository-level interpretation of the nine-step execution. The original step instructions and historical evidence are preserved above.

| Step | Planned work | Actual repository work | Evidence | Current status |
|---|---|---|---|---|
| 1 | Phase 05 canonical data/rules/index/storage contract | Canonical limits, rules boundary handling, indexes and related verification contracts were reconciled. | Tracker repair records; current rules/schema/index files. | **COMPLETED — VERIFICATION REQUIRED** |
| 2 | Phase 07 CMS/media contract | Confirmed/repaired repository-level Phase 07 contract items, but the broader media-management workflow question remains a contract/owner decision. | Tracker Step 2 disposition and affected CMS/rules/schema files. | **PARTIALLY COMPLETED** |
| 3 | Phase 08 projects/media/featured lifecycle | Featured lifecycle, pre-validation/staging cleanup and multi-object rollback were repaired and statically re-inspected. Full-object media buffering remains unresolved. | Phase 08 repair-pass report, scripts/test-phase08.mjs, repair commits. | **PARTIALLY COMPLETED** |
| 4 | Phase 09 public projects/SEO verification | Phase 09 verification was reconciled with centralized SEO while preserving published-only project behavior. | Phase 09 report/harness and tracker. | **COMPLETED — VERIFICATION REQUIRED** |
| 5 | Phase 10 reviews/contact/concurrency | Exact timestamp concurrency and server-side contact-target validation were repaired/reconciled; review/publication contracts remain subject to runtime verification. | Phase 10 report/harness and rules/source inspection. | **COMPLETED — VERIFICATION REQUIRED** |
| 6 | Phase 11/12 integration and admin operations | Home/WhatsApp integration and Phase 12 verification drift around the legitimate analytics route were reconciled. | Step 6 tracker/report evidence and current route/harness. | **COMPLETED — VERIFICATION REQUIRED** |
| 7 | Phase 13 analytics/security/retention | Analytics admin reads, client-write denial, locale-duplicate prevention, bounded retention and privacy documentation were repaired/reconciled. | Phase 13 repair-pass report and harness. | **COMPLETED — VERIFICATION REQUIRED** |
| 8 | Phase 14 cross-cutting hardening/SEO | Dynamic sitemap and cross-cutting verification/report drift were reconciled; project-media buffering remains a separate open hardening concern. | Phase 14 report/harness and tracker. | **COMPLETED WITH RESIDUAL CP-11 — VERIFICATION REQUIRED** |
| 9 | Phase 15 release/evidence reconciliation | Stale evidence assertions were corrected; missing historical Phase 01–06 reports remain explicitly unproven rather than fabricated. | Phase 15 report, latest correction commit, current phase-15 harness. | **PARTIALLY COMPLETED — EVIDENCE GAP REMAINS** |

## Important interpretation

“Repository repair execution reached Step 9” means the planned repair workflow was carried through its final repository-level reconciliation step. It does **not** mean every historical finding is fixed, every runtime contract is verified, or any phase is closed.

## Residual work before testing

Before the separate runtime testing stage begins, the repository has two non-runtime dispositions that must remain visible:

1. **CP-09:** owner/contract clarification for Phase 07 media-management semantics.
2. **CP-11:** open project-media full-object buffering hardening concern.

The historical **CP-05** evidence gap must also remain explicitly documented.

## Testing boundary

No local build, lint, typecheck, emulator, browser, deployed Function, Hosting, App Check Console, or production verification is claimed by this section. Those belong to the next testing stage after documentation reconciliation and any owner decisions.

## Phase closure boundary

The roadmap does not close phases. AGENTS.md remains the authority for formal phase closure and owner acceptance.