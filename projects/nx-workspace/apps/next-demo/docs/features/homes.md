# Homes

## Overview

Homes are shared spaces owned by one user. Members can be invited and given access to shared features like Where Is.

## Data

- `homes` table: `id`, `name`, `description`, `user_id` (owner)
- `home_members` table: `id`, `home_id`, `user_id`, `email`, `status` (`pending` | `accepted`), `invited_by`, `invited_by_email`

## Routes

- `/homes` — list owned homes + member homes
- `/homes/[id]` — home details, edit (owner only), member management

## RLS

- Owners: full CRUD via `auth.uid() = user_id`
- Accepted members: select only via `is_home_member()` security definer function
- `home_members` owner policy uses `is_home_owner()` security definer to avoid recursive RLS

## Invite flow

1. Owner invites by email → `home_members` row inserted + `inviteUserByEmail` (admin client)
2. Invitee sees pending invites on home page (`/`) → clicks Accept
3. Accept calls `POST /api/auth/accept-invites` → sets `user_id` + `status = accepted`

## Access control

- Edit fields and Save button hidden for non-owners on detail page
- Invite/delete member only available to owners
- `isOwner` derived from `home.user_id === session.user.id` (fetched via `select('*')`)
