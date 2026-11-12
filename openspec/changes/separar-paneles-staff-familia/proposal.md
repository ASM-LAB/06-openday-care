# Proposal

## Why

OpenDayCare currently has one authenticated feed experience, while the family-facing feed and staff-only child-management area do not yet form role-specific panels. Families need a safe way to see updates relevant to their linked children without exposing staff controls or unrelated child data.

## What Changes

- Keep one login and route active users to a staff or family experience according to their verified profile role.
- Give staff access to child management and publication controls; give families a separate, read-only feed.
- Let authorized staff link existing active family accounts to children; account creation and invitations remain out of scope.
- Persist staff publications and show families general announcements plus posts for rooms containing their linked children.
- Enforce role, daycare, and family-child relationship permissions on the server and database, not only in navigation.

## Capabilities

### New Capabilities

- `role-based-panels`: Role-directed entry, separate staff/family navigation, and protection of role-specific routes and actions.
- `family-child-links`: Staff-managed links between existing active family accounts and children in the same daycare.
- `family-feed`: Persistent staff publications and a family read-only feed limited to general announcements and linked children's rooms.

### Modified Capabilities

None. The OpenSpec project has no existing capability specs. Related database drafts exist under `spec/database/`; implementation planning should reconcile with them rather than assume they are deployed.

## Impact

- Authentication and routing in `app/login/actions.ts`, `app/page.tsx`, and server authorization helpers under `lib/supabase/`.
- The existing feed UI and composer (`app/FeedClient.tsx`, `app/CreatePostModal.tsx`) and the staff child-management routes under `app/kids/`.
- New family-facing routes/components and server-side data access.
- Supabase profile, family-child relationship, publication, photo-storage, grants, and RLS behavior, aligned with `spec/database/11-vinculos-familia-nino.md`, `12-backend-publicaciones.md`, and `13-feed-publicaciones.md` after verifying the remote schema.
