# Phase 13 — Analytics, Observability & Abuse Resistance

## Objective

Add useful privacy-conscious analytics, an authenticated admin analytics view, resilient analytics failure handling, server-side aggregation, bounded retention, and abuse resistance without changing the public visual direction or weakening existing security contracts.

## Starting state

Before Phase 13:
- `/admin/analytics` existed only as a placeholder route.
- No analytics write path or analytics dashboard existed.
- Firebase Analytics/Google Analytics had intentionally not been enabled.
- Existing Firestore/Storage rules were deny-by-default for unknown paths.
- Existing admin authorization was based on the Phase 04 trusted `admin` custom claim.
- No Cloud Functions codebase was registered in `firebase.json`.

## Gate 1 — Discovery & contract

PASS by repository inspection.

Confirmed:
- The project needs useful event-level signals, not uncontrolled per-click Firestore documents.
- Public analytics must not become a public Firestore write surface.
- Analytics data must avoid PII and free-form payloads.
- Aggregation must be server-owned.
- Retention must be bounded.
- Admin analytics must remain behind the existing admin authorization boundary.
- Analytics failures must never block public navigation or rendering.
- Google Analytics remains intentionally unused.

Event taxonomy:
- `page_view`
- `project_view`
- `project_live_demo_click`
- `github_click`
- `contact_click`
- `social_click`
- `service_view`
- `resume_download`

## Gate 2 — Architecture/data design

PASS by static inspection.

Architecture:
- Public client -> Firebase callable `recordAnalyticsEvent`.
- Callable validates a fixed event allowlist and bounded dimensions.
- Callable requires Firebase App Check.
- Visitor identifiers are random opaque client identifiers and are SHA-256 hashed server-side.
- Firestore aggregates are written only by the Admin SDK inside Cloud Functions.
- Daily aggregate document: `analyticsDaily/{YYYY-MM-DD}`.
- Daily visitor marker: `analyticsVisitors/{day}_{sha256(visitorId)}`.
- Public clients have no Firestore read/write access to analytics collections.
- Admins can read daily aggregates.
- 90-day retention is represented by `expiresAt` and enforced by the scheduled `pruneAnalytics` function.
- Daily path cardinality is capped at 50 distinct paths.
- Per-visitor accepted events are capped at 100 per UTC day.
- Cloud Functions are capped at 3 concurrent instances at the codebase level.

Privacy boundary:
- No name, email, phone, IP address, user-agent, auth token or free-form text is persisted.
- The stored visitor identifier is a SHA-256 digest, not the client identifier itself.

## Gate 3 — Implementation

PASS by repository inspection.

Added:
- `functions/index.js`
- `functions/package.json`
- `src/data/analytics.ts`
- `src/firebase/appCheck.ts`
- `src/features/cms/AnalyticsAdmin.tsx`
- `scripts/test-phase13.mjs`
- this report

Modified:
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `src/main.tsx`
- `src/firebase/app.ts`
- `src/routes/PublicLayout.tsx`
- `src/routes/AdminLayout.tsx`
- `src/App.tsx`
- `src/features/public/ProjectDetail.tsx`
- `src/features/public/ProjectDetails.tsx`
- `src/features/public/Contact.tsx`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/ar.ts`
- `.env.example`
- `docs/data-model.md`
- `package.json`

Dependency changes:
- No new root application runtime dependency.
- Added `firebase-functions` and `firebase-admin` to the isolated Functions package. `firebase-admin` was already present in the root development toolchain; the Functions package now declares its own runtime dependency explicitly.
- The Functions runtime is Node 20.

## Gate 4 — Verification

BLOCKED / pending local and deployed execution.

Static verification performed after implementation:
- Re-read the Phase 13 contract in AGENTS.md.
- Re-inspected the complete analytics backend, client, dashboard, routes, rules, indexes, Firebase configuration, translations and report.
- Found and fixed the following concrete issues during the audit:
  1. Analytics dashboard initially referenced a nonexistent Firestore helper; replaced it with the project's canonical Firebase app + Firestore initialization boundary.
  2. Analytics initialization could throw before its Promise catch; wrapped callable creation so Firebase configuration failures cannot block UI.
  3. Optional App Check initialization could throw; made it failure-isolated.
  4. Unique-visitor accounting initially incremented for a visitor's first event type instead of first event of the day; corrected it to first visitor marker creation.
  5. Retention field indexing was initially exempted even though the scheduled cleanup queries it; removed those exemptions.
  6. Analytics payload initially tolerated unknown fields; added a strict allowed-key check.
  7. Base64url path decoding was hardened for padding and UTF-8.
  8. Transaction reads were made explicitly ordered before writes.
  9. App Check enforcement was enabled on the callable after the abuse-resistance audit.

Static translation parity:
- EN: 252 keys
- AR: 252 keys
- Missing AR keys: 0
- Extra AR keys: 0

A Phase 13 static harness is registered:
`npm run test:phase13`

The following are NOT claimed as executed because the project computer/local Firebase environment is unavailable:
- `npm run lint`
- `npm run build`
- `npm run test:phase13`
- `npm run test:rules`
- Firebase Emulator integration tests for the new callable
- Cloud Functions deployment
- Cloud Scheduler execution
- App Check production registration/token verification
- browser/mobile analytics walkthrough
- real event-to-dashboard end-to-end verification

No GitHub Actions workflow run was available for the final Phase 13 commit, so CI execution is not claimed.

## Gate 5 — Hardening/review

PARTIAL / pending runtime deployment evidence.

Static hardening confirms:
- Analytics is server-owned rather than a client-writable Firestore surface.
- Admin analytics reads are protected by the existing trusted admin claim.
- Unknown Firestore paths remain denied by the catch-all.
- Analytics visitor markers are explicitly unreadable/writable only by server-side Admin SDK.
- Event names are allowlisted.
- Payload fields are allowlisted and bounded.
- Visitor identifiers are hashed before persistence.
- No PII fields are accepted or persisted.
- Daily path cardinality is bounded.
- Per-visitor daily event volume is bounded.
- Function instance count is capped.
- App Check is enforced for the callable.
- Public UI analytics errors are swallowed by design so telemetry outages cannot break product behavior.
- Large aggregate maps have indexing exemptions to reduce index fanout.
- The retention field remains indexed because cleanup queries depend on it.
- Analytics is excluded from Phase 14/15 work; no broad hardening refactor was introduced.

Operational prerequisites that remain for real runtime evidence:
- Register the Web App with Firebase App Check/reCAPTCHA Enterprise and place the public site key in `VITE_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY`.
- Deploy the Functions codebase.
- Deploy Firestore rules/indexes.
- Verify the scheduled cleanup function in the Firebase/Google Cloud environment.

## Gate 6 — Closure/evidence

BLOCKED.

Reason:
- Local automated/runtime evidence and deployed Firebase evidence are still required by the master contract.
- Owner acceptance has not been recorded.
- Therefore Phase 13 is implemented and statically audited, but it is NOT formally CLOSED.

## Security evidence

- `analyticsDaily`: admin read only; all client writes denied.
- `analyticsVisitors`: client reads/writes denied.
- Callable requires App Check.
- Callable rejects unsupported events, malformed visitor identifiers and unexpected fields.
- Server-side aggregation uses Admin SDK rather than client-side privileged writes.
- No service-account or Admin SDK credentials are placed in browser code.
- Analytics payload does not accept free-form text or PII fields.
- Existing Firestore catch-all deny-by-default posture remains intact.

## Known issues / limitations

1. Runtime execution has not been performed in this environment.
2. App Check production registration is an external Firebase-console prerequisite.
3. Scheduled retention cleanup requires deployment of the scheduled Functions code.
4. Analytics intentionally fails silently at the UI boundary; this is a deliberate resilience decision, not an ignored error.
5. `service_view` and `resume_download` are supported by the server taxonomy but do not yet have a public UI source in the current product surface; no fake events were generated merely to inflate metrics.

## Out of scope

- Phase 14 cross-cutting security/accessibility/performance/SEO hardening.
- Phase 15 release verification.
- Google Analytics / GA4.
- Redesign of the existing visual system.
- Unrelated public-page cleanup.
- New analytics event types outside the approved taxonomy.

## Recommended next action

Run the local verification suite and then perform the Firebase runtime/App Check deployment checks. Do not mark Phase 13 CLOSED until those results are available and the owner accepts the evidence.

**I did not advance to the next phase.**
