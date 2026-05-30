'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DocsNode, DocsSearchResult } from '@vigilant-broccoli/react-lib';
import { DocsViewer, FILE_PARAM } from '@vigilant-broccoli/react-utility';

const API_STRUCTURE = '/api/docs/structure';
const API_CONTENT = '/api/docs/content';
const API_SEARCH = '/api/docs/search';

const LOADING_CLS = 'flex items-center justify-center h-full text-gray-500';

const fetchStructure = async (): Promise<DocsNode[]> => {
  const response = await fetch(API_STRUCTURE);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to load structure');
  return data.data as DocsNode[];
};

const fetchContent = async (path: string): Promise<string> => {
  const response = await fetch(
    `${API_CONTENT}?path=${encodeURIComponent(path)}`,
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to load content');
  return data.content as string;
};

const searchDocs = async (query: string): Promise<DocsSearchResult[]> => {
  const response = await fetch(`${API_SEARCH}?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to search');
  return data.results as DocsSearchResult[];
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
