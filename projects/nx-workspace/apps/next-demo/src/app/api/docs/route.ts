import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { uploadFile, deleteFile, getFileUrl } from './r2';
import {
  processFile,
  validateFileCount,
  FileValidationError,
  RawFile,
} from './file-processor';

export const runtime = 'nodejs';

const MAX_REQUEST_BYTES = 100 * 1024 * 1024; // 100MB — 20 files × ~5MB each

const getSupabase = (req: NextRequest) => {
  const accessToken =
    req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  return createServerClient(accessToken);
};

const toDoc = (
  row: Record<string, unknown> & { home_doc_files?: Record<string, unknown>[] },
) => ({
  id: row.id,
  name: row.name,
  description: row.description ?? null,
  category: row.category,
  homeId: row.home_id,
  files: (row.home_doc_files ?? []).map((f: Record<string, unknown>) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mime_type,
    url: getFileUrl(f.r2_key as string),
    sizeBytes: f.size_bytes,
    createdAt: f.created_at,
  })),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const id = searchParams.get('id');
  const supabase = getSupabase(req);

  let query = supabase
    .from('home_docs')
    .select('*, home_doc_files(*)')
    .order('created_at', { ascending: false });

  if (id) query = query.eq('id', id);
  else if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  const mapped = (data ?? []).map(toDoc);
  return Response.json(id ? (mapped[0] ?? null) : mapped);
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REQUEST_BYTES)
    return Response.json({ error: 'Request too large.' }, { status: 413 });

  const supabase = getSupabase(req);
  const { name, description, category, homeId, files } = (await req.json()) as {
    name: string;
    description: string;
    category: string;
    homeId: number;
    files: RawFile[];
  };

  try {
    validateFileCount(files);
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  let processedFiles: Awaited<ReturnType<typeof processFile>>[];
  try {
    processedFiles = await Promise.all(files.map(processFile));
  } catch (e) {
    if (e instanceof FileValidationError)
      return Response.json(
        { error: e.message },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    throw e;
  }

  const { data: doc, error: docError } = await supabase
    .from('home_docs')
    .insert({
      name,
      description: description || null,
      category,
      home_id: homeId,
    })
    .select()
    .single();

  if (docError || !doc)
    return Response.json(
      { error: docError?.message ?? 'Failed to create document.' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  await Promise.all(
    processedFiles.map(async (pf, i) => {
      const ext = pf.mimeType === 'application/pdf' ? 'pdf' : 'jpg';
      const r2Key = `docs/${doc.id}/${crypto.randomUUID()}.${ext}`;
      await uploadFile(r2Key, pf.buffer, pf.mimeType);
      await supabase.from('home_doc_files').insert({
        doc_id: doc.id,
        name: files[i].name,
        mime_type: pf.mimeType,
        r2_key: r2Key,
        size_bytes: pf.sizeBytes,
        sort_order: i,
      });
    }),
  );

  return Response.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id, name, description, category } = await req.json();

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const { error } = await supabase
    .from('home_docs')
    .update({ name, description: description || null, category })
    .eq('id', id);

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id } = await req.json();

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const { data: docFiles } = await supabase
    .from('home_doc_files')
    .select('r2_key')
    .eq('doc_id', id);

  const { error } = await supabase.from('home_docs').delete().eq('id', id);
  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  await Promise.allSettled((docFiles ?? []).map(f => deleteFile(f.r2_key)));

  return Response.json({ success: true });
}
