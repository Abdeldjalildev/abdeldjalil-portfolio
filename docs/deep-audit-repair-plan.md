# Portfolio Deep-Audit Repair Plan

This document is the consolidated repair execution plan derived from the completed phase-by-phase deep audit. It is subordinate to `AGENTS.md` and never overrides it.

## Authority and non-negotiable constraints

- `AGENTS.md` remains the authoritative master plan and agent contract.
- Repair one owning phase at a time; never advance automatically.
- Do not change the owner-controlled phase ledger.
- Do not fabricate missing historical evidence or reports.
- Do not weaken/delete/bypass tests or security rules.
- Preserve deny-by-default Firestore/Storage behavior.
- Preserve the trusted Firebase custom claim `admin: true`.
- Preserve the frozen Phase 05 data contract unless a documented contract repair requires aligned changes.
- No unrelated refactors, redesigns, dependency churn, or architecture rewrites.
- No dependency may be added without satisfying `AGENTS.md` dependency discipline.
- Runtime evidence must never be claimed from static inspection.
- No commit/push unless explicitly authorized by the owner.
- If a repair exposes a new blocking ambiguity, stop and record it rather than guessing.

## Repair dependency order

1. Phase 05 — canonical data/rules/storage contract
2. Phase 07 — core CMS/media contract
3. Phase 08 — project lifecycle/media/featured invariant
4. Phase 09 — public project contract and verification compatibility
5. Phase 10 — reviews/contact/concurrency/rules
6. Phase 11 — Home integration
7. Phase 12 — admin operations/settings/navigation
8. Phase 13 — analytics security/semantics/admin reads
9. Phase 14 — cross-cutting hardening/SEO/sitemap
10. Phase 15 — final evidence/release verification
11. Separate final local/emulator/browser/production verification stage required by `AGENTS.md`.

Phases 01–04 and 06 were separately audited; their confirmed findings remain phase-owned and must not be silently folded into another phase.

# Phase 05 — canonical data/rules/storage contract

## P05-01 / G1-01 — Schema/rules aggregate-length mismatch

**Problem:** application schemas validate list cardinality and individual element lengths, while some Firestore rules validate joined aggregate strings. Exact maximum payloads can therefore pass the schema and fail the authoritative rule.

**Repair:** establish one effective boundary enforced identically by schema and rules.

**Constraints:** preserve existing maximum item counts and individual limits; do not weaken rules; add exact maximum-valid and first-invalid boundary cases; inspect all downstream consumers after changing the shared contract.

**Acceptance:** schema and rules both accept the same maximum valid payload and reject the same invalid boundary; shared tests demonstrate no disagreement.

## P05-02 / CP-01 — Missing `firestore.indexes.json`

**Problem:** `firebase.json` references `firestore.indexes.json`, but the current repository does not expose that file at the referenced path.

**Repair:** reconcile Firebase configuration with the canonical Phase 05 index contract.

**Constraints:** preserve documented composite indexes; do not invent unnecessary indexes; ensure every declared path resolves; ensure every documented composite query has its required index.

**Acceptance:** Firebase config and index artifact agree, with no stale/duplicate definitions.

# Phase 07 — core CMS/media contract

## P07-01 / CP-09 — Phase 07 media-management contract is weaker than Projects

**Problem:** Profile, Services and Skills expose Storage-path fields/rules but do not provide a comparable end-to-end upload/replace/cleanup workflow.

**Repair:** add one narrowly scoped shared media workflow using the existing Storage paths and limits.

**Constraints:** admin-only writes remain authoritative; Firestore stores references/metadata; reuse existing paths/limits; do not create a second media architecture; handle replacement/deletion without silently accumulating stale objects; preserve existing localization and optimistic concurrency.

**Acceptance:** supported profile/service/skill media can be safely set/replaced/removed; invalid files are rejected; public rendering safely handles missing media; no localStorage/fake backend.

# Phase 08 — project lifecycle/media/featured invariant

## P08-01 / G2-01 — Featured-project lifecycle mismatch

**Problem:** Firestore rules deny unpublishing the current featured project while the admin UI exposes direct unpublish.

**Repair:** make UI lifecycle-aware: require clearing/reassigning featured state first, or disable unpublish with explicit guidance.

**Constraints:** rule remains authoritative; exactly one featured project remains the invariant; never weaken the rule or create a second source of truth.

**Acceptance:** invalid direct writes remain denied and the UI guides the valid lifecycle.

## P08-02 / G2-02 — Orphaned staged media after validation failure

**Problem:** some upload flows stage media before complete gallery cardinality/schema validation, leaving possible orphan draft objects after invalid selection.

**Repair:** validate complete intended selection before staging where possible; otherwise perform best-effort cleanup scoped only to objects created by the failed operation.

**Constraints:** preserve draft/public separation; never delete unrelated media; cleanup failure must not silently convert the original operation into success; do not weaken Storage rules.

**Acceptance:** invalid >12 gallery selection leaves no lasting staged objects where cleanup is possible; unrelated media remains untouched.

## P08-03 / G2-03 — Multi-object media promotion is not failure-atomic

**Problem:** if a later Storage move fails before the Firestore rollback boundary, earlier moves can remain completed.

**Repair:** record every successful move and compensate by rolling back all completed moves if a later move fails, then propagate the original error.

**Constraints:** do not claim distributed transaction semantics; keep Firestore/security semantics unchanged unless inspection proves otherwise.

**Acceptance:** simulated partial failure compensates prior moves; no partial publication is silently reported.

## P08-04 / G2-04 — Full-object buffering during media promotion

**Problem:** promotion uses full-object `getBytes()` then `uploadBytes()`.

**Repair:** use a memory-safe supported transfer strategy or sequential bounded processing.

**Constraints:** do not raise the 5 MiB limit; no dependency without concrete justification; preserve validation/security.

**Acceptance:** memory behavior is bounded/reasonable for supported media and security remains unchanged.

# Phase 09 — public projects and verification compatibility

## P09-01 / G4-04 — Stale SEO harness

**Problem:** Phase 09 harness expects direct `document.title`/meta manipulation while Phase 14 intentionally centralized SEO in `Seo.tsx`.

**Repair:** assert that ProjectDetail supplies project-specific SEO inputs to the shared Seo component.

**Constraints:** do not revert centralized SEO; do not weaken the test into generic SEO existence.

**Acceptance:** Phase 09 harness passes against the current architecture and project-specific SEO fields remain covered.

## P09-02 / G5-03 — Dynamic project sitemap

**Problem:** static sitemap cannot enumerate CMS-generated project slugs.

**Repair:** define a production-safe sitemap strategy that includes published project slugs only.

**Constraints:** never expose unpublished/admin routes; use the same canonical origin/slug contract as SEO; coordinate with Phase 14/15.

**Acceptance:** published project appears; unpublished project does not; fixed routes remain present.

# Phase 10 — reviews/contact/concurrency/rules

## P10-01 / G1-02 — Contact target relationship validation missing from active Firestore write path

**Problem:** client validation is stronger than the active server rule path; an authorized writer can create type/value combinations that are broadly safe but semantically mismatched.

**Repair:** enforce the same per-type relationship invariant in Firestore rules.

**Constraints:** preserve valid email/phone/WhatsApp/HTTPS forms; client validator remains for UX; server validation is authoritative; unsafe schemes remain denied.

**Acceptance:** matching combinations allowed; mismatched combinations denied; unsafe schemes remain denied.

## P10-02 / G1-03 — Review/contact optimistic concurrency precision

**Problem:** review/contact writers compare `updatedAt.seconds` instead of exact Firestore Timestamp equality.

**Repair:** use exact Timestamp equality consistently with the other CMS writers.

**Constraints:** preserve transactions, server timestamps and create/update semantics.

**Acceptance:** stale same-second updates cannot incorrectly pass; exact matching timestamps permit intended updates.

# Phase 11 — Home integration

No new confirmed structural Phase 11 defect is scheduled by the grouped audit beyond previously repaired isolated issues.

Before closure:
- rerun the Phase 11 static harness after upstream repairs;
- ensure featured resolution still uses published projects;
- ensure EN/AR and partial-data behavior remain intact;
- ensure later analytics/SEO integrations do not create false Phase 11 claims.

Do not add unrelated Home features.

# Phase 12 — admin operations/settings/navigation

## P12-01 / G2-01 integration — Featured unpublish UX

After Phase 08 establishes the lifecycle rule, update admin operations so an invalid lifecycle cannot be entered blindly.

Constraints: UI is guidance only; Firestore remains authoritative; preserve destructive confirmations.

## P12-02 / G4-05 — Phase 12 harness conflicts with Phase 13 analytics

**Problem:** Phase 12 test rejects analytics in admin navigation even though Phase 13 legitimately added it.

**Repair:** assert required Phase 12 routes without blanket-prohibiting legitimate later additions, or use an explicitly historical snapshot contract.

**Constraints:** do not weaken meaningful Phase 12 assertions and do not remove Phase 13 analytics.

**Acceptance:** Phase 12 harness passes while required Phase 12 routes and Phase 13 analytics both remain present.

# Phase 13 — analytics security/semantics/admin reads

## P13-01 / G3-01 — analyticsDaily admin read contract broken

**Problem:** AnalyticsAdmin reads `analyticsDaily/{date}`, but current Firestore rules have no corresponding admin-read match; catch-all deny blocks the dashboard.

**Repair:** add an explicit admin-only read rule.

**Constraints:** only `admin: true` may read; client writes remain denied; callable/App Check ingestion remains server-authorized; catch-all deny remains.

**Acceptance:** admin read allowed; non-admin read denied; client write denied; ingestion contract unchanged.

## P13-02 / G3-02 — Duplicate project_view on locale changes

**Problem:** ProjectDetail analytics effect depends on locale, so switching EN/AR can emit another project_view for the same visit.

**Repair:** remove locale from the effect dependency or otherwise explicitly define deduplication. Minimal repair: dependency on project identity only.

**Constraints:** do not add event types or uncontrolled analytics writes.

**Acceptance:** initial project load emits once; locale switch alone emits none; changing project emits the new event.

## P13-03 / G3-03 — Retention cleanup is bounded per invocation

**Problem:** cleanup deletes only a limited batch per run, so backlog can exceed the documented 90-day retention target.

**Repair:** continue bounded batches until the expired set is exhausted within resource-safe limits, or change the documented guarantee deliberately.

**Constraints:** no unbounded loop; preserve policy unless explicitly changed; avoid deleting active data.

**Acceptance:** multiple expired batches are eventually removed without resource runaway.

## P13-04 / G3-04 — Persistent visitor identifier/privacy contract

**Problem:** persistent first-party visitor ID is a pseudonymous marker and must be documented as such.

**Repair:** align privacy/retention documentation with actual persistence, hashing and purpose. Do not silently remove/change persistence.

**Acceptance:** documentation accurately describes implementation and does not imply collection that does not occur.

# Phase 14 — cross-cutting hardening/SEO/sitemap

## P14-01 — Dynamic sitemap implementation

Coordinate with P09-02 so the final production sitemap includes only published project URLs and uses the canonical runtime origin.

## P14-02 — Project media memory safety

Coordinate with P08-04; do not duplicate or diverge from the Phase 08 media contract.

## P14-03 — Final cross-cutting regression review

After upstream repairs, inspect:
- design-token bypasses;
- accessibility/security regressions;
- external link safety;
- route/SEO consistency;
- Storage/Firestore boundary;
- bundle/performance impact;
- EN/AR/RTL behavior.

# Phase 15 — final evidence/release verification

## P15-01 / G4-01 — Missing Phase 01–06 reports

Do not fabricate reports. Define a truthful final evidence contract that identifies actual historical artifacts and separates static inspection, executable tests, browser/emulator evidence and production evidence.

If retrospective reports are ever created, they must be clearly labeled retrospective and must not claim execution that never happened.

## P15-02 / G4-02 — Stale Storage assertion

Replace historical string matching with semantic assertions for admin create/update/delete, intended public reads, denied non-admin writes and deny-by-default paths.

## P15-03 / G4-03 — Phase 05/06 verification inventory

Document the actual evidence sources instead of requiring nonexistent `test:phase05`/`test:phase06` artifacts. Never create empty scripts solely to satisfy filenames.

## P15-04 / G4-06 — Phase 15 report contradicts current tree

Correct the report's claim that Phase 01–15 reports are all present. Preserve actual blockers.

# Phase 04 — authentication hardening findings

These remain phase-owned and are not absorbed into Phase 15 merely because they affect release evidence.

## P04-01 — Manual claim refresh failure handling

Make `AuthProvider.refetch()` converge on the same safe failure handling as initial auth initialization.

Constraints:
- never grant admin on client error;
- preserve `admin: true` server authorization;
- avoid unhandled promise rejection.

Acceptance:
- successful refresh updates claims;
- failed refresh does not grant admin;
- UI recovers safely.

## P04-02 — Async auth stale-result race

Guard asynchronous claim loads so only the latest auth-state operation can commit.

Constraints:
- preserve deny-by-default;
- never attach stale claims to a newer session;
- avoid unnecessary global state.

Acceptance:
- rapid auth transitions cannot leave stale claims attached to the wrong user.

# Phase 02 — isolated verification-surface correction

## P02-01 — Design-system preview organization

Move the "Surfaces, depth and glass" section outside the colour-token grid into its own top-level verification section.

Constraints:
- temporary preview only;
- no production token/component behavior change.

Acceptance:
- preview structure is semantically clear and all token values remain unchanged.

# Global protected contracts

### Authentication
`admin: true` remains the trusted admin authorization signal.

### Firestore
Public queries must satisfy publication predicates because rules are not filters.

### Storage
Public media is readable only where intended; admin writes/deletes remain protected; catch-all paths remain denied.

### Projects
- immutable slug/document ID;
- exactly one featured project;
- `settings/main.featuredProjectId` remains the source of truth;
- featured project must be published;
- featured project cannot be deleted/unpublished while still referenced;
- draft/public media remain separated.

### Reviews
- new reviews start pending;
- Pending → Approved → Published;
- Published → Approved for unpublish;
- unpublished reviews never render publicly;
- aggregate rating uses published reviews only.

### Contact
- published-only public reads;
- safe target types;
- unsafe schemes denied;
- admin-only writes.

### Analytics
- no public analytics reads;
- client writes denied;
- ingestion server-authorized;
- App Check is additional abuse protection, not a replacement for Auth.

### i18n
- EN/AR dictionaries remain synchronized;
- true RTL remains direction-based;
- CMS localized content remains distinct from static UI translations.

### SEO
- shared `Seo` component remains canonical;
- project SEO consumes canonical project data;
- canonical origin remains runtime-safe.

# Not classified as code defects without runtime evidence

These remain verification tasks:
1. Firebase Hosting deep-link/rewrite behavior.
2. Real Google sign-in.
3. Real claim refresh/revocation.
4. Firestore/Storage emulator rules execution.
5. Production App Check enforcement in Firebase Console.
6. Browser accessibility/focus behavior.
7. Arabic shaping/RTL rendering.
8. Responsive mobile/tablet/desktop behavior.
9. Production environment variables.
10. Deployed Functions callable behavior.
11. Actual production deployment.
12. Exact rendered WCAG contrast.
13. Release rollback behavior.

# Repair completion criteria

A repair phase is complete only when:
1. Its finding is resolved without weakening the contract.
2. Direct consumers are inspected.
3. Stale harnesses are updated only to reflect intended architecture.
4. Security invariants remain intact.
5. No unrelated scope is introduced.
6. Tracker/report state matches reality.
7. Runtime claims are made only after execution.
8. `AGENTS.md` phase status remains owner-controlled.
9. The next dependent repair is not started automatically.

# Final release gate

Before any RELEASE-READY conclusion:
- all blocking static findings are resolved or explicitly owner-accepted;
- verification drift is reconciled;
- required local/emulator/browser/production evidence is executed;
- Firebase production configuration is verified;
- App Check enforcement is verified in the real Firebase environment;
- no secrets/service-account credentials are committed;
- the owner explicitly accepts the final evidence package.

**This file is a repair plan only. It does not close phases, authorize deployment, or replace `AGENTS.md`.**
