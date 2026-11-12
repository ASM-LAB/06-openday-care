# Design

## Context

See `proposal.md` for motivation and the three capability specs for observable behavior. The current app has one login and a demo feed at `/`; `/kids` is already staff/admin-only. `requireAuth()` currently checks Auth and a display name, while `requireKidsStaff()` checks the profile role, status, and daycare. The family-link, publication, and private-photo database behavior is described in draft documents under `spec/database/`, but must not be presumed deployed.

The app uses Next.js server-rendered routes and Supabase SSR. The feed and composer are currently client-side demo UI, and family accounts may not yet have active profiles or child links.

## Goals / Non-Goals

**Goals:**
- Resolve role and active status from the server-side `users` profile for every protected experience.
- Keep one login while providing separate staff and family route shells and capabilities.
- Use current family-child links and database policies to authorize every feed and media read.
- Reuse the existing design language while preventing family routes from selecting or receiving staff-only child fields.

**Non-Goals:**
- Public registration, account invitations, or automatic role/daycare assignment.
- Family access to medical notes, allergy details, or staff child-management screens.
- Family posts, comments, reactions, or child-specific publication audiences.
- Treating hidden UI controls as an authorization boundary.

## Decisions

### Resolve the destination from the verified profile

After sign-in, load the active application profile server-side and route `staff`/`admin` to the staff home and `parent` to the family home. Ignore any client-provided role or destination that would cross role boundaries. Centralize the profile checks in server authorization helpers used by both route loaders and server actions.

**Alternative considered:** Keep `/` as a role-neutral page and ask users to choose a panel. Rejected because it adds a confusing choice and creates another place where role selection could be spoofed.

### Use distinct route shells with shared visual primitives

Retain the existing staff home and `/kids` flow, then add a family route (for example, `/familia`) with its own navigation and read-only feed. Share brand, typography, and reusable presentation primitives where appropriate; do not share role-specific navigation or controls as authorization logic.

**Alternative considered:** Render a single sidebar and hide staff links for parents. Rejected as the only separation because direct route/action access still needs its own checks and the family experience should not expose staff-oriented labels.

### Enforce audience at the database and server boundaries

Use active profile role and daycare membership for staff operations, and current `parent_children` links for family audience resolution. RLS and Storage policies remain authoritative defense-in-depth. Family feed queries return only daycare-wide and linked-room publications; requests for feed records and private media re-evaluate the same audience. Do not grant family read access to general child records to compute the feed.

**Alternative considered:** Fetch all posts or child records and filter in the browser. Rejected because client filtering can disclose unrelated children or publications and cannot revoke access reliably.

### Reconcile with the database drafts before changing Supabase

Treat `spec/database/11-vinculos-familia-nino.md`, `12-backend-publicaciones.md`, and `13-feed-publicaciones.md` as design references, not proof of deployed objects. Before any schema or policy change, inspect the remote tables, types, policies, grants, Storage bucket, and eligible profiles; compare the live state with those drafts and stop if required family profiles or daycare assignments are missing. Apply only the necessary compatible schema changes and verify access using staff, admin, and parent sessions.

**Alternative considered:** Assume the draft schema is already live and build directly against it. Rejected because the drafts explicitly require remote inspection and a mismatch could cause security or migration errors.

### Keep family interactions read-only

Families can read authorized posts and media but cannot create, edit, or delete publications. Staff retain publication controls with author/admin rules from the feed capability.

**Alternative considered:** Allow family reactions or comments in this change. Rejected as outside the agreed initial scope.

## Risks / Trade-offs

- [Some existing Auth accounts may lack an active `parent` profile, daycare, or child link] -> Verify eligible records before rollout; do not auto-create accounts or infer assignments; provide a clear no-linked-children state.
- [Existing demo feed and the family feed may be mistaken for production data during migration] -> Remove static sample posts as the persisted feed is introduced and distinguish loading, empty, and error states.
- [Role routing can create redirect loops if the requested destination conflicts with the account role] -> Allow only safe same-role destinations and use a canonical role home as the fallback.
- [Storage policies can drift from post visibility] -> Apply the same current audience predicate to metadata and each private object request; test access revocation after unlinking.
- [Remote schema may differ from the database drafts] -> Inspect before altering anything, reconcile naming/types/policies, and stop for a design decision if the live model changes the agreed behavior.

## Migration Plan

1. Inspect remote Supabase objects and active profiles without modifying data; validate staff/admin and parent account readiness.
2. Reconcile and deploy the minimum required relationship, publication, photo metadata, private bucket, grants, and RLS changes; verify allowed and denied access before exposing the UI.
3. Deploy server-side role resolution and staff/family routes, then connect the staff composer and family feed to persisted data.
4. Smoke-test one login for staff, admin, and parent profiles, including direct URL/action attempts, general and linked-room audiences, private photos, and link removal.
5. Roll back by disabling the new family entry route and restoring the previous staff landing behavior; do not delete relationship or publication data as part of application rollback. Database rollback must be planned against the inspected live schema and avoid destructive data loss.

## Open Questions

None that block this design. The actual remote schema and the presence of eligible active family profiles are verification gates, not assumptions; stop and revisit the design if either changes the agreed access model.
