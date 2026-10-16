import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  badRequest,
  getRecipesSupabase as getSupabase,
  recipeError,
  serverError,
  toRecipe,
} from '../../../../lib/recipe-route';
import {
  RECIPE_TAG_CATEGORIES,
  RECIPE_TAG_ERROR_CODE,
  RECIPE_TAG_VOCABULARY,
  normalizeTags,
} from '../../../food-planner/recipe-tags.consts';

export const runtime = 'nodejs';

const MAX_IMPORT_RECIPES = 200;
const STALE_TAGS_MESSAGE =
  'Tags changed since this recipe was loaded. Refresh and try again.';
const RECIPE_NOT_FOUND_MESSAGE = 'Recipe not found.';

interface RecipeInput {
  title: string;
  description?: string;
  markdown: string;
}

const TagsPatchSchema = z.object(
  Object.fromEntries(
    RECIPE_TAG_CATEGORIES.map(category => [
      category,
      z.array(z.enum(RECIPE_TAG_VOCABULARY[category] as [string, ...string[]])),
    ]),
  ),
);

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

    return Response.json({
      success: true,
      imported: data.length,
      recipeIds: data.map(row => row.id),
    });
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
  const { id, tags, tagsRevision, ...body } = (await req.json()) as {
    id: string;
    title?: string;
    description?: string;
    markdown?: string;
    tags?: unknown;
    tagsRevision?: number;
  };

  if (!id) return badRequest('Missing id');

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.markdown !== undefined) updates.markdown = body.markdown;

  if (tags !== undefined) {
    const parsedTags = TagsPatchSchema.safeParse(tags);
    if (!parsedTags.success) return badRequest('Invalid tags.');
    if (!Number.isInteger(tagsRevision))
      return badRequest('tagsRevision is required when updating tags.');
    updates.tags = normalizeTags(parsedTags.data);
  }

  let query = supabase.from('recipes').update(updates).eq('id', id);
  if (tags !== undefined) query = query.eq('tags_revision', tagsRevision);

  const { data, error } = await query.select().maybeSingle();

  if (error) return serverError(error.message);
  if (!data)
    return tags !== undefined
      ? recipeError(
          HTTP_STATUS_CODES.CONFLICT,
          STALE_TAGS_MESSAGE,
          RECIPE_TAG_ERROR_CODE.TAGS_CONFLICT,
        )
      : recipeError(HTTP_STATUS_CODES.INVALID_PATH, RECIPE_NOT_FOUND_MESSAGE);

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
