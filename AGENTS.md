# AGENTS.md — Abdeldjalil Portfolio Master Plan & Agent Contract

## 0. Authority
This file is the authoritative execution reference for the Abdeldjalil Portfolio repository. It is both the master 15-phase plan and the standing contract for AI coding agents.
Project: Abdeldjalil Portfolio
Repository: Abdeldjalildev/abdeldjalil-portfolio
Firebase project ID: abdeldjalil-portfolio
Frontend: React + TypeScript + Vite
Styling: Tailwind CSS
Backend direction: Firebase Authentication + Firestore + Storage + Cloud Functions where justified
Public languages: English + Arabic with true LTR/RTL support
Design: premium dark electronic indigo, turquoise/electronic-green accents, restrained glassmorphism, smooth controlled motion.
MenuFlow is explicitly OUT OF SCOPE unless the owner explicitly requests its inclusion.

## 1. Mission
- Build a permanent, professional, production-ready personal portfolio.
- Demonstrate frontend engineering and product thinking.
- Attract clients and support selling development services.
- Showcase selected projects as credible technical/commercial proof.
- Provide a real private Admin CMS.
- Use real backend data, authentication, storage and authorization.
- Be responsive, accessible, secure, maintainable, testable and scalable.
- Support English and Arabic without compromising RTL correctness.
- Allow normal content maintenance through the CMS without editing React source.

## 2. Current baseline
- Firebase project exists.
- Firebase Web App is registered.
- Google Analytics was intentionally not enabled during project creation.
- React/TypeScript/Vite scaffold exists and successfully started.
- ESLint exists.
- Local Git repository exists on main.
- GitHub remote is configured to Abdeldjalildev/abdeldjalil-portfolio.
- Do not assume Firebase CLI linkage, services, rules, schemas or local Firebase configuration are complete merely because the Firebase project exists.

## 3. Product scope
### Public website
- Home, About, Services, Projects, Project detail/case-study, Reviews, Contact, Footer, language switcher, SEO/share metadata and responsive navigation.
### Admin CMS
- Dashboard, Projects, Services, Skills/Technologies, Profile/About, Reviews, Contact & Social Links, Analytics and Settings.
- Admin is a real authenticated experience. Frontend hiding is not security.
### Project CMS
- title, localized title/description, short/full description, category, technologies, thumbnail, gallery, live demo, GitHub URL, other links, case study, featured, published, display order, SEO metadata and timestamps as appropriate.
- Exactly one project may be featured at a time.
- Featured project selection is a CMS concept and is separate from visitor-selected project details.
### Reviews
- client name, optional avatar, rating 1–5, review text/localization as needed, linked service/project, date and status.
- Workflow: Pending → Approved → Published.
- Unapproved reviews must never appear publicly.
### Contact/social links
- Support email, phone, WhatsApp, GitHub, LinkedIn, Instagram, Facebook, X/Twitter, Telegram, YouTube, Behance, Dribbble and custom URL where useful.
- Each item should support type, label, target/value, enabled/published state, display order and icon/type metadata.
- Absent/unpublished entries do not render.
### Analytics
- Useful events: page_view, project_view, project_live_demo_click, github_click, contact_click, social_click, service_view, resume_download.
- Avoid uncontrolled per-click Firestore writes. Consider aggregation, cost, privacy and abuse.

## 4. Technical principles
- React + TypeScript + Vite.
- Tailwind CSS.
- React Router.
- Firebase modular Web SDK.
- Firebase Authentication, Firestore and Storage where required.
- Cloud Functions only where server-side trust, privilege or atomicity requires them.
- Schema validation at trust boundaries.
- No Redux unless a demonstrated requirement exists.
- Avoid unnecessary dependencies.
- Prefer feature-oriented architecture.
- Media belongs in Storage; Firestore stores metadata/references.
- Never put Admin SDK credentials or service-account secrets in client code.
- Firebase client configuration is not a security boundary; authorization rules are authoritative.
- UI checks are UX only, not security.
- Use semantic accessible HTML and keyboard-accessible interaction.
- Respect prefers-reduced-motion.
- Never trade security or data integrity for convenience.
- Never weaken tests to make a phase pass.

## 5. Agent operating contract
### Phase isolation
- Work on ONE phase at a time.
- Never start the next phase automatically.
- A phase is not closed merely because code exists.
- Owner reviews the phase report before the next phase.
- A failed or blocked gate blocks closure unless explicitly accepted.
- Never silently convert an unresolved requirement into an assumption.
### Scope control
- Before editing: read this file, inspect the repository, identify the active phase/gate, list intended areas, and state ambiguity.
- Do not invent features, perform unrelated refactors, upgrade dependencies without concrete reason, replace libraries for preference, delete/weaken tests, bypass security, change Firebase identity, change visual direction, or modify unrelated files.
### Evidence-first
- Every report must include starting state, work performed, files changed, dependency changes, commands, test/build/lint/typecheck results, security checks, limitations, out-of-scope findings and gate-by-gate evidence.
- Do not claim PASS from inspection alone when execution evidence is required.
### Git discipline
- No reset, rebase, force-push, history rewrite, destructive command or branch deletion without explicit authorization.
- No commit or push unless explicitly requested.
- Do not create meaningless checkpoint commits.
- Preserve user work.
### Firebase discipline
- Do not enable services merely because they exist.
- Do not create permissive production rules.
- Do not use client-side authorization as the security model.
- Do not create production collections/indexes without documented data model.
- Never use Admin SDK from browser code.
- Privileged operations must be server-authorized.
- Use Emulator Suite for rules/integration work where practical.
- Rule changes require both allowed and denied-case tests.
### Dependency discipline
- Before adding a dependency explain the problem, why existing stack is insufficient, compatibility, maintenance, bundle/runtime/security impact and reason.
### Quality floor
- Where applicable validate TypeScript, ESLint, production build, tests, security rules, responsive behavior, accessibility, loading/error/empty states and LTR/RTL.

## 6. Gate model
Every phase has exactly six ordered gates:
1. Discovery & contract
2. Architecture/data design
3. Implementation
4. Verification
5. Hardening/review
6. Closure/evidence
A phase may customize the content of these six gates but must retain six distinct gates.

# PHASE 01 — FOUNDATION, REPOSITORY BASELINE & FIREBASE BOOTSTRAP
Objective: clean the raw Vite scaffold and establish Firebase connection without prematurely building features.
Gate 1 — Discovery: inspect tree, package/configs, Vite demo artifacts, runtime, Git remote and Firebase identity; produce baseline inventory.
Gate 2 — Design: define minimal directories, env strategy, Firebase client boundary, naming/error conventions, and services intentionally not enabled.
Gate 3 — Implementation: remove Vite demo code/assets; preserve React/TS/Vite/ESLint; add Firebase SDK and clean initialization/env template; associate CLI; do not build Auth/Firestore/Storage CMS.
Gate 4 — Verification: lint, typecheck if configured, production build, dev startup, Firebase initialization sanity and secret exposure check.
Gate 5 — Hardening: inspect env handling, .gitignore, accidental secrets, dependency changes and absence of permissive Firebase rules.
Gate 6 — Closure: full six-gate report; no commit/push unless separately requested; owner acceptance required.

# PHASE 02 — DESIGN SYSTEM, THEME, TYPOGRAPHY & MOTION
Objective: establish reusable visual foundations before pages.
Gate 1 — Discovery: define colors, surfaces, borders, text, focus, spacing, radii, shadows and glass layers.
Gate 2 — Design: define English/Arabic typography, hierarchy, LTR/RTL rules, motion principles and reduced-motion behavior.
Gate 3 — Implementation: global theme, typography, reusable UI primitives and motion utilities; no page-specific duplication.
Gate 4 — Verification: mobile/tablet/desktop, keyboard focus, contrast, reduced motion and Arabic shaping/direction.
Gate 5 — Hardening: remove duplicate styles, uncontrolled one-off tokens and unnecessary CSS/dependency weight.
Gate 6 — Closure: document tokens/primitives and provide evidence; owner acceptance required.

# PHASE 03 — APPLICATION ARCHITECTURE, ROUTING, LAYOUTS & ERROR MODEL
Objective: establish stable public/admin boundaries.
Gate 1 — Discovery: map all public/admin routes, layouts, loading, error and not-found behavior.
Gate 2 — Design: define feature boundaries, shared components, service boundaries and router protection boundary.
Gate 3 — Implementation: routing, PublicLayout, AdminLayout skeleton, error boundary and route-level loading/error patterns; no feature pages.
Gate 4 — Verification: route resolution, refresh/deep navigation, unknown routes and mobile navigation skeleton.
Gate 5 — Hardening: review circular dependencies, feature leakage and unnecessary abstractions.
Gate 6 — Closure: route map and architecture evidence; owner acceptance required.

# PHASE 04 — AUTHENTICATION, ADMIN IDENTITY & AUTHORIZATION
Objective: build trustworthy admin identity and authorization.
Gate 1 — Discovery: define admin identity, trust boundaries and client/server responsibilities.
Gate 2 — Design: define Auth flow, roles/claims/data model, protected operations, failure/recovery states.
Gate 3 — Implementation: Firebase Auth integration, admin guard UX and server-authoritative authorization for privileged operations.
Gate 4 — Verification: authenticated/unauthenticated/unauthorized behavior and token/claim refresh where applicable.
Gate 5 — Hardening: audit rules and privileged endpoints for escalation paths.
Gate 6 — Closure: security evidence and denied-case tests; owner acceptance required.

# PHASE 05 — DATA MODEL, SCHEMAS, INDEXES & STORAGE CONTRACT
Objective: freeze the canonical data model before feature implementation.
Gate 1 — Discovery: model profile, settings, projects, services, skills, reviews, socials/contact and analytics.
Gate 2 — Design: define TypeScript types, schemas, localization, timestamps, ordering, relationships, query patterns and required indexes.
Gate 3 — Implementation: types/schemas/data-access boundaries, Firestore indexes and Storage path conventions; no UI CRUD.
Gate 4 — Verification: representative documents, query behavior, schema rejection and index validation.
Gate 5 — Hardening: review duplication, query cost, security implications, migration concerns and analytics write amplification.
Gate 6 — Closure: freeze v1 data contract and document TBDs; owner architecture review required.

# PHASE 06 — PUBLIC SHELL, NAVIGATION, FOOTER & I18N/RTL
Objective: create the complete public shell.
Gate 1 — Discovery: header/navigation, footer, language switcher and responsive states.
Gate 2 — Design: separate static UI localization from CMS localization; define true direction switching.
Gate 3 — Implementation: public header/footer/layout/language switcher/global navigation.
Gate 4 — Verification: routes, EN/AR, true RTL, keyboard navigation and mobile drawer.
Gate 5 — Hardening: visual consistency, accessibility and runtime/hydration concerns.
Gate 6 — Closure: language and route evidence; owner acceptance required.

# PHASE 07 — PROFILE, ABOUT, SERVICES & SKILLS CMS
Objective: make core professional content data-driven.
Gate 1 — Discovery: content requirements, publication and ordering semantics.
Gate 2 — Design: Firestore fields, localized content and admin validation/workflow.
Gate 3 — Implementation: admin CRUD and public rendering with loading/empty/error states.
Gate 4 — Verification: CRUD, validation, publication visibility, RTL and CMS-to-public updates without source edits.
Gate 5 — Hardening: read/write security, malformed URLs and content injection concerns.
Gate 6 — Closure: end-to-end CMS evidence; owner acceptance required.

# PHASE 08 — PROJECT CMS & MEDIA PIPELINE
Objective: build the project management and media system.
Gate 1 — Discovery: project lifecycle, featured invariant and thumbnail/gallery requirements.
Gate 2 — Design: upload validation, file types/sizes, naming, deletion, ordering, publishing and exactly-one-featured rule.
Gate 3 — Implementation: project CRUD, media handling, ordering, publishing and featured selection; enforce invariants server-side where needed.
Gate 4 — Verification: CRUD, uploads, deletion, invalid files, featured exclusivity and unpublished visibility.
Gate 5 — Hardening: Storage/Firestore rules, orphan media, URL validation and abuse controls.
Gate 6 — Closure: complete CMS evidence and invariant tests; owner acceptance required.

# PHASE 09 — PUBLIC PROJECTS & CASE STUDIES
Objective: turn project data into a polished public showcase.
Gate 1 — Discovery: Projects page information architecture, selected-project behavior and default selection.
Gate 2 — Design: cards, selected details, gallery, case study, technologies, live demo, GitHub and mobile behavior.
Gate 3 — Implementation: /projects, cards, selected details and /projects/:slug using published CMS data.
Gate 4 — Verification: selection, deep links, missing/unpublished projects, galleries, responsive behavior and external links.
Gate 5 — Hardening: performance, image loading, accessibility, SEO metadata and conversion clarity.
Gate 6 — Closure: representative project evidence; owner acceptance required.

# PHASE 10 — REVIEWS, SOCIAL PROOF & CONTACT
Objective: build trustworthy reviews and contact conversion.
Gate 1 — Discovery: review lifecycle and contact/social requirements.
Gate 2 — Design: validation, abuse controls, aggregate rating and contact click boundaries.
Gate 3 — Implementation: review CMS, approval/publishing workflow, public reviews, contact page and dynamic social/contact links.
Gate 4 — Verification: unauthorized changes, unpublished visibility, rating boundaries, broken links and mobile actions.
Gate 5 — Hardening: abuse resistance, validation, external URL safety and privacy.
Gate 6 — Closure: end-to-end review/contact evidence; owner acceptance required.

# PHASE 11 — HOME, CONVERSION FLOW & FEATURED PROJECT
Objective: assemble the public home experience around a coherent professional story.
Gate 1 — Discovery: Hero → About preview → Services → Featured Project → social proof → CTA → Footer.
Gate 2 — Design: data dependencies, fallback behavior, featured-project behavior and Show More behavior.
Gate 3 — Implementation: responsive Home sections, featured project and additional project reveal.
Gate 4 — Verification: partial/empty data, EN/AR, mobile and CTA/project targets.
Gate 5 — Hardening: hierarchy, performance, restrained motion and conversion clarity.
Gate 6 — Closure: full Home evidence; owner acceptance required.

# PHASE 12 — ADMIN DASHBOARD COMPLETION, SETTINGS & OPERATIONS
Objective: make the admin experience operationally complete.
Gate 1 — Discovery: dashboard summaries, operational states and settings boundaries.
Gate 2 — Design: navigation, permissions, confirmation patterns and unsaved/destructive action behavior.
Gate 3 — Implementation: dashboard, admin navigation, settings, summaries and empty/loading/error states.
Gate 4 — Verification: CRUD navigation, unauthorized access and destructive-action confirmations.
Gate 5 — Hardening: usability, security, race conditions and data consistency.
Gate 6 — Closure: admin walkthrough evidence; owner acceptance required.

# PHASE 13 — ANALYTICS, OBSERVABILITY & ABUSE RESISTANCE
Objective: add useful privacy-conscious analytics and resilient error handling.
Gate 1 — Discovery: event taxonomy, aggregates, retention and cost boundaries.
Gate 2 — Design: write architecture, aggregation, privacy, failure behavior and abuse protections.
Gate 3 — Implementation: tracking, admin analytics views, resilient error handling and rate/abuse protections where justified.
Gate 4 — Verification: event correctness, duplicate handling, failure isolation and aggregate accuracy.
Gate 5 — Hardening: cost, privacy, PII exposure, abuse and query performance.
Gate 6 — Closure: event-to-dashboard evidence; owner acceptance required.

# PHASE 14 — SECURITY, ACCESSIBILITY, PERFORMANCE, SEO & HARDENING
Objective: deep cross-cutting production hardening.
Gate 1 — Discovery: inventory attack surfaces, routes, Firebase rules, Storage, Functions, external links and inputs.
Gate 2 — Design: final security/accessibility/performance/SEO acceptance criteria.
Gate 3 — Implementation: fix verified findings; harden authorization/rules, image loading, code splitting, metadata, sitemap/robots and accessibility.
Gate 4 — Verification: full lint/typecheck/build/tests, Firebase security tests, mobile/desktop and EN/AR; verify no secrets committed.
Gate 5 — Hardening: deep regression review, dependency vulnerabilities, oversized assets, console errors, broken links, accessibility and bypasses.
Gate 6 — Closure: prioritized findings report; all blocking findings resolved or explicitly accepted.

# PHASE 15 — FINAL PRODUCTION VERIFICATION & RELEASE READINESS
Objective: prove release readiness without treating passing tests as the only proof.
Gate 1 — Release inventory: confirm public/admin features, Firebase resources, environment configuration and documentation.
Gate 2 — Final architecture/security review: verify client/server boundaries and no development bypasses.
Gate 3 — Full verification: complete automated suite plus critical visitor/admin/CMS/media/review/analytics journeys.
Gate 4 — Production simulation: environment variables, asset paths, external links, failure behavior and rollback/documentation strategy.
Gate 5 — Final hardening: classify every open issue as blocking/non-blocking/deferred; no last-minute rewrite without blocking reason.
Gate 6 — Release decision: final evidence package; mark RELEASE-READY only after explicit owner acceptance. Deployment remains a separate explicit action.

## 7. Phase status ledger
Phase 01 through Phase 15: NOT STARTED.
Only the owner may change a phase to CLOSED.

## 8. Required phase report
Every phase report must include: phase/gate; objective; starting state; inspected files; changed files; dependency changes; implementation summary; commands; test/build/lint/typecheck results; security evidence; Gate 1–6 PASS/FAIL/BLOCKED with evidence; known issues; out-of-scope findings; recommended next action; explicit statement: 'I did not advance to the next phase.'

## 9. Non-negotiable anti-patterns
- No broad changes because architecture could be better.
- No unjustified dependencies.
- No fake backend/localStorage pretending to be production backend.
- No fake authentication.
- No unprotected admin writes.
- No hardcoded production content where CMS is required.
- No silently swallowed errors.
- No disabling lint/typecheck/tests.
- No deleting or weakening tests.
- No insecure Firebase rules used as a shortcut.
- No uncontrolled analytics writes.
- No committed secrets/service-account JSON/Admin SDK in client.
- No mixing UI translation files with CMS localization.
- No treating Arabic as text substitution only.
- No claiming backend correctness from screenshots.
- No PASS without evidence.
- No continuing after a blocking gate failure.
- No deployment/publishing without explicit authorization.

## 10. Decision hierarchy
1. Security and data integrity.
2. Explicit owner requirements in the current phase prompt.
3. This AGENTS.md.
4. Existing tested project behavior.
5. Framework/library defaults.
6. Agent preference.
Agent preference never overrides explicit owner requirements.

## 11. Definition of done
A phase is CLOSED only when all six gates have evidence, required tests pass, blocking findings are resolved, no unapproved scope was introduced, and the owner accepts the report.
The project is RELEASE-READY only after Phase 15 is explicitly accepted.

## 12. Final rule
This document is the master plan and agent contract. It does not replace a phase-specific prompt. A phase prompt may narrow scope, allowed files or commands further. The narrower restriction wins. When uncertain: STOP, report the ambiguity, and ask for direction. Do not guess.