-- Index status per file under the R2 `knowledge-base/` prefix, so the page can
-- show progress and failures after a restart and the app can resume files left
-- 'indexing' by a process that died. Only the service-role key reads or writes
-- it: RLS is on with no policies.
create table knowledge_files (
  file_key text primary key,
  status text not null check (status in ('indexing', 'indexed', 'failed')),
  error text,
  updated_at timestamptz not null default now()
);

alter table knowledge_files enable row level security;
