import { RecipeTags, RecipeTagsStatus } from './recipe-tags.consts';

export type Recipe = {
  id: string;
  title: string;
  description: string;
  markdown: string;
  tags: RecipeTags;
  tagsStatus: RecipeTagsStatus | null;
  tagsAttemptedAt: string | null;
  revision: number;
  tagsRevision: number;
  /** Form-only fields; never persisted or returned by the API. */
  generateTags?: boolean;
  tagsEdited?: boolean;
};
