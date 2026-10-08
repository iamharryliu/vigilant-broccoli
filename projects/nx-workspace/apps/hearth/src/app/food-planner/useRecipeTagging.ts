import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { Recipe } from './recipes.types';

const RECIPES_ENDPOINT = '/api/food-planner/recipes';
const GENERATE_TAGS_PATH = 'generate-tags';
const TAGGING_CONCURRENCY = 3;

export const TAGGING_ERROR = {
  STALE: 'ERROR_STALE',
  FAILED: 'ERROR_FAILED',
} as const;

type TaggingError = (typeof TAGGING_ERROR)[keyof typeof TAGGING_ERROR];

export type TaggingProgress = {
  total: number;
  done: number;
  failed: number;
  finished: boolean;
};

type Options = {
  jsonHeaders: () => Record<string, string>;
  setRecipes: Dispatch<SetStateAction<Recipe[]>>;
  refreshRecipes: () => Promise<void>;
};

export const useRecipeTagging = ({
  jsonHeaders,
  setRecipes,
  refreshRecipes,
}: Options) => {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, TaggingError>>({});
  const [progress, setProgress] = useState<TaggingProgress | null>(null);

  const setPending = (id: string, pending: boolean) =>
    setPendingIds(prev => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });

  const setError = (id: string, error: TaggingError | null) =>
    setErrors(prev => {
      const { [id]: _removed, ...rest } = prev;
      return error ? { ...rest, [id]: error } : rest;
    });

  const generateTags = useCallback(
    async (id: string): Promise<boolean> => {
      setPending(id, true);
      setError(id, null);
      try {
        const res = await fetch(
          `${RECIPES_ENDPOINT}/${encodeURIComponent(id)}/${GENERATE_TAGS_PATH}`,
          { method: HTTP_METHOD.POST, headers: jsonHeaders() },
        );
        if (res.ok) {
          const updated: Recipe = await res.json();
          setRecipes(prev => prev.map(r => (r.id === id ? updated : r)));
          return true;
        }
        setError(
          id,
          res.status === HTTP_STATUS_CODES.CONFLICT
            ? TAGGING_ERROR.STALE
            : TAGGING_ERROR.FAILED,
        );
      } catch {
        setError(id, TAGGING_ERROR.FAILED);
      } finally {
        setPending(id, false);
      }
      await refreshRecipes();
      return false;
    },
    [jsonHeaders, setRecipes, refreshRecipes],
  );

  const generateTagsForBatch = useCallback(
    async (ids: string[]) => {
      let next = 0;
      let done = 0;
      let failed = 0;
      setProgress({ total: ids.length, done, failed, finished: false });

      const worker = async () => {
        while (next < ids.length) {
          const id = ids[next++];
          if (!(await generateTags(id))) failed += 1;
          done += 1;
          setProgress({ total: ids.length, done, failed, finished: false });
        }
      };
      await Promise.all(
        Array.from(
          { length: Math.min(TAGGING_CONCURRENCY, ids.length) },
          worker,
        ),
      );
      setProgress({ total: ids.length, done, failed, finished: true });
    },
    [generateTags],
  );

  return {
    pendingIds,
    errors,
    progress,
    clearProgress: () => setProgress(null),
    generateTags,
    generateTagsForBatch,
  };
};
