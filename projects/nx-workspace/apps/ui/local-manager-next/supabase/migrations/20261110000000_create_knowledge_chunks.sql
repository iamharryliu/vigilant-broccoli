-- Text chunks of the files under the R2 `knowledge-base/` prefix, embedded with
-- OpenAI text-embedding-3-small at 512 dimensions (about 2 KB per vector) to
-- keep the shared 500 MB free-tier database small. Only the service-role key
-- reads or writes it: RLS is on with no policies.
create extension if not exists vector with schema extensions;

create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  file_key text not null,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(512) not null,
  created_at timestamptz not null default now(),
  unique (file_key, chunk_index)
);

alter table knowledge_chunks enable row level security;

create index knowledge_chunks_embedding_idx
  on knowledge_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

create function match_knowledge_chunks(
  query_embedding extensions.vector(512),
  match_count integer
)
returns table (file_key text, chunk_index integer, content text, similarity float)
language sql stable
set search_path = public, extensions
as $$
  select
    file_key,
    chunk_index,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  order by embedding <=> query_embedding
  limit match_count;
$$;
