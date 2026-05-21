'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DocsExplorer,
  DocsExplorerUrlSync,
  DocsNode,
  DocsSearchResult,
} from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from '../../components/docs/markdown-viewer.component';

const FILE_PARAM = 'file';

const fetchStructure = async (): Promise<DocsNode[]> => {
  const response = await fetch('/api/docs/structure');
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to load structure');
  return data.data as DocsNode[];
};

const fetchContent = async (path: string): Promise<string> => {
  const response = await fetch(
    `/api/docs/content?path=${encodeURIComponent(path)}`,
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to load content');
  return data.content as string;
};

const searchDocs = async (query: string): Promise<DocsSearchResult[]> => {
  const response = await fetch(
    `/api/docs/search?q=${encodeURIComponent(query)}`,
  );
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to search');
  return data.results as DocsSearchResult[];
};

const renderMarkdown = (content: string) => (
  <MarkdownViewer content={content} />
);

function DocsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [nodes, setNodes] = useState<DocsNode[]>([]);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(true);

  useEffect(() => {
    fetchStructure()
      .then(setNodes)
      .catch(err => setTreeError(err.message))
      .finally(() => setIsLoadingTree(false));
  }, []);

  const urlSync = useMemo<DocsExplorerUrlSync>(
    () => ({
      get: () => searchParams.get(FILE_PARAM),
      set: path => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(FILE_PARAM, path);
        router.push(`?${params.toString()}`, { scroll: false });
      },
    }),
    [searchParams, router],
  );

  if (isLoadingTree) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading file structure...
      </div>
    );
  }
  if (treeError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {treeError}
      </div>
    );
  }

  return (
    <DocsExplorer
      nodes={nodes}
      getContent={fetchContent}
      renderContent={renderMarkdown}
      search={searchDocs}
      urlSync={urlSync}
      emptyMessage="Select a markdown file to view its contents"
    />
  );
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full text-gray-500">
          Loading...
        </div>
      }
    >
      <DocsPageContent />
    </Suspense>
  );
}
