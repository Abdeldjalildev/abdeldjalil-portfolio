# Phase 15 — Final Production Verification & Release Readiness

## Status

**Implementation complete; RELEASE-READY is not yet declared.**

The repository has now received the Phase 15 release-readiness work and a dedicated static release
verification harness. The phase intentionally does **not** deploy the application and does **not**
change the AGENTS.md phase ledger. Final release readiness still requires local/runtime evidence and
explicit owner acceptance.

## Objective

Prove production readiness across the complete application without treating passing static checks
as the only proof. Deployment remains a separate explicit action.

## Starting state

- Phases 01–14 were implemented in the repository.
- Phase 14 had already completed a deep static hardening audit, but local/runtime verification was
  still pending.
- AGENTS.md still required owner-controlled closure and listed all phases as NOT STARTED.
- Firebase Hosting was not configured in firebase.json even though the application uses Vite output
  and React Router deep links.
- README.md still described the repository as Phase 01 foundation-only, which was materially stale.

## Phase 15 implementation

### Gate 1 — Release inventory

**PASS — repository inspection.**

Verified:

- Public routes: Home, About, Services, Projects, Project detail, Reviews, Contact.
- Admin routes: Dashboard, Projects, Services, Skills, Reviews, Profile, Contact, Analytics, Settings.
- Admin authorization boundary remains centralized through AdminAccessBoundary.
- Firebase configuration files are present for Firestore, Storage, Functions and Hosting.
- Production environment contract is documented in .env.example.
- Security-sensitive service-account patterns remain gitignored.
- Phase reports 01–15 are present after this implementation.
- README now describes the actual production-oriented architecture and verification process.

### Gate 2 — Final architecture/security review

**PASS — static review.**

Verified:

- Firebase client configuration is treated as public configuration, not authorization.
- Firestore admin authorization uses the trusted admin custom claim.
- Storage writes remain admin-only and hardened by path/type/size rules.
- Analytics is server-owned and directly writable analytics collections remain closed to clients.
- The analytics callable requires Firebase App Check.
- The public client never receives Admin SDK credentials.
- Development-only design-system routing remains gated by Vite DEV mode.
- Deployment is explicitly separated from verification and release acceptance.

### Gate 3 — Full verification contract

**IMPLEMENTED; execution BLOCKED pending local environment.**

Added the missing release verification wiring:

- `npm run functions:check`
- `npm run test:phase15`

The release command inventory now covers:

1. `npm ci`
2. `npm run lint`
3. `npm run build`
4. `npm run functions:check`
5. `npm run test:schema`
6. `npm run test:rules`
7. `npm run test:phase07`
8. `npm run test:phase08`
9. `npm run test:phase09`
10. `npm run test:phase10`
11. `npm run test:phase11`
12. `npm run test:phase12`
13. `npm run test:phase13`
14. `npm run test:phase14`
15. `npm run test:phase15`

The Phase 15 harness statically verifies the release configuration, security boundaries,
environment contract, production metadata and phase-report/owner-closure requirements.

**Important:** none of these commands is claimed as executed by this Phase 15 implementation
because the user's local project environment is not available through the GitHub repository
interface.

### Gate 4 — Production simulation

**IMPLEMENTED; execution BLOCKED pending local/Firebase environment.**

The release configuration now includes Firebase Hosting with:

- `dist/` as the deployed Vite output;
- standard ignored files;
- an SPA rewrite from unmatched paths to `/index.html`.

This is required for React Router deep links on Firebase Hosting.

Production simulation still requires, on the owner's machine/Firebase project:

- populate production Vite environment variables;
- verify the production App Check reCAPTCHA Enterprise site key;
- verify App Check enforcement for the deployed Web App/Firebase services;
- build the application;
- preview/test the production build;
- test public and admin deep links after a fresh load;
- verify external links and assets;
- verify Firestore/Storage rules against the deployed project;
- verify the analytics callable with valid App Check;
- verify failure behavior for missing/denied backend resources;
- record the rollback target/version before deployment.

### Gate 5 — Final hardening

**PASS for repository-level release configuration; runtime portion BLOCKED.**

Concrete repository hardening completed:

- Firebase Hosting SPA configuration added.
- README production instructions were corrected.
- Functions syntax verification was added.
- Phase 15 static release harness was added.
- Production App Check requirement is explicitly documented.
- Deployment remains an explicit action rather than an automatic side effect.
- No dependency was added.
- No security test was weakened or deleted.
- No AGENTS phase status was silently changed.
- No broad refactor or architecture rewrite was introduced.

No unresolved repository-level blocking defect was found during the final static audit.

Runtime-only risks remain unverified until the local/Firebase release checklist is executed.

### Gate 6 — Release decision

**BLOCKED — owner acceptance required.**

The repository is **release-prepared**, but it is not marked RELEASE-READY yet.

Release readiness requires:

1. local automated verification to pass;
2. Firebase Emulator/rules evidence to pass;
3. browser critical journeys to pass in EN/LTR and AR/RTL;
4. admin authentication/authorization evidence;
5. production build/deep-link evidence;
6. production App Check enforcement evidence;
7. owner review and explicit acceptance.

Deployment itself is a separate explicit action.

## Files changed

- `firebase.json`
  - Added Firebase Hosting configuration for the Vite `dist/` output and SPA fallback.
- `package.json`
  - Added `functions:check` and `test:phase15`.
- `README.md`
  - Replaced stale Phase 01 status with the current Phase 15 release-readiness state and exact
    verification/deployment runbook.
- `scripts/test-phase15.mjs`
  - Added static release-readiness harness.
- `docs/phase-15-report.md`
  - Added the required Phase 15 evidence report.

## Dependency changes

**None.**

## Security evidence

- Firestore authorization remains based on the trusted `admin` claim.
- Storage writes remain admin-only with hardened content/path/size validation.
- Analytics callable requires App Check.
- Analytics client writes are mediated by the callable rather than direct Firestore writes.
- No service-account credentials are introduced.
- Production App Check enforcement remains a release acceptance check, not an assumption.

## Known issues / remaining evidence

1. Local `npm ci`, lint, build and all test commands are not yet executed in the available
   environment.
2. Browser accessibility/responsive journeys are not yet executed in this environment.
3. Firebase Emulator rules evidence is not yet executed in this environment.
4. Production Firebase App Check enforcement cannot be proven from repository files alone.
5. A production deployment has intentionally not been performed.
6. The sitemap currently targets `https://abdeldjalil-portfolio.web.app`. If a custom domain is
   chosen later, the sitemap and canonical/OG production origin must be updated as part of release
   configuration before deployment.
7. Firebase Hosting rollback remains an operational action after a real deployment; no release has
   been deployed by Phase 15.

## Out of scope

- Production deployment.
- Custom domain purchase/configuration.
- Creating or modifying Firebase Console resources that require owner credentials.
- Changing the AGENTS.md phase ledger or declaring a phase CLOSED.
- Feature additions unrelated to release readiness.
- MenuFlow.

## Recommended next action

Run the exact Phase 15 local verification checklist from README.md and this report. If all
automated and browser/Firebase checks pass, provide the evidence for owner review. Only after
explicit owner acceptance should the project be considered RELEASE-READY; deployment is then a
separate explicit operation.

## Isolation statement

**I did not advance to the next phase.**

Phase 15 is the final phase in the master plan. No deployment or post-release phase was started.
