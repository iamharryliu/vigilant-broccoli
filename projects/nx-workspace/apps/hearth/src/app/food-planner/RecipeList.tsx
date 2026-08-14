'use client';

import { useCallback, useMemo, useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import ReactMarkdown, { type Components } from 'react-markdown';
import {
  CRUDItemFormDialog,
  CRUDItemList,
  DocsExplorer,
  type DocsExplorerAction,
  type DocsNode,
  type DocsSearchResult,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Input,
  Text,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { MOCK_RECIPES, MockRecipe } from './recipes.consts';
import { RecipeForm } from './RecipeForm';
import { AddToGroceryDialog } from './AddToGroceryDialog';
import { AddToCalendarDialog } from './AddToCalendarDialog';

const ADD_TO_GROCERY_LABEL = 'Add to grocery list';
const ADD_TO_CALENDAR_LABEL = 'Add to calendar';
const RECIPES_SIDEBAR_TITLE = 'Recipes';
const RECIPES_SEARCH_PLACEHOLDER =
  'Search recipes (e.g. pork, pasta, curry)...';
const RECIPES_EMPTY_MESSAGE = 'Select a recipe to view it';
const RECIPE_NOT_FOUND_ERROR = 'Recipe not found';
const RECIPE_PARAM = 'recipe';

const getRecipeParam = () =>
  new URLSearchParams(window.location.search).get(RECIPE_PARAM);

const setRecipeParam = (path: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(RECIPE_PARAM, path);
  window.history.pushState(null, '', `?${params.toString()}`);
};

const COPY = {
  LIST: { TITLE: 'Recipes', EMPTY_MESSAGE: 'No recipes yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Recipe',
    DESCRIPTION: 'Add a recipe with its ingredients and method.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Edit Recipe',
    DESCRIPTION: 'Edit the title, description, and recipe markdown.',
  },
};

const DEFAULT_FORM: MockRecipe = {
  id: '',
  title: '',
  description: '',
  markdown: '',
};

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => <h1 className="mb-2 text-xl font-bold">{children}</h1>,
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-lg font-semibold">{children}</h2>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-[var(--gray-a11)]">{children}</p>
  ),
  ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
};

const matchesQuery = (query: string, recipe: MockRecipe): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchText = [recipe.title, recipe.description, recipe.markdown]
    .join(' ')
    .toLowerCase();
  return q.split(' ').every(word => searchText.includes(word));
};

const RecipeListItem = ({ item }: { item: MockRecipe }) => (
  <div className="min-w-0">
    <Text weight="bold" size="2" as="p">
      {item.title}
    </Text>
    <Text size="1" color="gray" as="p">
      {item.description}
    </Text>
  </div>
);

type Props = {
  onGroceryAdded: () => void;
  onCalendarEventAdded?: () => void;
};

export function RecipeList({ onGroceryAdded, onCalendarEventAdded }: Props) {
  const [recipes, setRecipes] = useState<MockRecipe[]>(MOCK_RECIPES);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<MockRecipe | null>(null);
  const [groceryTarget, setGroceryTarget] = useState<MockRecipe | null>(null);
  const [calendarTarget, setCalendarTarget] = useState<MockRecipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<MockRecipe | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const urlSync = useMemo(
    () => ({ get: getRecipeParam, set: setRecipeParam }),
    [],
  );

  const createItem = async (item: MockRecipe): Promise<MockRecipe> => ({
    ...item,
    id: crypto.randomUUID(),
  });

  const updateItem = async (): Promise<void> => undefined;
  const deleteItem = async (): Promise<void> => undefined;

  const filtered = recipes.filter(recipe => matchesQuery(query, recipe));

  const nodes: DocsNode[] = useMemo(
    () =>
      recipes.map(recipe => ({
        name: recipe.title,
        path: recipe.id,
        type: 'file' as const,
      })),
    [recipes],
  );

  const getContent = useCallback(
    async (path: string): Promise<string> => {
      const recipe = recipes.find(r => r.id === path);
      if (!recipe) throw new Error(RECIPE_NOT_FOUND_ERROR);
      setSelectedRecipeId(path);
      return recipe.markdown;
    },
    [recipes],
  );

  const search = useCallback(
    async (searchQuery: string): Promise<DocsSearchResult[]> =>
      recipes
        .filter(recipe => matchesQuery(searchQuery, recipe))
        .map(recipe => ({
          name: recipe.title,
          path: recipe.id,
          matchType: 'filename' as const,
          score: 0,
          excerpt: recipe.description,
        })),
    [recipes],
  );

  const renderContent = useCallback(
    (content: string) => (
      <div className="px-4 sm:px-6 py-4">
        <ReactMarkdown components={MARKDOWN_COMPONENTS}>
          {content}
        </ReactMarkdown>
      </div>
    ),
    [],
  );

  const submitEdit = async (item: MockRecipe): Promise<void> => {
    await updateItem();
    setRecipes(prev => prev.map(r => (r.id === item.id ? item : r)));
  };

  const extraActions = useCallback(
    (path: string): DocsExplorerAction[] => {
      const recipe = recipes.find(r => r.id === path);
      if (!recipe) return [];
      return [
        {
          label: ADD_TO_GROCERY_LABEL,
          onSelect: () => setGroceryTarget(recipe),
        },
        {
          label: ADD_TO_CALENDAR_LABEL,
          onSelect: () => setCalendarTarget(recipe),
        },
      ];
    },
    [recipes],
  );

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6 p-2 sm:p-6 md:hidden">
        <Input
          placeholder={RECIPES_SEARCH_PLACEHOLDER}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <CRUDItemList
          items={filtered}
          setItems={setRecipes}
          createItem={createItem}
          createItemFormDefaultValues={DEFAULT_FORM}
          updateItem={updateItem}
          deleteItem={deleteItem}
          FormComponent={RecipeForm}
          ListItemComponent={RecipeListItem}
          copy={COPY}
          getItemTitle={item => item.title}
          onItemClick={item => setDetail(item)}
          itemActions={item => [
            {
              label: ADD_TO_GROCERY_LABEL,
              onSelect: () => setGroceryTarget(item),
            },
            {
              label: ADD_TO_CALENDAR_LABEL,
              onSelect: () => setCalendarTarget(item),
            },
          ]}
        />

        <Dialog.Root
          open={detail !== null}
          onOpenChange={open => {
            if (!open) setDetail(null);
          }}
        >
          <Dialog.Content
            className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
            style={{ maxWidth: 560 }}
          >
            <Dialog.Title>{detail?.title}</Dialog.Title>
            {detail && (
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                {detail.markdown}
              </ReactMarkdown>
            )}
          </Dialog.Content>
        </Dialog.Root>
      </div>

      <div className="hidden md:flex md:h-[75vh] md:flex-col">
        <DocsExplorer
          nodes={nodes}
          getContent={getContent}
          renderContent={renderContent}
          search={search}
          sidebarTitle={RECIPES_SIDEBAR_TITLE}
          searchPlaceholder={RECIPES_SEARCH_PLACEHOLDER}
          emptyMessage={RECIPES_EMPTY_MESSAGE}
          urlSync={urlSync}
          onCreate={() => setCreateOpen(true)}
          onEdit={() => {
            const recipe = recipes.find(r => r.id === selectedRecipeId);
            if (recipe) setEditTarget(recipe);
          }}
          extraActions={extraActions}
        />
      </div>

      <CRUDItemFormDialog
        formType={FORM_TYPE.CREATE}
        initialFormValues={DEFAULT_FORM}
        FormComponent={RecipeForm}
        copy={COPY}
        open={createOpen}
        onOpenChange={setCreateOpen}
        submitHandler={async item => {
          const created = await createItem(item);
          setRecipes(prev => [...prev, created]);
        }}
      />

      <CRUDItemFormDialog
        formType={FORM_TYPE.UPDATE}
        initialFormValues={editTarget ?? DEFAULT_FORM}
        FormComponent={RecipeForm}
        copy={COPY}
        open={editTarget !== null}
        onOpenChange={open => {
          if (!open) setEditTarget(null);
        }}
        submitHandler={async item => {
          await submitEdit(item);
          setEditTarget(null);
        }}
      />

      <AddToGroceryDialog
        recipe={groceryTarget}
        onClose={() => setGroceryTarget(null)}
        onAdded={onGroceryAdded}
      />

      <AddToCalendarDialog
        recipe={calendarTarget}
        onClose={() => setCalendarTarget(null)}
        onAdded={() => onCalendarEventAdded?.()}
      />
    </>
  );
}
