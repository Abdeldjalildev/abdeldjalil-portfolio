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

`settings/main.featuredProjectId` is the single source of truth. The field contains at most one project ID, so there is no per-project boolean uniqueness race.

The Phase 08 Firestore rules now enforce the cross-document invariant at the security boundary:
- a non-null featured project ID must reference an existing published project;
- a project cannot be unpublished while it is the featured project;
- a featured project cannot be deleted;
- selecting/clearing the featured project is performed by an atomic Firestore transaction.

## Project media lifecycle

Project media is never uploaded directly into a public project path while the project is being drafted.

1. Admin uploads are validated client-side for type and size, and Storage rules independently enforce the same ceilings.
2. New media is uploaded to `drafts/project-{slug}-thumbnail/*` or `drafts/project-{slug}-gallery/*`.
3. Publishing promotes referenced draft objects into `projects/{slug}/thumbnail/*` or `projects/{slug}/gallery/*`.
4. Unpublishing moves the referenced public objects back into the admin-only draft area before the Firestore document is changed to unpublished.
5. Removed media is deleted after a successful Firestore write.
6. Failed publish/unpublish writes attempt a best-effort media rollback rather than silently leaving the promoted object in place.

This staging design is required because Storage rules cannot inspect the referenced Firestore publication state. Public project media paths therefore contain only media that belongs to the public content lifecycle.
