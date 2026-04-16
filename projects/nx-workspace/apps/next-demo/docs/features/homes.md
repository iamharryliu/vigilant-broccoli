# Homes

## Overview

Homes are shared spaces owned by one user. Members can be invited and assigned roles.

## Data

- `homes`: `id`, `name`, `description`, `user_id` (owner)
- `home_members`: `id`, `home_id`, `user_id`, `email`, `status` (`pending` | `accepted`), `role` (`HOME_MEMBER` | `HOME_ADMIN`), `invited_by`, `invited_by_email`

## Routes

- `/home` — primary nav entry; create form if no home, detail view if owned or accepted member home exists
- `/homes` — list owned homes + member homes
- `/homes/[id]` — home detail (shared `HomeDetailView` component)

## Roles

See [Role Management](./role-management.md) for role definitions and permissions.

## RLS

- Owners: full CRUD via `auth.uid() = user_id`
- Accepted members: select only via `is_home_member()` security definer
- `home_members` policies use `is_home_owner()` / `is_home_member()` security definer functions to avoid recursive RLS

## Invite flow

1. Owner/admin invites by email → `home_members` row inserted + `inviteUserByEmail` (admin client)
2. Invitee sees pending invites on `/` → clicks Accept
3. Accept calls `POST /api/auth/accept-invites` → sets `user_id` + `status = accepted`

## Shared components

- `HomeDetailView` — fetches home + members, handles save/invite/delete/role
- `HomeForm` — name/description fields + save button
- `HomeCreateForm` — wraps `HomeForm` for create flow
- `MemberList` — member CRUD with inline role dropdown
