# Phase 05 — v1 data model contract

This document is the human-readable companion to the canonical runtime schema, Firestore rules, indexes and Storage path helpers.

## Firestore collections

| Collection | Document ID | Public read contract |
| --- | --- | --- |
| `profile` | `main` only | `published == true` |
| `settings` | `main` only | Public-safe singleton; all fields are world-readable |
| `projects` | slug | `published == true` |
| `services` | slug | `published == true` |
| `skills` | skill ID | `published == true` |
| `reviews` | review ID | `status == 'published'` |
| `contactLinks` | link ID | `published == true` |

All writable documents use server-managed `createdAt` and `updatedAt`. Firestore rules are the authorization boundary; `src/data/schema` is the application-level runtime validation layer.

## Localization

Localized fields are closed objects with exactly `en` and `ar`. English is required; Arabic may be empty to represent a pending translation.

## Ordering and indexes

Ordered collections use a bounded integer `order`. Public ordered queries use the published/status predicate plus `order`. The checked-in Firestore indexes cover:

- projects: published + order
- services: published + order
- skills: published + order
- contactLinks: published + order
- reviews: status + order
- reviews: status + publishedAt DESC

## Storage

Media is stored in Firebase Storage; Firestore stores paths only.

Contracted roots:

- `profile/avatar/*`
- `profile/resume/*`
- `projects/{projectId}/thumbnail/*`
- `projects/{projectId}/gallery/*`
- `services/{serviceId}/icon/*`
- `skills/{skillId}/icon/*`
- `reviews/{reviewId}/avatar/*`
- `drafts/{scope}/{fileName}` for admin-only staging

Public media grants object `get`, not bucket listing. SVG is intentionally excluded. Unpublished media that must remain private is staged under `drafts/` until a later publishing workflow moves it to a public content path.

## Featured project invariant

`settings/main.featuredProjectId` is the single source of truth. This avoids pretending that a cross-document boolean uniqueness constraint can be enforced by Firestore rules.

Cross-document checks such as referenced-project existence/publication remain an application/server responsibility for the later CMS phases.
