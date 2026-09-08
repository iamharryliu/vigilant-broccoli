import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const MAX_IMPORT_RECIPES = 200;

interface RecipeInput {
  title: string;
  description?: string;
  markdown: string;
}

const getSupabase = (req: NextRequest) =>
  createServerClient(getBearerToken(req));

const toRecipe = (row: Record<string, unknown>) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  markdown: row.markdown,
  homeId: row.home_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const serverError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const badRequest = (message: string) =>
  Response.json({ error: message }, { status: HTTP_STATUS_CODES.BAD_REQUEST });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const supabase = getSupabase(req);

  let query = supabase.from('recipes').select('*').order('title');
  if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error) return serverError(error.message);

  return Response.json((data ?? []).map(toRecipe));
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = (await req.json()) as {
    homeId: number;
    title?: string;
    description?: string;
    markdown?: string;
    recipes?: RecipeInput[];
  };

  if (!body.homeId) return badRequest('homeId is required.');

  if (body.recipes) {
    if (body.recipes.length === 0) return badRequest('No recipes to import.');
    if (body.recipes.length > MAX_IMPORT_RECIPES)
      return badRequest(
        `Cannot import more than ${MAX_IMPORT_RECIPES} recipes at once.`,
      );

    const { data, error } = await supabase
      .from('recipes')
      .insert(
        body.recipes.map(recipe => ({
          title: recipe.title,
          description: recipe.description || null,
          markdown: recipe.markdown,
          home_id: body.homeId,
        })),
      )
      .select();

    if (error) return serverError(error.message);

    return Response.json({ success: true, imported: data.length });
  }

  if (!body.title?.trim() || !body.markdown?.trim())
    return badRequest('title and markdown are required.');

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      title: body.title,
      description: body.description || null,
      markdown: body.markdown,
      home_id: body.homeId,
    })
    .select()
    .single();

  if (error) return serverError(error.message);

  return Response.json(toRecipe(data));
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id, ...body } = (await req.json()) as {
    id: string;
    title?: string;
    description?: string;
    markdown?: string;
  };

  if (!id) return badRequest('Missing id');

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.markdown !== undefined) updates.markdown = body.markdown;

  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return serverError(error.message);

  return Response.json(toRecipe(data));
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id } = (await req.json()) as { id: string };

  if (!id) return badRequest('Missing id');

  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) return serverError(error.message);

  return Response.json({ success: true });
}
