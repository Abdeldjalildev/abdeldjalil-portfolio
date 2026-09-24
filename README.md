# Abdeldjalil Portfolio

Personal portfolio application for Abdeldjalil — a production-oriented React application with a
private Admin CMS backed by Firebase.

Development follows `AGENTS.md`, the authoritative project plan and agent contract.

## Current status

**Phase 15 — Final production verification & release readiness: implementation complete, pending local/runtime evidence and explicit owner acceptance.**

Phases 01–14 are implemented in the repository and have phase reports. The phase ledger in
`AGENTS.md` remains unchanged by design: only the owner may mark phases CLOSED or the project
RELEASE-READY.

Deployment is intentionally a separate explicit action. Phase 15 prepares and verifies the
release configuration; it does not deploy the application.

## Production architecture

- React 19 + TypeScript (strict mode) + Vite 8
- Tailwind CSS 4
- React Router 7
- Firebase Authentication, Firestore, Storage and Cloud Functions
- Firebase Hosting configuration targets the Vite `dist/` output and supports SPA deep links
- English + Arabic with true LTR/RTL support
- Privacy-conscious aggregated analytics with App Check enforcement on the analytics callable

## Requirements

- Node.js 24+
- npm 11+
- Firebase CLI for emulator/deployment verification

## Setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill the Firebase Web App values from Firebase Console → Project settings → Your apps.

4. For production analytics protection, register the Web app with Firebase App Check using
   reCAPTCHA Enterprise and set `VITE_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY` in the
   production environment. The deployed analytics callable already requires valid App Check.

## Verification commands

Run these from the repository root before release:

```bash
npm ci
npm run lint
npm run build
npm run functions:check
npm run test:schema
npm run test:rules
npm run test:phase07
npm run test:phase08
npm run test:phase09
npm run test:phase10
npm run test:phase11
npm run test:phase12
npm run test:phase13
npm run test:phase14
npm run test:phase15
```

Then perform the critical browser/Firebase journeys documented in
`docs/phase-15-report.md`. Passing static checks is not sufficient for release acceptance.

## Deployment

Build first, then deploy only after local verification and owner acceptance:

```bash
npm run build
firebase deploy --only hosting,functions,firestore:rules,firestore:indexes,storage
```

Firebase Hosting provides SSL and supports SPA rewrites through `firebase.json`. A rollback
remains an explicit operational action after deployment.

## Security rules

- Firebase client configuration is public configuration, not an authorization boundary.
- Firestore and Storage rules are deny-by-default and enforce the documented admin/public split.
- Admin privilege comes from the trusted Firebase Auth `admin` custom claim.
- Analytics writes go through the server-owned callable and are App Check protected.
- Service-account credentials must never be committed.
- Production App Check enforcement must be verified in Firebase Console before release.

## Scope boundary

MenuFlow is explicitly out of scope unless the owner requests it.
