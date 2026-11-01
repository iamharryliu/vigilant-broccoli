export const RECIPE_TAG_CATEGORY = {
  FLAVOUR: 'flavours',
  TEMPERATURE: 'temperatures',
  METHOD: 'methods',
  TEXTURE: 'textures',
} as const;

export type RecipeTagCategory =
  (typeof RECIPE_TAG_CATEGORY)[keyof typeof RECIPE_TAG_CATEGORY];

export const RECIPE_TAG_CATEGORIES: readonly RecipeTagCategory[] =
  Object.values(RECIPE_TAG_CATEGORY);

export const NO_COOK_METHOD = 'no_cook';

export const RECIPE_TAG_VOCABULARY: Record<
  RecipeTagCategory,
  readonly string[]
> = {
  [RECIPE_TAG_CATEGORY.FLAVOUR]: [
    'sweet',
    'salty',
    'sour',
    'bitter',
    'umami',
    'spicy',
    'smoky',
    'tangy',
    'earthy',
    'fruity',
    'herbal',
    'nutty',
  ],
  [RECIPE_TAG_CATEGORY.TEMPERATURE]: [
    'hot',
    'warm',
    'room_temperature',
    'cold',
    'frozen',
  ],
  [RECIPE_TAG_CATEGORY.METHOD]: [
    'baking',
    'roasting',
    'grilling',
    'broiling',
    'frying',
    'deep_frying',
    'stir_frying',
    'sauteing',
    'boiling',
    'simmering',
    'steaming',
    'poaching',
    'braising',
    'stewing',
    'slow_cooking',
    'pressure_cooking',
    'sous_vide',
    'fermenting',
    'pickling',
    NO_COOK_METHOD,
  ],
  [RECIPE_TAG_CATEGORY.TEXTURE]: [
    'crispy',
    'crunchy',
    'creamy',
    'smooth',
    'chewy',
    'tender',
    'juicy',
    'soft',
    'firm',
    'flaky',
    'crumbly',
    'fluffy',
    'sticky',
  ],
};

export const RECIPE_TAGS_STATUS = {
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
} as const;

export type RecipeTagsStatus =
  (typeof RECIPE_TAGS_STATUS)[keyof typeof RECIPE_TAGS_STATUS];

export type RecipeTags = Record<RecipeTagCategory, string[]>;

export const RECIPE_TAG_ERROR_CODE = {
  STALE: 'RECIPE_STALE',
  NOT_CONFIGURED: 'TAGGING_NOT_CONFIGURED',
  FAILED: 'TAGGING_FAILED',
  TAGS_CONFLICT: 'TAGS_CONFLICT',
} as const;

export const createEmptyTags = (): RecipeTags => ({
  [RECIPE_TAG_CATEGORY.FLAVOUR]: [],
  [RECIPE_TAG_CATEGORY.TEMPERATURE]: [],
  [RECIPE_TAG_CATEGORY.METHOD]: [],
  [RECIPE_TAG_CATEGORY.TEXTURE]: [],
});

const NON_WORD_RE = /[\s-]+/g;

export const normalizeTagValue = (value: string) =>
  value.trim().toLowerCase().replace(NON_WORD_RE, '_');

/**
 * Keeps only whitelisted values, deduplicated, preserving input order.
 * Tolerates legacy rows and malformed JSON by returning empty categories.
 */
export const normalizeTags = (input: unknown): RecipeTags => {
  const source = (input ?? {}) as Partial<Record<RecipeTagCategory, unknown>>;
  const tags = createEmptyTags();
  for (const category of RECIPE_TAG_CATEGORIES) {
    const values = source[category];
    if (!Array.isArray(values)) continue;
    const allowed = new Set(RECIPE_TAG_VOCABULARY[category]);
    const seen = new Set<string>();
    for (const value of values) {
      if (typeof value !== 'string') continue;
      const normalized = normalizeTagValue(value);
      if (!allowed.has(normalized) || seen.has(normalized)) continue;
      seen.add(normalized);
      tags[category].push(normalized);
    }
  }
  return tags;
};

export const hasAnyTags = (tags: RecipeTags) =>
  RECIPE_TAG_CATEGORIES.some(category => tags[category].length > 0);

export const orderByVocabulary = (
  category: RecipeTagCategory,
  values: readonly string[],
) =>
  [...values].sort(
    (a, b) =>
      RECIPE_TAG_VOCABULARY[category].indexOf(a) -
      RECIPE_TAG_VOCABULARY[category].indexOf(b),
  );
