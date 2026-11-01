'use client';

import { useCallback } from 'react';
import { Badge, Button, Text } from '@vigilant-broccoli/react-lib';
import { useRecipeTranslation } from './useRecipeTranslation';
import {
  RECIPE_TAG_CATEGORIES,
  RECIPE_TAG_VOCABULARY,
  RECIPE_TAGS_STATUS,
  RecipeTagCategory,
  RecipeTags as RecipeTagsValue,
  hasAnyTags,
} from './recipe-tags.consts';
import { Recipe } from './recipes.types';
import { TAGGING_ERROR } from './useRecipeTagging';

export const useTagLabels = () => {
  const t = useRecipeTranslation();
  const categoryLabel = useCallback(
    (category: RecipeTagCategory) => t(`TAGS.CATEGORIES.${category}`),
    [t],
  );
  const valueLabel = useCallback(
    (value: string) => t(`TAGS.VALUES.${value}`),
    [t],
  );
  return { t, categoryLabel, valueLabel };
};

export const getRecipeTagSearchText = (
  recipe: Recipe,
  valueLabel: (value: string) => string,
) =>
  RECIPE_TAG_CATEGORIES.flatMap(category => recipe.tags[category])
    .flatMap(value => [value.replace(/_/g, ' '), valueLabel(value)])
    .join(' ');

export const getTagActionPath = (recipe: Recipe) =>
  recipe.tagsStatus === RECIPE_TAGS_STATUS.FAILED
    ? 'TAGS.RETRY'
    : hasAnyTags(recipe.tags)
      ? 'TAGS.REGENERATE'
      : 'TAGS.GENERATE';

export function RecipeTagGroups({ tags }: { tags: RecipeTagsValue }) {
  const { t, categoryLabel, valueLabel } = useTagLabels();
  if (!hasAnyTags(tags))
    return (
      <Text size="1" color="gray" as="p">
        {t('TAGS.NONE')}
      </Text>
    );

  return (
    <dl className="flex flex-col gap-1">
      {RECIPE_TAG_CATEGORIES.filter(category => tags[category].length).map(
        category => (
          <div key={category} className="flex flex-wrap items-center gap-1">
            <dt>
              <Text size="1" weight="medium" color="gray">
                {categoryLabel(category)}
              </Text>
            </dt>
            {tags[category].map(value => (
              <dd key={value}>
                <Badge>{valueLabel(value)}</Badge>
              </dd>
            ))}
          </div>
        ),
      )}
    </dl>
  );
}

type PanelProps = {
  recipe: Recipe;
  pending: boolean;
  error?: (typeof TAGGING_ERROR)[keyof typeof TAGGING_ERROR];
  onGenerate: () => void;
};

export function RecipeTagsPanel({
  recipe,
  pending,
  error,
  onGenerate,
}: PanelProps) {
  const t = useRecipeTranslation();
  const failed = recipe.tagsStatus === RECIPE_TAGS_STATUS.FAILED;
  const succeeded = recipe.tagsStatus === RECIPE_TAGS_STATUS.SUCCEEDED;
  const tagged = hasAnyTags(recipe.tags);

  const status = pending
    ? 'GENERATING'
    : failed
      ? 'STATUS_FAILED'
      : succeeded
        ? tagged
          ? 'STATUS_SUCCEEDED'
          : 'STATUS_SUCCEEDED_EMPTY'
        : tagged
          ? null
          : 'STATUS_NEVER';

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-md border border-[var(--gray-a5)] p-3">
      <Text size="2" weight="bold" as="p">
        {t('TAGS.HEADING')}
      </Text>
      <RecipeTagGroups tags={recipe.tags} />
      {status && (
        <Text size="1" color={failed ? 'red' : 'gray'} as="p" role="status">
          {t(`TAGS.${status}`)}
        </Text>
      )}
      {error && !pending && (
        <Text size="1" color="red" as="p" role="alert">
          {t(`TAGS.${error}`)}
        </Text>
      )}
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={pending}
        onClick={onGenerate}
      >
        {t(getTagActionPath(recipe))}
      </Button>
    </div>
  );
}

type PickerProps = {
  value: RecipeTagsValue;
  onChange: (tags: RecipeTagsValue) => void;
};

export function RecipeTagPicker({ value, onChange }: PickerProps) {
  const { categoryLabel, valueLabel } = useTagLabels();

  const toggle = (category: RecipeTagCategory, tag: string) =>
    onChange({
      ...value,
      [category]: value[category].includes(tag)
        ? value[category].filter(existing => existing !== tag)
        : [...value[category], tag],
    });

  return (
    <div className="flex flex-col gap-2">
      {RECIPE_TAG_CATEGORIES.map(category => (
        <div key={category}>
          <Text size="1" weight="medium" color="gray" as="p" mb="1">
            {categoryLabel(category)}
          </Text>
          <div className="flex flex-wrap gap-1">
            {RECIPE_TAG_VOCABULARY[category].map(tag => {
              const selected = value[category].includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggle(category, tag)}
                >
                  <Badge variant={selected ? 'solid' : 'outline'}>
                    {valueLabel(tag)}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
