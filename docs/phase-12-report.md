# Phase 12 — Admin Dashboard Completion, Settings & Operations

## Objective

Make the authenticated admin experience operationally complete without implementing analytics or cross-cutting Phase 14 hardening.

## Starting state

Before Phase 12:
- /admin access was already protected by the Phase 04 admin claim boundary.
- Admin CRUD pages existed for projects, services, skills, profile, reviews and contact links.
- /admin itself was still a placeholder dashboard.
- /admin/settings was still a placeholder.
- Admin navigation was only a top header with sign-out; there was no persistent CMS navigation.
- The canonical `settings/main` schema and Firestore rules already existed, but there was no admin settings data-access/UI layer.
- The existing Profile/Services/Skills admin headings contained literal `t(...)` text rather than rendered translations; this was corrected as an operational Phase 12 repair.

## Gate 1 — Discovery & contract

PASS by repository inspection.

Confirmed:
- Existing Auth/AdminAccessBoundary remains the authorization boundary.
- Existing CMS CRUD contracts remain the source of truth.
- `settings/main` is public-readable by design and admin-writable by rules.
- Featured-project selection remains owned by Projects and its existing atomic invariant; Settings exposes the state but does not create a second featured-selection mechanism.
- Analytics remains a Phase 13 concern.

## Gate 2 — Architecture/data design

PASS by static inspection.

Admin structure:
- persistent desktop navigation
- collapsible mobile navigation
- dashboard summary/status view
- settings editor
- existing feature-specific CRUD pages

Settings:
- canonical `siteSettingsInputSchema` / `siteSettingsSchema`
- optimistic concurrency using Firestore Timestamp equality
- server timestamps on create/update
- featured project is read from the existing Projects contract

Default locale:
- CMS `defaultLocale` is now operational for first-time visitors with no stored locale preference.
- An explicit visitor locale preference remains authoritative and is never silently overwritten by a later settings fetch.

## Gate 3 — Implementation

PASS by static inspection.

Added:
- `src/features/cms/Dashboard.tsx`
- `src/features/cms/SettingsAdmin.tsx`
- `src/features/cms/settings.ts`
- `src/data/publicSettings.ts`
- `scripts/test-phase12.mjs`

Modified:
- `src/App.tsx`
- `src/routes/AdminLayout.tsx`
- `src/i18n/I18nProvider.tsx`
- `src/i18n/helpers.ts`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/ar.ts`
- `src/features/cms/ProfileAdmin.tsx`
- `src/features/cms/ServicesAdmin.tsx`
- `src/features/cms/SkillsAdmin.tsx`
- `package.json`

No new runtime dependency was added.

Dashboard operational signals include:
- project totals and published/draft split
- services
- skills
- reviews with moderation-state breakdown
- contact/social links with publication breakdown
- profile readiness
- featured-project readiness
- settings readiness
- malformed stored-document count
- pending-review attention state

## Gate 4 — Verification

BLOCKED / pending local execution.

A static verification harness is registered as `npm run test:phase12`.

The repository was re-inspected after implementation, but the following are deliberately not claimed as executed because the project computer is unavailable:
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
- browser/mobile admin walkthrough
- live Auth/Firestore runtime verification

## Gate 5 — Hardening/review

PARTIAL / pending local execution.

Static audit confirms:
- Admin routes remain behind `AdminAccessBoundary`.
- Settings writes go through schema validation and optimistic concurrency.
- Firestore settings writes remain admin-only.
- Destructive existing CRUD actions retain confirmation dialogs.
- Mobile and desktop admin navigation are separate responsive presentations.
- Navigation controls have keyboard focus styles.
- Loading/error states exist for dashboard/settings.
- Invalid stored-data counts are surfaced rather than silently hidden.
- Existing admin heading rendering defects in Profile/Services/Skills were repaired.
- No analytics implementation was introduced.
- No dependency churn was introduced.
- The default locale respects an existing user preference and only consults CMS default when no preference exists.

## Security evidence

The existing Firestore settings rule remains:
- public read
- admin-only create/update
- delete denied
- schema/invariant validation
- featuredProjectId must reference an existing published project

No authorization rule was weakened or bypassed.

Firebase Security Rules remain the authoritative access-control boundary; client-side admin navigation is not treated as security. Firestore queries must remain compatible with their security-rule constraints. citeturn0search0turn0search2

## Known issues / limitations

1. Local execution and browser walkthrough are still required before formal closure.
2. Analytics remains intentionally unimplemented until Phase 13.
3. SEO metadata consumption of site settings remains a Phase 14 concern.
4. Phase 15 remains out of scope.

## Closure

**BLOCKED pending local verification and owner acceptance.**

AGENTS.md phase status ledger remains unchanged.

**I did not advance to the next phase.**



## Step 6 integration repair

### Confirmed
- Featured-project lifecycle handling is already integrated in the project data layer: unpublishing a featured project clears the featured reference before the publication-state write.
- Deleting a featured project also clears the featured reference first.
- Settings remains a read/display surface for the existing featured-project contract and does not introduce a second selection mechanism.

### Repaired
The Phase 12 static harness contained a stale assertion that rejected any `analytics` occurrence in `AdminLayout`. Phase 13 legitimately added `/admin/analytics`, so the assertion no longer represented the current architecture.

`scripts/test-phase12.mjs` was updated to require the complete Phase 12 admin route set while explicitly allowing the legitimate later analytics route to coexist.

No dependency, security rule, authorization boundary, schema, or analytics implementation was changed.

### Verification limitation
The harness was statically re-inspected after the edit. Actual `npm run test:phase12`, build, lint and browser/admin execution remain pending the dedicated testing stage.

**I did not advance to the next phase.**
