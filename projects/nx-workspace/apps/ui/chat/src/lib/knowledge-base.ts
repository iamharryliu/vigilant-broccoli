import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { getSupabaseUrl } from '@vigilant-broccoli/infrastructure';

export const KNOWLEDGE_BASE_PREFIX = 'knowledge-base';

const MATCH_FUNCTION = 'match_knowledge_chunks';
// Read-only half of local-manager-next's src/lib/knowledge-base.ts, which
// indexes the files; model and dimensions must match its `vector(512)` column.
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 512;
const DEFAULT_SEARCH_LIMIT = 5;

export type KnowledgeMatch = {
  file_key: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

export const searchKnowledgeBase = async (
  query: string,
  limit = DEFAULT_SEARCH_LIMIT,
) => {
  const openai = new OpenAI({
    apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
  });
  const { data: embeddings } = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    input: query,
  });
  const supabase = createClient(
    getSupabaseUrl(),
    getEnvironmentVariable('SUPABASE_SECRET_KEY'),
    { auth: { persistSession: false } },
  );
  // pgvector parses the JSON array text form of a vector.
  const { data, error } = await supabase.rpc(MATCH_FUNCTION, {
    query_embedding: JSON.stringify(embeddings[0].embedding),
    match_count: limit,
  });
  if (error) throw new Error(error.message);
  return data as KnowledgeMatch[];
};
