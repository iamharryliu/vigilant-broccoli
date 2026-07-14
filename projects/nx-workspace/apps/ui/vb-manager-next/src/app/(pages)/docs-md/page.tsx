'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DocsNode, DocsSearchResult } from '@vigilant-broccoli/react-lib';
import { DocsViewer, FILE_PARAM } from '@vigilant-broccoli/react-utility';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../../libs/auth';

const API = {
  STRUCTURE: '/api/docs/structure',
  CONTENT: '/api/docs/content',
  SEARCH: '/api/docs/search',
} as const;

const ERROR = {
  LOAD_STRUCTURE: 'Failed to load structure',
  LOAD_CONTENT: 'Failed to load content',
  SAVE_CONTENT: 'Failed to save content',
  SEARCH: 'Failed to search',
} as const;

const LOADING_CLS = 'flex items-center justify-center h-full text-gray-500';

const requestDocs = async <T,>(
  url: string,
  fallback: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await authFetch(url, init);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || fallback);
  return data as T;
};

const fetchStructure = async (): Promise<DocsNode[]> => {
  const data = await requestDocs<{ data: DocsNode[] }>(
    API.STRUCTURE,
    ERROR.LOAD_STRUCTURE,
  );
  return data.data;
};

const fetchContent = async (path: string): Promise<string> => {
  const data = await requestDocs<{ content: string }>(
    `${API.CONTENT}?path=${encodeURIComponent(path)}`,
    ERROR.LOAD_CONTENT,
  );
  return data.content;
};

const saveContent = async (path: string, content: string): Promise<void> => {
  await requestDocs(API.CONTENT, ERROR.SAVE_CONTENT, {
    method: HTTP_METHOD.PUT,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify({ path, content }),
  });
};

const searchDocs = async (query: string): Promise<DocsSearchResult[]> => {
  const data = await requestDocs<{ results: DocsSearchResult[] }>(
    `${API.SEARCH}?q=${encodeURIComponent(query)}`,
    ERROR.SEARCH,
  );
  return data.results;
};

function DocsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlSync = useMemo(
    () => ({
      get: () => searchParams.get(FILE_PARAM),
      set: (path: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(FILE_PARAM, path);
        router.push(`?${params.toString()}`, { scroll: false });
      },
    }),
    [searchParams, router],
  );

  return (
    <DocsViewer
      getStructure={fetchStructure}
      getContent={fetchContent}
      saveContent={saveContent}
      search={searchDocs}
      urlSync={urlSync}
    />
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className={LOADING_CLS}>Loading...</div>}>
      <DocsPageContent />
    </Suspense>
  );
}
