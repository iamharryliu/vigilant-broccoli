# Knowledge Base

## Overview

- `/knowledge-base` page (sidebar entry `SIDEBAR_ROUTE.KNOWLEDGE_BASE`, `BookOpen` icon, below CMS) is the [CMS](./cms.md) file explorer scoped to the `knowledge-base/` prefix of the same Cloudflare R2 bucket. Paths in the UI and API are relative to that prefix; bucket keys always carry it
- Uploading `.txt`, `.md` and `.pdf` files also indexes them for retrieval: the upload request only stores the files and returns, and a background queue then extracts text, chunks it, embeds the chunks and stores them in Supabase `knowledge_chunks`, one file at a time. Other file types are stored but not indexed. The toast reports uploaded and non-indexable counts
- A status bar above the explorer lists files still indexing (spinner) and files whose indexing failed with the error; the page polls `/api/knowledge-base/status` every 2 seconds while anything is indexing and toasts when the queue drains. A failed file stays stored; re-upload it to retry
- Statuses live in server memory only, so a restart of the app drops them and abandons queued files, which stay stored but unindexed until re-uploaded
- Re-uploading a file replaces its chunks; deleting a file deletes its chunks

## API

- `GET|POST|DELETE /api/knowledge-base?path=<relative path>` and `GET /api/knowledge-base/file?path=<relative path>` mirror the CMS routes, reusing `cms.server.ts` with the prefix added
- `GET /api/knowledge-base/search?q=<text>` embeds the query and returns the 5 nearest chunks as `{ matches: { file_key, chunk_index, content, similarity }[] }`, the retrieval half of RAG
- `GET /api/knowledge-base/status` returns `{ statuses: { path, status: 'indexing' | 'indexed' | 'failed', error? }[] }` for files uploaded since the server started
- The [chatbot](./chatbot.md) calls the same search on every message while its "Knowledge base" toggle is on and injects the matching chunks into its prompt

## Index

- Chunks are 1000-character windows with 200 characters of overlap. PDF text comes from `unpdf`; a PDF with under 50 characters of text (a scan) is transcribed by `gpt-4.1-mini` from the PDF itself instead, which takes about 50 seconds (in the background) and 16k tokens for 11 pages and can hit the model's output limit on much longer scans. `gpt-4o` and `gpt-4o-mini` refuse or truncate scans, and a refusal from any model would be indexed as if it were the document's text
- Embeddings are OpenAI `text-embedding-3-small` at 512 dimensions, matching the `vector(512)` column and the HNSW cosine index created by the `create_knowledge_chunks` migration. Changing model or dimensions requires a new migration and a re-index of every file
- The table sits in the shared Supabase project and is reachable only with the service-role key (RLS on, no policies)

## Free Tier

- Supabase: 500 MB database per project, shared with every app. A chunk costs about 2 KB for its 512-dimension vector plus its text and index entry, so roughly 10 KB in total
- OpenAI: embedding models are not in the free-traffic program and are billed at standard rates, about $0.02 per 1M tokens
