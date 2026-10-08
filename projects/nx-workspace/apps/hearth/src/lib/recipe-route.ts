import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient, getBearerToken } from '../../libs/supabase-server';
import {
  normalizeTags,
  RecipeTagsStatus,
} from '../app/food-planner/recipe-tags.consts';

export const getRecipesSupabase = (req: NextRequest) =>
  createServerClient(getBearerToken(req));

export const toRecipe = (row: Record<string, unknown>) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? '',
  markdown: row.markdown,
  homeId: row.home_id,
  tags: normalizeTags(row.tags),
  tagsStatus: (row.tags_status ?? null) as RecipeTagsStatus | null,
  tagsAttemptedAt: row.tags_attempted_at ?? null,
  revision: row.revision ?? 1,
  tagsRevision: row.tags_revision ?? 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const recipeError = (status: number, message: string, code?: string) =>
  Response.json(code ? { error: message, code } : { error: message }, {
    status,
  });

export const serverError = (message: string) =>
  recipeError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, message);

export const badRequest = (message: string) =>
  recipeError(HTTP_STATUS_CODES.BAD_REQUEST, message);
