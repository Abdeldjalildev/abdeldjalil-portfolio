# Phase 10 — Reviews, Social Proof & Contact

## Scope
Phase 10 implements the frozen Reviews and Contact/ContactLinks contracts. It does not implement Home/featured presentation, Analytics, or Phase 14 cross-cutting hardening.

## Gate 1 — Discovery & contract
- Re-read canonical Review and ContactLink types, schemas, paths, indexes and current Firestore rules.
- Review workflow is pending -> approved -> published, with published -> approved for unpublishing.
- Public visibility is limited to published reviews and published contact links.
- All client writes remain admin-only; no anonymous review-write endpoint was introduced.
- Public aggregate rating is calculated only from published reviews.

## Gate 2 — Architecture/data design
- Review data access: src/features/cms/reviews.ts.
- Contact-link data access: src/features/cms/contactLinks.ts.
- Public presentation: Reviews.tsx and Contact.tsx.
- Admin workflows: ReviewsAdmin.tsx and ContactLinksAdmin.tsx.
- Existing composite indexes are reused: reviews status+order and contactLinks published+order.
- Contact targets are validated by type in the application and Firestore rules.
- Review status transitions and publishedAt semantics are enforced by Firestore rules.

## Gate 3 — Implementation
- Added public Reviews page with localized published reviews, 1–5 rating display and aggregate average/count.
- Added public Contact page with dynamically managed published contact/social links.
- Added admin review creation/editing/deletion and moderation controls.
- Added admin contact/social CRUD and publication control.
- Added type-aware contact-target validation.
- Added server-authoritative review transition validation and contact-target validation in Firestore rules.
- Extended the existing rules test suite with denied transition and unsafe-target cases.
- Added Phase 10 static verification harness.

## Gate 4 — Verification
GitHub/static verification was performed after implementation.

Not claimed because local execution is unavailable:
- npm run lint
- npm run build
- npm run test:schema
- npm run test:rules
- npm run test:phase07
- npm run test:phase08
- npm run test:phase09
- npm run test:phase10
- browser/responsive/accessibility testing
- real Firestore/Storage propagation

Public queries intentionally match their Firestore publication predicates because Firestore rules are not filters; a query must itself satisfy the rule constraints. citeturn1search0turn1search1

## Gate 5 — Hardening/review
- Anonymous writes are not exposed.
- Ratings remain bounded 1–5.
- Review publication timestamps are server-controlled.
- Invalid review status transitions are denied.
- Contact web targets are HTTPS-only; email/phone/WhatsApp use constrained target forms.
- External contact links opened in a new tab use noopener.
- No new runtime dependency was added.

## Gate 6 — Closure/evidence
**BLOCKED / pending local runtime verification and owner acceptance.**

AGENTS.md remains unchanged; the phase is not marked CLOSED.

**I did not advance to the next phase.**

## Deep repair pass — Phase 10

### P10-R1 — Exact optimistic-concurrency comparison — FIXED

The Phase 10 data layer now uses exact Firestore Timestamp.isEqual() comparisons for the loaded updatedAt value in:
- saveReview()
- changeReviewStatus()
- saveContactLink()

The previous seconds-only comparison contract is absent from the current implementation. The Phase 10 static harness also contains explicit regression assertions that require isEqual(expectedUpdatedAt) and reject updatedAt.seconds checks.

Relevant repair commits already present in the repository:
- e2bffeaf83c2eb2cb041645d8996c0d839ca588d
- 381b7df2a98a947c51e5f0818b297612ce769779
- ce2bf0d477f6fbc331c1fdd315ec45fe907e0490
- 78b5427ba3ec9c2bac72810246e181ce84bb32fd

No delete-concurrency semantics were changed during this repair pass. The existing direct-delete behavior remains a documented hardening consideration rather than an unapproved contract change.

### Repair verification boundary

Fresh GitHub re-inspection confirmed:
- review save/status operations use exact Timestamp equality;
- contact-link save uses exact Timestamp equality;
- no seconds-only comparison remains in those paths;
- the Phase 10 static harness contains regression guards for the exact comparison contract.

No local build, lint, schema test, rules emulator test, browser test, or production Firebase execution was performed or claimed.

**Phase 10 remains NOT CLOSED.**

**I did not advance to the next phase.**