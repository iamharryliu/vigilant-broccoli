'use client';

import { useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import ReactMarkdown, { type Components } from 'react-markdown';
import {
  CRUDItemList,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Input,
  Text,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { MOCK_RECIPES, MockRecipe } from './recipes.consts';
import { RecipeForm } from './RecipeForm';
import { AddToGroceryDialog } from './AddToGroceryDialog';

const ADD_TO_GROCERY_LABEL = 'Add to grocery list';

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
};

export function RecipeList({ onGroceryAdded }: Props) {
  const [recipes, setRecipes] = useState<MockRecipe[]>(MOCK_RECIPES);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<MockRecipe | null>(null);
  const [groceryTarget, setGroceryTarget] = useState<MockRecipe | null>(null);

  const createItem = async (item: MockRecipe): Promise<MockRecipe> => ({
    ...item,
    id: crypto.randomUUID(),
  });

  const updateItem = async (): Promise<void> => undefined;
  const deleteItem = async (): Promise<void> => undefined;

  const filtered = recipes.filter(recipe => matchesQuery(query, recipe));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-2 sm:p-6">
      <Input
        placeholder="Search recipes (e.g. pork, pasta, curry)..."
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

      <AddToGroceryDialog
        recipe={groceryTarget}
        onClose={() => setGroceryTarget(null)}
        onAdded={onGroceryAdded}
      />
    </div>
  );
}
