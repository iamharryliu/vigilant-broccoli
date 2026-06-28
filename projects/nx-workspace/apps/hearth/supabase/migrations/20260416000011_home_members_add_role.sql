alter table home_members
  add column role text not null default 'HOME_MEMBER' check (role in ('HOME_MEMBER', 'HOME_ADMIN'));
