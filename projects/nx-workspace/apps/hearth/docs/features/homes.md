# Homes

## Overview

Homes are shared spaces owned by one user. Members can be invited and assigned roles.

## Data

- `homes`: `id`, `name`, `description`, `user_id` (owner)
- `home_members`: `id`, `home_id`, `user_id`, `email`, `status` (`pending` | `accepted`), `role` (`HOME_MEMBER` | `HOME_ADMIN`), `invited_by`, `invited_by_email`
- `home_invite_links`: `id`, `home_id`, `token_hash` (SHA-256 of the token; the raw token is never stored), `role` (always `HOME_MEMBER`), `created_by`, `expires_at` (default 7 days), `max_uses` (default 10), `use_count`, `revoked_at`, `created_at`. Not in Export Data: it holds access secrets, not user content.

## Routes

- `/home` — primary nav entry; create form if no home, detail view if owned or accepted member home exists
- `/homes` — list owned homes + member homes
- `/homes/[id]` — home detail (shared `HomeDetailView` component)
- `GET /api/homes/[id]/members` — owner entry plus `home_members` rows, each with `user_id` and `display_name` (auth `user_metadata`, read with the admin client; null for pending invites); owner or accepted members only
- `GET|POST|DELETE /api/homes/[id]/invite-links` — owner or `HOME_ADMIN` only: list active links (no tokens), create one (returns the full `/join/<token>` URL once), revoke one (`{ linkId }` sets `revoked_at`)
- `/join/[token]` — signed-in preview of the home and inviter with a Join button; signed-out visitors go to `/login?next=/join/<token>`
- `GET /api/join/[token]` — preview; read-only so link unfurlers cannot join. `POST /api/join/[token]` — redeems the link for the signed-in user

## Roles

See [Role Management](./role-management.md) for role definitions and permissions.

## RLS

- Owners: full CRUD via `auth.uid() = user_id`
- Accepted members: select only via `is_home_member()` security definer
- `home_members` policies use `is_home_owner()` / `is_home_member()` security definer functions to avoid recursive RLS
- `home_invite_links`: select, insert (with `created_by = auth.uid()`) and update for `is_home_owner()` or `is_home_admin()`; no delete policy, so revoked rows remain until the home is deleted

## Invite flow

1. Owner/admin invites by email → `home_members` row inserted + `inviteUserByEmail` (admin client)
2. Invitee sees pending invites on `/` → clicks Accept
3. Accept calls `POST /api/auth/accept-invites` → sets `user_id` + `status = accepted`

## Invite link flow

1. Owner/admin clicks Copy invite link → a 256-bit `base64url` token is generated, its hash stored, and the URL copied
2. Invitee opens `/join/<token>`, signs in if needed, and confirms
3. The admin client calls `redeem_home_invite_link(token_hash, user_id)` (service role only). Under a row lock it returns `already_member` for the owner or an accepted member without using a slot; otherwise it increments `use_count` only while the link is unrevoked, unexpired and under `max_uses`, and upserts the `home_members` row as accepted `HOME_MEMBER` with the user's auth email and `invited_by` the link creator. A pending email invite for the same address becomes that row.
4. Revoked, expired, exhausted and unknown links return their status and the join page shows the matching message
5. No rate limiting: the app has no existing pattern, and the token space makes guessing impractical

## Shared components

- `HomeDetailView` — fetches home + members, handles save/invite/delete/role
- `HomeForm` — name/description fields + save button
- `HomeCreateForm` — wraps `HomeForm` for create flow
- `MemberList` — member CRUD with inline role dropdown
- `InviteLinkControls` — owner/admin create-and-copy plus active link list with revoke
