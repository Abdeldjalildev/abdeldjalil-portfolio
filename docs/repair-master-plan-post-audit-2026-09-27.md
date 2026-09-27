# Portfolio — Post-Repair Master Correction Plan
## Authoritative correction contract after the 2026-09-27 post-repair deep audit

Repository: https://github.com/Abdeldjalildev/abdeldjalil-portfolio
Branch: main
Audit baseline: 5c3ffa30302ce72cfc23242c880ff8426c0abb71
Audit date: 2026-09-27

> STATUS: This document is the authoritative correction plan for the next GitHub-only repair cycle.
> It does NOT close any phase. It does NOT replace AGENTS.md. AGENTS.md remains the governing project contract.
> It replaces earlier repair-roadmap sequencing only where this document explicitly defines a newer correction sequence.

---

# 1. Purpose and authority

This document was created after a fresh post-repair deep audit of the current GitHub repository.

The audit was performed against:
- AGENTS.md
- docs/deep-audit-repair-plan.md
- docs/phase-repair-tracker.md
- docs/repair-roadmap-9-steps.md
- current source files, Firebase rules/configuration, scripts and package.json
- current repository history at the audit baseline

The purpose is to identify every currently actionable GitHub-side correction that should be completed before local VS Code runtime testing.

This document is a correction ledger and execution contract.

It must be updated after every correction stage.

A finding may only be marked FIXED after:
1. the relevant implementation is inspected;
2. the correction is actually applied;
3. the affected logic is re-read after modification;
4. related contracts and callers are checked;
5. the correction is shown not to create an obvious contradiction with adjacent logic;
6. the relevant static verification/harness is updated when appropriate;
7. the exact result is recorded here.

No finding may be marked PASS merely because code was edited.

---

# 2. Current audit conclusion

The repository is NOT yet at "all GitHub work finished".

The fresh audit found a small set of actionable GitHub-side corrections plus evidence/contract decisions.

## Actionable technical corrections

### F-01 — Phase 04 manual auth claim refresh failure handling
Status: OPEN
Severity: HIGH
Owner: Phase 04

Current issue:
AuthProvider.refetch() awaits forced claim loading without equivalent deny-by-default failure handling.

Risk:
A failed claim refresh can leave stale authenticated/admin UI state. This is primarily a client-state consistency/recovery defect, not a demonstrated server-side privilege escalation.

Preferred correction:
Make refetch converge on the same safe failure semantics as initial auth initialization:
- catch claim-read failures;
- never grant admin on failure;
- converge to a safe state;
- preserve Firebase Auth as the session authority;
- preserve Firestore/Storage rules as the authorization boundary.

Primary files to inspect:
- src/auth/AuthProvider.tsx
- src/auth/context.ts
- src/auth/* claim-loading helpers
- relevant admin guards/routes
- Phase 04 documentation
- package.json
- existing test scripts

Do not:
- move authorization into client state;
- add localStorage/sessionStorage role persistence;
- change Firestore/Storage trust boundaries unnecessarily;
- redesign the auth architecture.

---

### F-02 — Phase 04 async auth-state stale-result race
Status: OPEN
Severity: HIGH
Owner: Phase 04

Current issue:
The async onAuthStateChanged flow can resolve an older claim request after a newer auth-state transition.

Risk:
Stale authenticated/admin UI may be published after a newer sign-out/account/session state.

Preferred correction:
Add a narrow generation/cancellation guard:
- each relevant auth-state transition invalidates prior async work;
- a late result may not overwrite newer state;
- sign-out/new user transitions must dominate older requests.

Primary files:
- src/auth/AuthProvider.tsx
- src/auth/context.ts
- related auth helpers/guards
- Phase 04 verification harness

Do not:
- introduce broad state-management libraries;
- refactor unrelated authentication code;
- weaken deny-by-default behavior.

---

### F-03 — CP-11 full-object project-media promotion
Status: OPEN
Severity: MEDIUM/HIGH
Owner: Phase 08 / Phase 14

Current issue:
The project-media promotion path currently uses full-object download/upload semantics.

Preferred correction:
First inspect the exact current implementation and Firebase capabilities available to this repository. Prefer a server-side/trusted promotion path if required to avoid browser-side full-object buffering. Do not invent an unsupported client-side "copy" API.

The correction must preserve:
- staging;
- validation;
- gallery cardinality;
- rollback/cleanup;
- metadata/content type;
- authorization;
- existing public media references;
- project lifecycle invariants.

Primary files:
- src/features/cms/projects.ts
- related media/storage helpers
- storage.rules
- firebase.json
- functions/* if a trusted promotion path is introduced
- Phase 08/14 scripts and reports

External technical reference checked during audit:
Firebase Web Storage exposes getBytes()/getBlob() for downloads and uploadBytes()/uploadBytesResumable() for uploads; the Web SDK does not expose a general client-side object-copy primitive in the referenced API. Therefore the repair must not pretend that such an API exists.

Do not:
- silently switch to a fake/nonexistent Firebase API;
- remove rollback;
- weaken Storage rules;
- add a large dependency merely to copy objects;
- make the browser download production media just to re-upload it.

---

### F-04 — Phase 02 DesignSystemPreview structural verification defect
Status: OPEN
Severity: LOW
Owner: Phase 02

Current issue:
The "Surfaces, depth and glass" verification section is nested inside the "Colour tokens" section/grid, making the temporary verification surface semantically confusing.

Preferred correction:
Separate the surface/depth/glass verification section into its own top-level verification section without changing production design tokens/components.

Primary file:
- src/design-system/DesignSystemPreview.tsx

Do not:
- alter production visual tokens;
- redesign the design system;
- change downstream application behavior.

---

# 3. Contract/evidence findings

### F-05 — Phase 07 media-management contract ambiguity (CP-09)
Status: OWNER/CONTRACT DECISION REQUIRED
Severity: MEDIUM
Owner: Phase 07

Finding:
Profile/services/skills expose media-path fields, but the audit does not prove that they are required to have the same first-class upload/replace/delete/staging lifecycle as Phase 08 projects.

Action:
Do NOT implement speculative media-management functionality.

Before changing code, establish one explicit contract:
A. Phase 07 media fields are references only and media lifecycle is outside Phase 07 scope.
OR
B. Phase 07 requires full CMS media lifecycle, in which case the contract, implementation, rules and verification must be added.

Until the owner decision exists, this finding remains OPEN/CONTRACT.

---

### F-06 — Missing historical Phase 01–06 evidence
Status: EVIDENCE GAP
Severity: HIGH for Phase 15 closure; not a blocker for ordinary local testing
Owner: Phase 15 evidence contract

Finding:
The current repository has no dedicated Phase 01–06 reports/harnesses matching the historical Phase 07+ pattern.

Action:
Do NOT fabricate historical reports or synthetic PASS evidence.

Preferred correction:
Keep historical evidence explicitly distinct from new current-state verification. If historical artifacts cannot be recovered, Phase 15 must document the gap and use current verification evidence for current behavior rather than rewriting history.

---

### F-07 — Phase 02/03/05/06 dedicated harness coverage gap
Status: OPEN — TEST PREPARATION
Severity: MEDIUM
Owner: respective phases / Phase 15 evidence

Finding:
The current test script set begins at Phase 07. This creates verification-surface gaps for earlier phases.

Action:
Add only useful, contract-backed static harnesses where they provide real evidence. Do not create tests whose only purpose is to make the ledger green.

Priority:
- Phase 04 harness is mandatory because of F-01/F-02.
- Phase 05 harness should cover canonical schema/rules/index contracts where not already covered by existing scripts.
- Phase 02/03/06 harnesses should be added only where the AGENTS gate contract requires machine-checkable evidence.

---

# 4. Findings explicitly checked and NOT added as new defects

The fresh audit also checked for broad categories of common regressions:
- TODO/FIXME/HACK markers
- obvious client-side privilege persistence patterns
- broad hardcoded environment/security values
- obvious public Firestore write/read-open patterns
- existing phase reports and test harness naming
- existing Firebase rules and analytics rule boundaries

No additional confirmed defect was added from those checks.

Important intentional behavior remains intentional:
- public review avatar GET access is not automatically a defect;
- published public content reads are allowed by the documented public-content contract;
- analytics daily aggregates remain admin-readable and client-write denied;
- no client-side admin claim provisioning was found.

---

# 5. Current known findings carried forward from previous repair cycle

These are already repaired at repository level and therefore are NOT to be re-fixed unless a new audit proves regression:

- CP-01 — firestore.indexes.json presence/reference
- CP-02 — analyticsDaily read/write boundary
- CP-03 — Phase 09 SEO harness drift
- CP-04 — Phase 12 analytics route drift
- CP-06 — featured-project unpublish lifecycle
- CP-07 — schema/rules aggregate-length alignment
- CP-08 — duplicate project-view event on locale change
- CP-10 — staged-media orphan cleanup/rollback
- CP-12 — dynamic project sitemap generation
- CP-13 — exact Firestore Timestamp concurrency handling
- CP-14 — contact target server-side validation

These remain VERIFICATION REQUIRED, not CLOSED.

Do not rewrite them as new defects merely because runtime testing has not yet happened.

---

# 6. Authoritative repair sequence

The repair is intentionally divided into a few large, dependency-safe stages.

## STAGE 1 — Authentication hardening
Fix F-01 and F-02 together.

Why together:
Both modify the same auth-state lifecycle. Splitting them risks inconsistent state semantics.

Files to inspect:
- src/auth/AuthProvider.tsx
- src/auth/context.ts
- auth claim helpers
- admin guards
- Phase 04 docs
- package.json
- existing test infrastructure

Exit condition:
- both defects corrected;
- initialization and manual refresh share safe semantics;
- stale async results cannot overwrite newer state;
- no auth architecture drift;
- Phase 04 test harness updated/created.

---

## STAGE 2 — Project media promotion hardening
Fix F-03.

Why isolated:
This is a storage/media lifecycle change and must not be mixed with auth or public-page logic.

Files:
- src/features/cms/projects.ts
- media/storage helpers
- storage.rules
- firebase.json
- functions/* only if necessary
- Phase 08/14 test scripts and docs

Exit condition:
- no browser-side full-object promotion remains on the corrected path;
- staging/rollback invariants remain intact;
- metadata is preserved;
- rules remain authoritative;
- implementation uses only supported Firebase APIs;
- static verification is updated.

---

## STAGE 3 — Phase 02 verification-surface cleanup
Fix F-04.

Why isolated:
Temporary design-system verification UI only.

Files:
- src/design-system/DesignSystemPreview.tsx
- relevant Phase 02 docs/test harness if needed

Exit condition:
- verification sections have correct hierarchy;
- production tokens/components unchanged;
- no downstream behavior altered.

---

## STAGE 4 — Test/evidence preparation
Handle F-07 and reconcile F-06.

Tasks:
- add/repair only contract-backed test harnesses;
- ensure Phase 04 has dedicated static verification;
- ensure Phase 05 contract checks are sufficient;
- decide whether Phase 02/03/06 need dedicated harnesses based on AGENTS gate requirements;
- clarify Phase 15 historical-vs-current evidence semantics;
- do not fabricate historical reports.

Exit condition:
- every planned local test has a clear contract and PASS criterion;
- no test exists solely to satisfy a filename expectation;
- historical evidence gaps are explicit.

---

## STAGE 5 — CP-09 owner contract decision
Handle F-05.

This stage must NOT silently choose A or B.

Exit condition:
- Phase 07 media contract is explicit;
- tracker and this file record the decision;
- if B is chosen, a separate scoped implementation stage is created before runtime testing;
- if A is chosen, the contract explicitly states the reference-only boundary.

---

## STAGE 6 — Final GitHub pre-testing audit
No code changes unless the audit finds a new confirmed defect.

Verify:
- all F-01..F-07 dispositions;
- no accidental dependency churn;
- no unrelated source changes;
- repair documents are synchronized;
- AGENTS.md remains authoritative;
- phase ledger remains owner-controlled;
- no Phase is marked CLOSED merely because repository repair finished.

Exit condition:
GitHub is ready for local verification.

---

# 7. Strict work rules

These rules apply to EVERY stage.

1. GitHub is the source of truth.
2. Work only on the stage explicitly requested by the current stage message.
3. Before editing, inspect the current repository state and the exact target files.
4. Do not assume historical reports are accurate when current source contradicts them.
5. Do not perform broad refactors.
6. Do not change dependencies unless the stage explicitly proves a dependency is required.
7. Do not delete or weaken tests to obtain PASS.
8. Do not weaken Firebase Auth, Firestore, Storage or App Check boundaries.
9. Never move authorization trust into React/client state.
10. Never introduce localStorage/sessionStorage as an authorization source.
11. Preserve existing public/admin route contracts unless the finding explicitly requires a route change.
12. Preserve EN/AR behavior and RTL semantics.
13. Preserve existing data schemas unless the stage explicitly requires a schema correction.
14. Preserve rollback and cleanup behavior for media operations.
15. Do not modify unrelated files.
16. Do not mark a finding FIXED before re-reading the resulting implementation.
17. After each correction, inspect callers and dependent contracts for contradictions.
18. If the intended correction is ambiguous, STOP and record the ambiguity instead of guessing.
19. Do not run local VS Code/emulator/browser tests as a substitute for GitHub static correction unless the current stage explicitly requires repository-side test harness work.
20. Do not close a Phase unless AGENTS.md closure requirements and owner acceptance are satisfied.
21. A repaired finding and a verified finding are different states.
22. Repository repair completion and Phase closure are different states.
23. Historical evidence must never be fabricated.
24. Every stage must end with a concise work report.
25. Every completed stage must produce the exact next-stage copy/paste message.

---

# 8. Stage prompt protocol

The following format is the control protocol between the owner and the GitHub repair agent.

## Stage command syntax

Each command begins with:

[PORTFOLIO-REPAIR]
STAGE=<number>
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
VERIFY_AFTER_EDIT=true
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

The agent must then perform ONLY the requested stage.

At the end it must return:
- RESULT
- FILES_CHANGED
- FINDINGS_RECHECKED
- VERIFICATION
- RISKS/NOTES
- PLAN_UPDATE
- NEXT_STAGE_MESSAGE

The agent must not automatically execute NEXT_STAGE_MESSAGE.

---

# 9. Ready-to-send stage messages

## STAGE 1 — Authentication hardening

Copy/paste exactly:

[PORTFOLIO-REPAIR]
STAGE=1
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
VERIFY_AFTER_EDIT=true
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

Enter the GitHub repository https://github.com/Abdeldjalildev/abdeldjalil-portfolio and perform ONLY STAGE 1 of the authoritative correction plan in docs/repair-master-plan-post-audit-2026-09-27.md.

Objective:
Fix F-01 and F-02 together:
- F-01: AuthProvider.refetch() claim-read failure handling.
- F-02: stale async auth-state result race.

Before editing, inspect:
- AGENTS.md
- docs/repair-master-plan-post-audit-2026-09-27.md
- src/auth/AuthProvider.tsx
- src/auth/context.ts
- all claim-loading/auth guard helpers actually used by AuthProvider
- relevant admin guards/routes
- package.json
- existing Phase 04 verification infrastructure
- current Phase 04 documentation if present

Rules:
1. Do not perform unrelated refactors.
2. Do not change Firestore/Storage authorization boundaries.
3. Do not introduce client-side role persistence.
4. Do not use localStorage/sessionStorage for authorization.
5. Preserve deny-by-default behavior.
6. Preserve the existing Firebase Auth session model.
7. The stale-result protection must be narrow and deterministic.
8. Do not weaken or delete existing tests.
9. Add/update Phase 04 static verification only where it directly proves the corrected contract.
10. After editing, re-read all affected code and callers.
11. Re-check that initialization, manual refresh, sign-out, and user-switch transitions cannot contradict each other.
12. Update docs/repair-master-plan-post-audit-2026-09-27.md by marking F-01 and F-02 FIXED only if the implementation has actually been re-verified.
13. Do not mark Phase 04 CLOSED.
14. Commit only the intended Stage 1 changes.

Return a work report containing:
- exact files changed;
- exact corrections;
- evidence that F-01 and F-02 were rechecked;
- any remaining concern;
- the updated plan status;
- the exact copy/paste message for STAGE 2.

Do not execute STAGE 2 automatically.

---

## STAGE 2 — Project media promotion hardening

Copy/paste exactly:

[PORTFOLIO-REPAIR]
STAGE=2
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
VERIFY_AFTER_EDIT=true
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

Enter the GitHub repository https://github.com/Abdeldjalildev/abdeldjalil-portfolio and perform ONLY STAGE 2 of the authoritative correction plan in docs/repair-master-plan-post-audit-2026-09-27.md.

Objective:
Fix F-03 / CP-11: project-media promotion currently buffers full objects.

Before editing, inspect:
- AGENTS.md
- docs/repair-master-plan-post-audit-2026-09-27.md
- src/features/cms/projects.ts
- all media/storage helpers called by that module
- storage.rules
- firebase.json
- functions/* if present and relevant
- Phase 08 and Phase 14 test scripts
- current Phase 08/14 documentation

Technical constraint:
Do not invent a Firebase Web SDK object-copy API. Use only supported APIs or a trusted server-side mechanism actually supported by the repository architecture.

Rules:
1. Preserve staging.
2. Preserve validation.
3. Preserve gallery cardinality.
4. Preserve rollback/cleanup.
5. Preserve metadata/content type.
6. Preserve Storage authorization.
7. Do not expose trusted server credentials to the browser.
8. Do not add a dependency unless proven necessary.
9. Do not modify unrelated public/admin behavior.
10. Do not weaken existing tests or rules.
11. After editing, inspect every caller and error path.
12. Add/update static verification that proves the old unsafe promotion pattern is not reintroduced.
13. Mark F-03 FIXED only after rechecking the complete corrected path.
14. Do not mark Phase 08 or Phase 14 CLOSED.
15. Commit only intended Stage 2 changes.

Return the exact work report and the exact copy/paste message for STAGE 3. Do not execute Stage 3 automatically.

---

## STAGE 3 — Phase 02 verification surface

Copy/paste exactly:

[PORTFOLIO-REPAIR]
STAGE=3
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
VERIFY_AFTER_EDIT=true
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

Enter the GitHub repository https://github.com/Abdeldjalildev/abdeldjalil-portfolio and perform ONLY STAGE 3 of the authoritative correction plan in docs/repair-master-plan-post-audit-2026-09-27.md.

Objective:
Fix F-04 / P02-02 only.

Review:
- AGENTS.md Phase 02
- docs/repair-master-plan-post-audit-2026-09-27.md
- src/design-system/DesignSystemPreview.tsx
- relevant Phase 02 design-system files

Correction:
Move the "Surfaces, depth and glass" verification surface out of the "Colour tokens" section into its own semantically correct top-level verification section.

Rules:
1. This is a verification-page organization fix.
2. Do not change production design tokens.
3. Do not redesign components.
4. Do not change application behavior.
5. Do not introduce dependencies.
6. Re-read the complete JSX structure after editing.
7. Confirm no unrelated layout logic was changed.
8. Update F-04 in docs/repair-master-plan-post-audit-2026-09-27.md only after re-verification.
9. Do not close Phase 02.

Return the work report and the exact copy/paste message for STAGE 4. Do not execute Stage 4 automatically.

---

## STAGE 4 — Test/evidence preparation

Copy/paste exactly:

[PORTFOLIO-REPAIR]
STAGE=4
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
VERIFY_AFTER_EDIT=true
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

Enter the GitHub repository https://github.com/Abdeldjalildev/abdeldjalil-portfolio and perform ONLY STAGE 4 of the authoritative correction plan in docs/repair-master-plan-post-audit-2026-09-27.md.

Objective:
Prepare the repository's verification surface without fabricating historical evidence.

Review:
- AGENTS.md
- docs/repair-master-plan-post-audit-2026-09-27.md
- package.json
- all scripts/test-phase*.mjs
- Phase 02–06 contracts and available reports
- firestore.rules
- storage.rules
- firebase.json
- firestore.indexes.json

Tasks:
1. Ensure Phase 04 has a dedicated useful static harness for F-01/F-02.
2. Inspect whether Phase 05 needs additional machine-checkable contract coverage.
3. Inspect Phase 02, Phase 03 and Phase 06 and add dedicated harnesses only when the AGENTS gate contract makes them materially useful.
4. Do not create synthetic tests merely to make Phase 15 green.
5. Do not fabricate docs/phase-01-report.md through docs/phase-06-report.md.
6. Reconcile Phase 15 so historical evidence gaps remain explicit.
7. Keep current verification evidence distinct from historical evidence.
8. Do not delete or weaken existing tests.
9. Update docs/repair-master-plan-post-audit-2026-09-27.md with exact changes and remaining gaps.
10. Do not close any Phase.

Return:
- exact files changed;
- why each test/harness was needed;
- what each harness proves;
- what remains runtime-only;
- evidence status;
- exact copy/paste message for STAGE 5.

Do not execute Stage 5 automatically.

---

## STAGE 5 — CP-09 owner contract decision

This stage must only be sent after the owner has chosen A or B.

### If A — reference-only media contract

[PORTFOLIO-REPAIR]
STAGE=5
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
DECISION=CP-09-A
VERIFY_AFTER_EDIT=true
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

Enter the GitHub repository https://github.com/Abdeldjalildev/abdeldjalil-portfolio.

Record CP-09 as an explicit Phase 07 contract decision:
Profile/services/skills media fields are references only; first-class upload/replace/delete/staging lifecycle is outside the Phase 07 CMS contract unless a future phase explicitly adds it.

Review the existing Phase 07 contract and implementation first. Make the smallest documentation-only clarification necessary.

Do not add speculative media code.
Do not change Storage rules unless a proven contradiction exists.
Do not close Phase 07.

Update docs/repair-master-plan-post-audit-2026-09-27.md and the appropriate repair tracker with the decision and evidence.

Return the work report and the next-stage message.

### If B — full media lifecycle required

Use this command only if the owner explicitly chooses B:

[PORTFOLIO-REPAIR]
STAGE=5
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
DECISION=CP-09-B
VERIFY_AFTER_EDIT=true
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

Enter the GitHub repository https://github.com/Abdeldjalildev/abdeldjalil-portfolio.

CP-09 is confirmed as a real Phase 07 requirement: Profile/Services/Skills media require a first-class CMS media lifecycle.

First inspect AGENTS.md, Phase 07 contract, current CMS components, media helpers, storage.rules and existing tests.

Do not implement until the exact contract boundary is documented in the repair plan.
Then implement the smallest complete lifecycle consistent with the existing Project media architecture.

Preserve:
- authorization;
- tenant/data boundaries if any;
- cleanup;
- rollback;
- metadata;
- EN/AR behavior;
- existing public references.

Do not copy the Project implementation blindly. Reconcile the different data models first.

Update docs/repair-master-plan-post-audit-2026-09-27.md and relevant Phase 07 evidence.

Return the work report and next-stage message.

---

## STAGE 6 — Final GitHub pre-testing audit

Copy/paste only after Stages 1–5 are complete:

[PORTFOLIO-REPAIR]
STAGE=6
MODE=GITHUB_ONLY
AUTHORITY=POST_REPAIR_MASTER_PLAN
VERIFY_AFTER_EDIT=false
UPDATE_PLAN=true
NO_PHASE_CLOSURE=true

Enter the GitHub repository https://github.com/Abdeldjalildev/abdeldjalil-portfolio and perform the FINAL pre-testing audit against docs/repair-master-plan-post-audit-2026-09-27.md and AGENTS.md.

Do not modify source code unless a new confirmed defect is discovered.

Verify:
- F-01
- F-02
- F-03
- F-04
- F-05
- F-06
- F-07
- all previously repaired CP-01..CP-14
- no unrelated dependency/source changes
- repair documentation consistency
- AGENTS.md integrity
- phase ledger integrity
- test harness consistency
- distinction between FIXED, VERIFIED, EVIDENCE GAP and CLOSED

Search for new regressions caused by Stages 1–5.

If a new confirmed defect exists:
- document it first;
- do not silently fix it;
- classify whether it blocks local testing;
- add it to docs/repair-master-plan-post-audit-2026-09-27.md.

If no new blocker exists:
explicitly state that GitHub-side correction work is complete enough to hand off to local VS Code testing.

Do not close any Phase.

Return a final GitHub readiness report and a clear handoff message for the local VS Code testing stage.

---

# 10. Definition of "GitHub correction complete"

GitHub correction is complete only when:
- F-01 through F-04 are either FIXED and rechecked or explicitly superseded by a documented contract;
- CP-09 has an explicit owner decision;
- F-06 historical evidence gap is documented without fabrication;
- F-07 verification surface is sufficient for the next testing stage;
- the final audit finds no new GitHub-side blocker;
- no Phase is falsely marked CLOSED.

At that point the project moves to:

LOCAL VERIFICATION / VS CODE

The local stage will then test:
1. install/dependency integrity;
2. lint/typecheck/build;
3. Firebase Emulator;
4. Firestore rules;
5. Storage rules;
6. Auth flows;
7. Functions where applicable;
8. browser/runtime behavior;
9. EN/AR/RTL;
10. accessibility/performance;
11. production build/preview;
12. deployed Firebase/Hosting behavior where required.

Only those runtime results can convert the repository-level "VERIFICATION REQUIRED" findings into verified evidence.

---

# 11. Important state distinction

The following are deliberately different:

REPAIRED
= source code was corrected.

STATIC-VERIFIED
= repository-side inspection/harness confirms the intended static contract.

RUNTIME-VERIFIED
= local/emulator/browser/deployed behavior has been observed and recorded.

EVIDENCE-COMPLETE
= the required evidence artifact exists and is attributable to the current state.

PHASE-CLOSED
= all AGENTS.md gates and owner acceptance requirements are satisfied.

Never use one state as a substitute for another.


---

# 12. Stage 1 execution record — 2026-09-27

## F-01 — Manual auth claim refresh failure handling
Status: FIXED — GITHUB CORRECTION COMPLETE; RUNTIME VERIFICATION REMAINS REQUIRED

Correction:
- AuthProvider.refetch() now treats forced claim loading as an authorization-state transition.
- It enters deny-by-default loading state before the forced token read.
- Claim-read failures are caught and resolve to unauthenticated state for the current request instead of propagating an unhandled rejection or retaining stale admin claims.
- A successful refresh is published only after the request generation and current Firebase user UID are revalidated.

## F-02 — Async auth stale-result race
Status: FIXED — GITHUB CORRECTION COMPLETE; RUNTIME VERIFICATION REMAINS REQUIRED

Correction:
- AuthProvider now uses a monotonic request generation ref shared by auth-state claim loading and manual refetch.
- Each async auth operation captures its generation and ignores results from older generations.
- Before publishing authenticated claims, the implementation also rechecks auth.currentUser and the expected UID.
- Provider cleanup invalidates in-flight reads.
- No authorization state is persisted in localStorage/sessionStorage.

## Stage 1 repository changes

Changed files:
- src/auth/AuthProvider.tsx — hardened claim refresh failure handling and stale-result protection.
- scripts/test-phase04.mjs — added a contract-backed static Phase 04 auth harness covering failure, generation guards, current-user validation, cleanup invalidation and client-side authorization persistence boundaries.
- package.json — registered test:phase04 for the new harness; no dependency change.

Not changed:
- AGENTS.md remains authoritative and unchanged.
- src/auth/context.ts was inspected and required no modification.
- AdminAccessBoundary and admin routes were inspected and required no modification.
- Firestore/Storage authorization boundaries were not changed.

## Stage 1 verification boundary

GitHub-side verification completed by re-reading the modified AuthProvider and dependent auth/admin files and checking the new Phase 04 harness contract. The harness has been added but was NOT executed in this GitHub-only stage, so runtime behavior, Firebase token-refresh behavior, browser lifecycle timing and emulator integration remain unverified until the local/runtime verification stage.

Phase 04 is NOT CLOSED. Stage 1 completion is repository correction only and does not satisfy the six-gate Phase 04 closure requirements or owner acceptance.

## Stage 1 result

- F-01: FIXED at repository level; runtime verification required.
- F-02: FIXED at repository level; runtime verification required.
- Stage 1: COMPLETE at GitHub correction level.
- Phase 04: NOT CLOSED.
- Stage 2: NOT STARTED.


---

# Stage 2 execution record — 2026-09-27

## F-03 / CP-11 — Full-object project-media promotion

Status: FIXED — GITHUB CORRECTION COMPLETE; RUNTIME VERIFICATION REQUIRED

Correction:
- Removed the browser-side `getBytes()` + `uploadBytes()` promotion path from `src/features/cms/projects.ts`.
- Project media promotion/unpublication now delegates object movement to the trusted `moveProjectMedia` callable.
- The callable uses the Firebase Admin Storage bucket server-side and performs object copy/delete without buffering the object in the browser.
- The callable requires the Firebase Auth `admin == true` claim and validates that each move is a same-project, same-media-kind transition between the project draft namespace and its corresponding public namespace.
- Source and target filenames must match, paths are constrained to the canonical project-media shapes, and batch size is capped at 12.
- Completed moves are tracked before source deletion so a source-delete failure can still be rolled back.
- The callable retains rollback for earlier completed moves if a later move fails.
- Existing client-side staging, file-type/size validation, gallery cardinality checks, Firestore transaction/concurrency handling, public-path selection, cleanup, and publish/unpublish lifecycle behavior remain in place.
- Firebase Admin Storage copy preserves the stored object metadata/content type; no client-side byte buffering is introduced.

Changed files:
- `src/features/cms/projects.ts` — replaced full-object promotion with the trusted callable.
- `functions/index.js` — added the authenticated server-side project media move callable with path validation and rollback.
- `scripts/test-phase08.mjs` — strengthened the Phase 08 static contract to reject browser-side full-object promotion and require the trusted callable/security/rollback contract.
- `docs/repair-master-plan-post-audit-2026-09-27.md` — recorded the Stage 2 correction and verification boundary.

Verification boundary:
- Re-read the complete corrected project-media path and the new callable implementation.
- Confirmed the project promotion path no longer imports or calls `getBytes()` or `copyStorageObject()`.
- Confirmed the callable requires the admin claim, uses the Admin Storage bucket, validates path shape/project/kind/filename, tracks moves before source deletion, and retains rollback.
- Confirmed existing Phase 08 rollback, staging, gallery cardinality, cleanup and optimistic-concurrency contracts remain present.
- Confirmed no dependency change was required.
- No local build, emulator, browser, Functions deployment, or production Storage runtime test was executed in this GitHub-only stage.

Phase state:
- F-03 is FIXED at repository level.
- F-03 remains VERIFICATION REQUIRED for runtime behavior and deployed Functions/Storage integration.
- Phase 08 and Phase 14 are NOT CLOSED.
- Stage 3 has NOT STARTED.


---

# Stage 3 execution record — 2026-09-27

## F-04 / P02-02 — Phase 02 DesignSystemPreview structural verification

Status: FIXED — GITHUB CORRECTION COMPLETE

Correction:
- `src/design-system/DesignSystemPreview.tsx` now renders the `Colour tokens` verification section as a complete independent section.
- `Surfaces, depth and glass` is now a separate sibling `SectionFrame`, separated by its own divider.
- No production design tokens, reusable components, Tailwind configuration, routing, localization, or runtime behavior were changed.

Changed files:
- `src/design-system/DesignSystemPreview.tsx` — corrected only the verification-surface structural hierarchy and formatting.
- `docs/repair-master-plan-post-audit-2026-09-27.md` — recorded Stage 3 completion and verification boundary.

Verification:
- Re-read the modified DesignSystemPreview source from GitHub after the edit.
- Confirmed the colour swatches are fully contained by the `Colour tokens` SectionFrame before its closing tag.
- Confirmed `Surfaces, depth and glass` begins in a separate sibling SectionFrame after a Divider.
- Confirmed the Stage 3 diff contains no other source/config/dependency changes.
- No suitable dedicated Phase 02 harness was identified that needed modification for this isolated structural cleanup; no synthetic test was added.
- No local build, lint, browser, or visual runtime test was executed in this GitHub-only stage.

Phase state:
- F-04 is FIXED at repository level.
- Phase 02 is NOT CLOSED.
- Stage 4 has NOT STARTED.


# Stage 4 execution record — 2026-09-27

## F-07 — Phase 02/03/05/06 verification-surface preparation

Status: **RESOLVED AT REPOSITORY-CONTRACT LEVEL — NO ADDITIONAL DEDICATED HARNESS REQUIRED FOR PHASE 02/03/06; EXISTING PHASE 05 COVERAGE IS SUFFICIENT FOR CURRENT CONTRACTS**

Inspection result:
- Phase 04 has the dedicated `scripts/test-phase04.mjs` harness created in Stage 1. It was not recreated or replaced.
- Phase 05 already has repository-backed contract coverage through `scripts/test-schema.ts` and `scripts/test-rules.mjs`, plus the existing Firestore index/storage configuration. The current contract surface is machine-checkable at the repository/emulator-rule level without inventing another duplicate harness.
- Phase 02's AGENTS verification requirements are predominantly visual/runtime (responsive layouts, keyboard focus, contrast, reduced motion, Arabic shaping/direction). A static harness would not provide equivalent evidence, so none was added.
- Phase 03's verification requirements include route resolution, refresh/deep navigation, unknown routes and mobile navigation behavior. These require runtime/router evidence; no synthetic static harness was added.
- Phase 06's verification requirements include routes, EN/AR, true RTL, keyboard navigation and the mobile drawer. These require runtime/browser evidence; no synthetic static harness was added.
- `package.json` contains `test:phase04`, `test:schema`, and `test:rules`; there are no Phase 01/02/03/05/06 dedicated scripts, consistent with the above disposition.

No test was weakened, removed, or replaced, and no dependency was added.

## F-06 — Historical Phase 01–06 evidence

Status: **OPEN — MISSING HISTORICAL EVIDENCE**

Repository tree inspection confirms that the only dedicated early-phase test script currently present is `scripts/test-phase04.mjs`. No historical files named `docs/phase-01-report.md` through `docs/phase-06-report.md` are present in the current repository tree.

This current repository inspection is not being represented as historical phase evidence. No historical reports were fabricated or backfilled.

## New finding recorded — F-08

A pre-existing structural/source defect was discovered while re-reading the Phase 02 preview during Stage 4: `src/design-system/DesignSystemPreview.tsx` contains a duplicated `colorSwatches.map(...)` fragment and a closing `SectionFrame` after the independent `Surfaces, depth and glass` section, without a corresponding opening colour-token section at that location. Comparison against the Stage 2 baseline confirms this fragment pre-dates Stage 3 and is therefore not caused by Stage 3.

Status: **OPEN — OUT OF STAGE 4 SCOPE; NOT FIXED**

This finding is recorded only. It must not be interpreted as fixed by the F-04 correction.

## Stage 4 verification boundary

Repository-side verification completed:
- inspected `AGENTS.md`, the authoritative repair master plan, repair tracker, deep-audit repair plan, 9-step roadmap, `package.json`, Phase 04 harness, schema/rules harnesses, Phase 02/03/06 implementation surfaces, and repository tree entries for Phase 01–06 reports/harnesses;
- re-read the relevant Phase 02 preview source and compared it with the pre-Stage-3 baseline to distinguish the new F-08 observation from Stage 3 work;
- confirmed no Phase 01–06 historical report was created;
- confirmed no dedicated Phase 02/03/06 harness was added because the relevant AGENTS requirements are runtime/visual/browser evidence rather than useful static contracts;
- confirmed Phase 05 already has dedicated schema/rules machine-checkable coverage.

Not proven by this GitHub-only stage:
- execution/pass of any harness;
- local TypeScript/lint/build results;
- Firebase Emulator execution;
- browser/runtime behavior;
- responsive, accessibility, visual contrast, reduced-motion, EN/AR/RTL or navigation behavior;
- formal phase closure.

Phase status remains owner-controlled and all phases remain NOT CLOSED.
