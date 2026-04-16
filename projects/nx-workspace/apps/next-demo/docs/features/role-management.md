# Role Management

See also: [Homes](./homes.md)

## Roles

- **Owner** — full control, derived from `home.user_id === session.user.id`
- **HOME_ADMIN** — can edit home details, invite/delete members, change roles
- **HOME_MEMBER** — read-only access

## Data

- `home_members.role`: `HOME_MEMBER` (default) | `HOME_ADMIN`

## UI

- Role dropdown shown inline in member list for accepted members
- Only owner or `HOME_ADMIN` can change roles

## API

- `PATCH /api/homes/[id]/members` — update role
- Admin actions (home PATCH, member invite/delete/role) use admin client server-side when requester is `HOME_ADMIN`
