create table home_docs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table home_doc_files (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references home_docs(id) on delete cascade,
  name text not null,
  mime_type text not null,
  r2_key text not null,
  size_bytes bigint not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table home_docs enable row level security;
alter table home_doc_files enable row level security;

create policy "Users can manage home docs for their homes"
  on home_docs
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can manage home doc files via home docs"
  on home_doc_files
  for all
  using (
    exists (
      select 1 from home_docs
      where home_docs.id = home_doc_files.doc_id
        and home_docs.home_id in (
          select id from homes where user_id = auth.uid()
          union
          select home_id from home_members where user_id = auth.uid() and status = 'accepted'
        )
    )
  );
