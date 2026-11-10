import { extname } from 'path';
import OpenAI from 'openai';
import { extractText, getDocumentProxy } from 'unpdf';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { supabaseAdmin } from './supabase-admin';

export const KNOWLEDGE_BASE_PREFIX = 'knowledge-base';

const CHUNKS_TABLE = 'knowledge_chunks';
const MATCH_FUNCTION = 'match_knowledge_chunks';
const FILE_KEY_COLUMN = 'file_key';
// Must match the `vector(512)` column in the create_knowledge_chunks migration.
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 512;
const EMBEDDING_BATCH_SIZE = 100;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const INSERT_BATCH_SIZE = 200;
const DEFAULT_SEARCH_LIMIT = 5;
// A PDF yielding less text than this has no text layer (a scan).
const MIN_PDF_TEXT_CHARS = 50;
// gpt-4o and gpt-4o-mini refuse or truncate scanned PDFs; gpt-4.1-mini
// transcribes a full 11-page scan.
const OCR_MODEL = 'gpt-4.1-mini';
const OCR_PROMPT =
  'Transcribe all the text in this document, page by page, in reading order. Output only the transcription, with no commentary.';

const PDF_EXTENSION = '.pdf';
const TEXT_EXTENSIONS = ['.txt', '.md'];
const INDEXABLE_EXTENSIONS = [PDF_EXTENSION, ...TEXT_EXTENSIONS];

export type KnowledgeMatch = {
  file_key: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

export const isIndexable = (fileName: string) =>
  INDEXABLE_EXTENSIONS.includes(extname(fileName).toLowerCase());

const getOpenAI = () =>
  new OpenAI({ apiKey: getEnvironmentVariable('OPENAI_API_KEY') });

// OpenAI reads the PDF's page images itself, so scans need no local renderer.
const transcribePdf = async (file: File) => {
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  const completion = await getOpenAI().chat.completions.create({
    model: OCR_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            file: {
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64}`,
            },
          },
          { type: 'text', text: OCR_PROMPT },
        ],
      },
    ],
  });
  return completion.choices[0]?.message.content ?? '';
};

const extractFileText = async (file: File) => {
  if (extname(file.name).toLowerCase() !== PDF_EXTENSION) return file.text();
  const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim().length < MIN_PDF_TEXT_CHARS ? transcribePdf(file) : text;
};

// Fixed-size windows with overlap, so a sentence cut at a boundary still
// appears whole in the next chunk.
const chunkText = (text: string) => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];
  for (
    let start = 0;
    start < normalized.length;
    start += CHUNK_SIZE - CHUNK_OVERLAP
  ) {
    chunks.push(normalized.slice(start, start + CHUNK_SIZE));
    if (start + CHUNK_SIZE >= normalized.length) break;
  }
  return chunks;
};

const embed = async (inputs: string[]) => {
  const openai = getOpenAI();
  const embeddings: number[][] = [];
  for (let i = 0; i < inputs.length; i += EMBEDDING_BATCH_SIZE) {
    const { data } = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      input: inputs.slice(i, i + EMBEDDING_BATCH_SIZE),
    });
    embeddings.push(...data.map(item => item.embedding));
  }
  return embeddings;
};

// pgvector parses the JSON array text form of a vector.
const toVector = (embedding: number[]) => JSON.stringify(embedding);

export const deleteKnowledgeChunks = async (fileKey: string) => {
  const { error } = await supabaseAdmin
    .from(CHUNKS_TABLE)
    .delete()
    .eq(FILE_KEY_COLUMN, fileKey);
  if (error) throw new Error(error.message);
};

// Re-uploading a file replaces its chunks. Returns the stored chunk count.
export const indexKnowledgeFile = async (fileKey: string, file: File) => {
  const chunks = chunkText(await extractFileText(file));
  await deleteKnowledgeChunks(fileKey);
  if (chunks.length === 0) return 0;

  const embeddings = await embed(chunks);
  const rows = chunks.map((content, chunk_index) => ({
    file_key: fileKey,
    chunk_index,
    content,
    embedding: toVector(embeddings[chunk_index]),
  }));
  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    const { error } = await supabaseAdmin
      .from(CHUNKS_TABLE)
      .insert(rows.slice(i, i + INSERT_BATCH_SIZE));
    if (error) throw new Error(error.message);
  }
  return rows.length;
};

export const searchKnowledgeBase = async (
  query: string,
  limit = DEFAULT_SEARCH_LIMIT,
) => {
  const [embedding] = await embed([query]);
  const { data, error } = await supabaseAdmin.rpc(MATCH_FUNCTION, {
    query_embedding: toVector(embedding),
    match_count: limit,
  });
  if (error) throw new Error(error.message);
  return data as KnowledgeMatch[];
};
