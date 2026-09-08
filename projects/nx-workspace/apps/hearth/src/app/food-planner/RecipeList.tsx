'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import ReactMarkdown, { type Components } from 'react-markdown';
import {
  Button,
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
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { Recipe } from './recipes.types';
import { RecipeForm } from './RecipeForm';
import { AddToGroceryDialog } from './AddToGroceryDialog';
import { AddToCalendarDialog } from './AddToCalendarDialog';

const RECIPES_ENDPOINT = '/api/food-planner/recipes';
const ADD_TO_GROCERY_LABEL = 'Add to grocery list';
const ADD_TO_CALENDAR_LABEL = 'Add to calendar';
const DELETE_RECIPE_LABEL = 'Delete recipe';
const LOADING_RECIPES_LABEL = 'Loading recipes…';
const IMPORT_LABEL = 'Import files';
const IMPORT_FOLDER_LABEL = 'Import folder';
const IMPORTING_LABEL = 'Importing…';
const IMPORT_ACCEPT = '.md,.markdown,text/markdown';
const MARKDOWN_EXTENSION_RE = /\.(md|markdown)$/i;
const TITLE_HEADING_RE = /^#\s+(.+)$/m;
const RECIPES_SIDEBAR_TITLE = 'Recipes';
const RECIPES_SEARCH_PLACEHOLDER =
  'Search recipes (e.g. pork, pasta, curry)...';
const RECIPES_EMPTY_MESSAGE = 'Select a recipe to view it';
const RECIPE_NOT_FOUND_ERROR = 'Recipe not found';
const RECIPE_PARAM = 'recipe';

const titleFromFilename = (filename: string) =>
  filename
    .replace(/\.(md|markdown)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

const parseImportedFile = (filename: string, markdown: string) => ({
  title:
    markdown.match(TITLE_HEADING_RE)?.[1].trim() || titleFromFilename(filename),
  description: '',
  markdown,
});

// webkitdirectory/directory aren't in React's input typings but are widely
// supported for letting the OS picker select a whole folder (incl. subfolders).
const DIRECTORY_INPUT_PROPS = { webkitdirectory: '', directory: '' };

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

const DEFAULT_FORM: Recipe = {
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

const matchesQuery = (query: string, recipe: Recipe): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchText = [recipe.title, recipe.description, recipe.markdown]
    .join(' ')
    .toLowerCase();
  return q.split(' ').every(word => searchText.includes(word));
};

const RecipeListItem = ({ item }: { item: Recipe }) => (
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
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';
  const jsonHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token],
  );

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<Recipe | null>(null);
  const [groceryTarget, setGroceryTarget] = useState<Recipe | null>(null);
  const [calendarTarget, setCalendarTarget] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const importFolderInputRef = useRef<HTMLInputElement>(null);
  const urlSync = useMemo(
    () => ({ get: getRecipeParam, set: setRecipeParam }),
    [],
  );

  useEffect(() => {
    setRecipesLoaded(false);
  }, [homeId]);

  const fetchRecipes = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${RECIPES_ENDPOINT}?homeId=${homeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRecipes(Array.isArray(data) ? data : []);
    setRecipesLoaded(true);
  }, [homeId, token]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const createItem = async (item: Recipe): Promise<Recipe> => {
    const res = await fetch(RECIPES_ENDPOINT, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        homeId,
        title: item.title,
        description: item.description,
        markdown: item.markdown,
      }),
    });
    return res.json();
  };

  const updateItem = async (item: Recipe): Promise<void> => {
    await fetch(RECIPES_ENDPOINT, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({
        id: item.id,
        title: item.title,
        description: item.description,
        markdown: item.markdown,
      }),
    });
  };

  const deleteItem = async (id: string | number): Promise<void> => {
    if (selectedRecipeId === id) setSelectedRecipeId(null);
    await fetch(RECIPES_ENDPOINT, {
      method: 'DELETE',
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  };

  const handleDeleteSelected = async (ids: string[]): Promise<void> => {
    await Promise.all(ids.map(id => deleteItem(id)));
    setRecipes(prev => prev.filter(r => !ids.includes(r.id)));
  };

  const handleImportFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []).filter(file =>
      MARKDOWN_EXTENSION_RE.test(file.name),
    );
    if (!files.length || !homeId) return;
    setImporting(true);
    try {
      const parsed = await Promise.all(
        files.map(async file =>
          parseImportedFile(file.name, await file.text()),
        ),
      );
      await fetch(RECIPES_ENDPOINT, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ homeId, recipes: parsed }),
      });
      await fetchRecipes();
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
      if (importFolderInputRef.current) importFolderInputRef.current.value = '';
    }
  };

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

  const submitEdit = async (item: Recipe): Promise<void> => {
    await updateItem(item);
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
        {
          label: DELETE_RECIPE_LABEL,
          onSelect: async () => {
            await deleteItem(recipe.id);
            setRecipes(prev => prev.filter(r => r.id !== recipe.id));
          },
        },
      ];
    },
    [recipes, deleteItem],
  );

  const sidebarActions: DocsExplorerAction[] = useMemo(
    () => [
      { label: IMPORT_LABEL, onSelect: () => importInputRef.current?.click() },
      {
        label: IMPORT_FOLDER_LABEL,
        onSelect: () => importFolderInputRef.current?.click(),
      },
    ],
    [],
  );

  const importInput = (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept={IMPORT_ACCEPT}
        multiple
        hidden
        onChange={e => handleImportFiles(e.target.files)}
      />
      <input
        ref={importFolderInputRef}
        type="file"
        hidden
        {...DIRECTORY_INPUT_PROPS}
        onChange={e => handleImportFiles(e.target.files)}
      />
      <Button
        variant="outline"
        disabled={importing}
        onClick={() => importInputRef.current?.click()}
      >
        {importing ? IMPORTING_LABEL : IMPORT_LABEL}
      </Button>
      <Button
        variant="outline"
        disabled={importing}
        onClick={() => importFolderInputRef.current?.click()}
      >
        {importing ? IMPORTING_LABEL : IMPORT_FOLDER_LABEL}
      </Button>
    </>
  );

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6 p-2 sm:p-6 md:hidden">
        <div className="flex flex-wrap gap-2">
          <Input
            className="grow"
            placeholder={RECIPES_SEARCH_PLACEHOLDER}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {importInput}
        </div>
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

      <div className="hidden md:flex md:h-full md:flex-col">
        {recipesLoaded ? (
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
            sidebarActions={sidebarActions}
            onEdit={() => {
              const recipe = recipes.find(r => r.id === selectedRecipeId);
              if (recipe) setEditTarget(recipe);
            }}
            extraActions={extraActions}
            onDeleteSelected={handleDeleteSelected}
          />
        ) : (
          <Text color="gray" size="2" className="p-4">
            {LOADING_RECIPES_LABEL}
          </Text>
        )}
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
