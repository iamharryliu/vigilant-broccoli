'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import {
  Button,
  Callout,
  Checkbox,
  CRUDItemFormDialog,
  CRUDItemList,
  DocsExplorer,
  type DocsExplorerAction,
  type DocsNode,
  type DocsSearchResult,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Input,
  Text,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
} from '@vigilant-broccoli/react-lib';
import {
  FORM_TYPE,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { Recipe } from './recipes.types';
import { RecipeForm } from './RecipeForm';
import { AddToGroceryDialog } from './AddToGroceryDialog';
import { AddToCalendarDialog } from './AddToCalendarDialog';
import { RecipeApiError } from './recipe-errors';
import {
  getRecipeTagSearchText,
  getTagActionPath,
  RecipeTagsPanel,
  useTagLabels,
} from './RecipeTags';
import { createEmptyTags } from './recipe-tags.consts';
import { useRecipeTagging } from './useRecipeTagging';
import { useRecipeTranslation } from './useRecipeTranslation';

const RECIPES_ENDPOINT = '/api/food-planner/recipes';
const IMPORT_ACCEPT = '.md,.markdown,text/markdown';
const MARKDOWN_EXTENSION_RE = /\.(md|markdown)$/i;
const TITLE_HEADING_RE = /^#\s+(.+)$/m;
const RECIPE_PARAM = 'recipe';
const GENERATE_ON_IMPORT_INPUT_ID = 'recipe-import-generate-tags';

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

const DEFAULT_FORM: Recipe = {
  id: '',
  title: '',
  description: '',
  markdown: '',
  tags: createEmptyTags(),
  tagsStatus: null,
  tagsAttemptedAt: null,
  revision: 1,
  tagsRevision: 1,
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

const matchesQuery = (
  query: string,
  recipe: Recipe,
  valueLabel: (value: string) => string,
): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchText = [
    recipe.title,
    recipe.description,
    recipe.markdown,
    getRecipeTagSearchText(recipe, valueLabel),
  ]
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

type ImportSummary = { saved: number; generateTags: boolean };

export function RecipeList({ onGroceryAdded, onCalendarEventAdded }: Props) {
  const t = useRecipeTranslation();
  const { valueLabel } = useTagLabels();
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
  const [detailId, setDetailId] = useState<string | null>(null);
  const [groceryTarget, setGroceryTarget] = useState<Recipe | null>(null);
  const [calendarTarget, setCalendarTarget] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [generateOnImport, setGenerateOnImport] = useState(true);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null,
  );
  const [errorPath, setErrorPath] = useState<string | null>(null);
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
    if (!res.ok) {
      setErrorPath('ERRORS.LOAD_FAILED');
      return;
    }
    const data = await res.json();
    setRecipes(Array.isArray(data) ? data : []);
    setRecipesLoaded(true);
  }, [homeId, token]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const tagging = useRecipeTagging({
    jsonHeaders,
    setRecipes,
    refreshRecipes: fetchRecipes,
  });

  const createItem = async (item: Recipe): Promise<Recipe> => {
    const res = await fetch(RECIPES_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: jsonHeaders(),
      body: JSON.stringify({
        homeId,
        title: item.title,
        description: item.description,
        markdown: item.markdown,
      }),
    });
    if (!res.ok) throw new RecipeApiError('ERRORS.SAVE_FAILED');
    const created: Recipe = await res.json();
    if (item.generateTags) void tagging.generateTags(created.id);
    return created;
  };

  // CRUDItemList stores the submitted item once this resolves, so fold the
  // persisted row into it to keep client state equal to the server's.
  const updateItem = async (item: Recipe): Promise<void> => {
    const res = await fetch(RECIPES_ENDPOINT, {
      method: HTTP_METHOD.PATCH,
      headers: jsonHeaders(),
      body: JSON.stringify({
        id: item.id,
        title: item.title,
        description: item.description,
        markdown: item.markdown,
        ...(item.tagsEdited
          ? { tags: item.tags, tagsRevision: item.tagsRevision }
          : {}),
      }),
    });
    if (!res.ok) {
      if (res.status === HTTP_STATUS_CODES.CONFLICT) {
        await fetchRecipes();
        throw new RecipeApiError('TAGS.ERROR_CONFLICT');
      }
      throw new RecipeApiError('ERRORS.SAVE_FAILED');
    }
    const persisted: Recipe = await res.json();
    Object.assign(item, persisted, { tagsEdited: false });
  };

  const deleteItem = async (id: string | number): Promise<void> => {
    const res = await fetch(RECIPES_ENDPOINT, {
      method: HTTP_METHOD.DELETE,
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setErrorPath('ERRORS.DELETE_FAILED');
      throw new RecipeApiError('ERRORS.DELETE_FAILED');
    }
    if (selectedRecipeId === id) setSelectedRecipeId(null);
  };

  const handleDeleteSelected = async (ids: string[]): Promise<void> => {
    const results = await Promise.allSettled(ids.map(id => deleteItem(id)));
    const deleted = ids.filter((_, i) => results[i].status === 'fulfilled');
    setRecipes(prev => prev.filter(r => !deleted.includes(r.id)));
  };

  const handleImportFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []).filter(file =>
      MARKDOWN_EXTENSION_RE.test(file.name),
    );
    if (!files.length || !homeId) return;
    setImporting(true);
    setErrorPath(null);
    setImportSummary(null);
    tagging.clearProgress();
    let savedIds: string[] = [];
    try {
      const parsed = await Promise.all(
        files.map(async file =>
          parseImportedFile(file.name, await file.text()),
        ),
      );
      const res = await fetch(RECIPES_ENDPOINT, {
        method: HTTP_METHOD.POST,
        headers: jsonHeaders(),
        body: JSON.stringify({ homeId, recipes: parsed }),
      });
      if (!res.ok) {
        setErrorPath('ERRORS.IMPORT_FAILED');
        return;
      }
      const { recipeIds } = (await res.json()) as { recipeIds: string[] };
      savedIds = recipeIds;
      await fetchRecipes();
      setImportSummary({
        saved: savedIds.length,
        generateTags: generateOnImport,
      });
    } catch {
      setErrorPath('ERRORS.IMPORT_FAILED');
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
      if (importFolderInputRef.current) importFolderInputRef.current.value = '';
    }
    if (generateOnImport && savedIds.length)
      await tagging.generateTagsForBatch(savedIds);
  };

  const filtered = recipes.filter(recipe =>
    matchesQuery(query, recipe, valueLabel),
  );
  const detail = recipes.find(r => r.id === detailId) ?? null;
  const taggingBusy = Boolean(tagging.progress && !tagging.progress.finished);

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
      if (!recipe) throw new Error(t('NOT_FOUND'));
      setSelectedRecipeId(path);
      return recipe.markdown;
    },
    [recipes, t],
  );

  const search = useCallback(
    async (searchQuery: string): Promise<DocsSearchResult[]> =>
      recipes
        .filter(recipe => matchesQuery(searchQuery, recipe, valueLabel))
        .map(recipe => ({
          name: recipe.title,
          path: recipe.id,
          matchType: 'filename' as const,
          score: 0,
          excerpt: recipe.description,
        })),
    [recipes, valueLabel],
  );

  const renderTagsPanel = (recipe: Recipe) => (
    <RecipeTagsPanel
      recipe={recipe}
      pending={tagging.pendingIds.has(recipe.id)}
      error={tagging.errors[recipe.id]}
      onGenerate={() => void tagging.generateTags(recipe.id)}
    />
  );

  const renderContent = (
    content: string,
    _navigate: (path: string) => void,
    sourcePaths: string[],
  ) => {
    const recipe =
      sourcePaths.length === 1
        ? recipes.find(r => r.id === sourcePaths[0])
        : undefined;
    return (
      <div className="px-4 sm:px-6 py-4">
        {recipe && renderTagsPanel(recipe)}
        <ReactMarkdown components={MARKDOWN_COMPONENTS}>
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const submitEdit = async (item: Recipe): Promise<void> => {
    await updateItem(item);
    setRecipes(prev => prev.map(r => (r.id === item.id ? item : r)));
  };

  const tagAction = (recipe: Recipe) => ({
    label: t(getTagActionPath(recipe)),
    onSelect: () => void tagging.generateTags(recipe.id),
  });

  const extraActions = (path: string): DocsExplorerAction[] => {
    const recipe = recipes.find(r => r.id === path);
    if (!recipe) return [];
    return [
      {
        label: t('ADD_TO_GROCERY'),
        onSelect: () => setGroceryTarget(recipe),
      },
      {
        label: t('ADD_TO_CALENDAR'),
        onSelect: () => setCalendarTarget(recipe),
      },
      tagAction(recipe),
      {
        label: t('DELETE'),
        onSelect: async () => {
          await deleteItem(recipe.id).then(
            () => setRecipes(prev => prev.filter(r => r.id !== recipe.id)),
            () => undefined,
          );
        },
      },
    ];
  };

  const sidebarActions: DocsExplorerAction[] = [
    { label: t('IMPORT'), onSelect: () => importInputRef.current?.click() },
    {
      label: t('IMPORT_FOLDER'),
      onSelect: () => importFolderInputRef.current?.click(),
    },
  ];

  const copy = {
    LIST: {
      TITLE: t('LIST.TITLE'),
      EMPTY_MESSAGE: t('LIST.EMPTY_MESSAGE'),
    },
    [FORM_TYPE.CREATE]: {
      TITLE: t('CREATE.TITLE'),
      DESCRIPTION: t('CREATE.DESCRIPTION'),
    },
    [FORM_TYPE.UPDATE]: {
      TITLE: t('UPDATE.TITLE'),
      DESCRIPTION: t('UPDATE.DESCRIPTION'),
    },
  };

  const generateOnImportCheckbox = (
    <label
      htmlFor={GENERATE_ON_IMPORT_INPUT_ID}
      className="flex items-center gap-2"
    >
      <Checkbox
        id={GENERATE_ON_IMPORT_INPUT_ID}
        checked={generateOnImport}
        disabled={importing || taggingBusy}
        onCheckedChange={checked => setGenerateOnImport(checked === true)}
      />
      <Text size="2">{t('TAGS.GENERATE_AUTOMATICALLY')}</Text>
    </label>
  );

  const { progress } = tagging;
  const statusBanner = (errorPath || importSummary || progress) && (
    <div className="flex flex-col gap-2" aria-live="polite">
      {errorPath && <Callout color="red">{t(errorPath)}</Callout>}
      {importSummary && (
        <Callout color="green">
          {t('IMPORT_RESULT.SAVED', { saved: importSummary.saved })}{' '}
          {!importSummary.generateTags && t('IMPORT_RESULT.TAGGING_SKIPPED')}
        </Callout>
      )}
      {progress && (
        <Callout color={progress.failed ? 'orange' : 'blue'}>
          {progress.finished
            ? t('IMPORT_RESULT.TAGGING_DONE', {
                succeeded: progress.done - progress.failed,
                failed: progress.failed,
              })
            : t('IMPORT_RESULT.TAGGING_PROGRESS', {
                done: progress.done,
                total: progress.total,
              })}
        </Callout>
      )}
    </div>
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
        disabled={importing || taggingBusy}
        onClick={() => importInputRef.current?.click()}
      >
        {importing ? t('IMPORTING') : t('IMPORT')}
      </Button>
      <Button
        variant="outline"
        disabled={importing || taggingBusy}
        onClick={() => importFolderInputRef.current?.click()}
      >
        {importing ? t('IMPORTING') : t('IMPORT_FOLDER')}
      </Button>
    </>
  );

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6 p-2 sm:p-6 md:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="grow"
            placeholder={t('SEARCH_PLACEHOLDER')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {importInput}
          {generateOnImportCheckbox}
        </div>
        {statusBanner}
        <CRUDItemList
          items={filtered}
          setItems={setRecipes}
          createItem={createItem}
          createItemFormDefaultValues={DEFAULT_FORM}
          updateItem={updateItem}
          deleteItem={deleteItem}
          FormComponent={RecipeForm}
          ListItemComponent={RecipeListItem}
          copy={copy}
          getItemTitle={item => item.title}
          onItemClick={item => setDetailId(item.id)}
          itemActions={item => [
            {
              label: t('ADD_TO_GROCERY'),
              onSelect: () => setGroceryTarget(item),
            },
            {
              label: t('ADD_TO_CALENDAR'),
              onSelect: () => setCalendarTarget(item),
            },
            tagAction(item),
          ]}
        />

        <Dialog
          open={detail !== null}
          onOpenChange={open => {
            if (!open) setDetailId(null);
          }}
        >
          <DialogContent
            aria-describedby={undefined}
            showCloseButton={false}
            className={cn(
              'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
              FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
            )}
            style={{ maxWidth: 560 }}
          >
            <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
              {detail?.title}
            </DialogTitle>
            {detail && renderTagsPanel(detail)}
            {detail && (
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                {detail.markdown}
              </ReactMarkdown>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="hidden md:flex md:h-full md:flex-col">
        {recipesLoaded ? (
          <>
            <div className="flex flex-col gap-2 pb-2">
              {generateOnImportCheckbox}
              {statusBanner}
            </div>
            <DocsExplorer
              nodes={nodes}
              getContent={getContent}
              renderContent={renderContent}
              search={search}
              sidebarTitle={t('SIDEBAR_TITLE')}
              searchPlaceholder={t('SEARCH_PLACEHOLDER')}
              emptyMessage={t('EMPTY_MESSAGE')}
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
          </>
        ) : (
          <Text color="gray" size="2" className="p-4">
            {t('LOADING')}
          </Text>
        )}
      </div>

      <CRUDItemFormDialog
        formType={FORM_TYPE.CREATE}
        initialFormValues={DEFAULT_FORM}
        FormComponent={RecipeForm}
        copy={copy}
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
        copy={copy}
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
