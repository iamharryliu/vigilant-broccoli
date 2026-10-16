create table kitchen_project_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'COMPONENT',
  location text not null default 'FRIDGE',
  notes text,
  started_at timestamptz not null default now(),
  ready_at timestamptz,
  use_by_at timestamptz,
  resolution text check (resolution in ('USED', 'DISCARDED')),
  resolved_at timestamptz,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index kitchen_project_items_home_resolved_idx
  on kitchen_project_items (home_id, resolved_at);

alter table kitchen_project_items enable row level security;

create policy "Users can manage kitchen project items for their homes"
  on kitchen_project_items
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
