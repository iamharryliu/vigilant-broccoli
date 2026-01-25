'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, TextField } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import { FileTree, FileNode } from '../../components/docs/file-tree.component';
import { MarkdownViewer } from '../../components/docs/markdown-viewer.component';
import { SearchResults, SearchResult } from '../../components/docs/search-results.component';

function DocsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch file structure on mount
  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setIsLoadingTree(true);
        const response = await fetch('/api/docs/structure');
        const data = await response.json();

        if (data.success) {
          setFileTree(data.data);
        } else {
          setError(data.error || 'Failed to load file structure');
        }
      } catch (err) {
        setError('Failed to fetch file structure');
        console.error(err);
      } finally {
        setIsLoadingTree(false);
      }
    };

    fetchFileTree();
  }, []);

  // Fetch file content when a file is selected
  const handleFileSelect = useCallback(async (path: string) => {
    setSelectedFilePath(path);
    setIsLoadingContent(true);
    setError(null);

    // Update URL with selected file
    const params = new URLSearchParams(searchParams.toString());
    params.set('file', path);
    router.push(`?${params.toString()}`, { scroll: false });

    try {
      const response = await fetch(`/api/docs/content?path=${encodeURIComponent(path)}`);
      const data = await response.json();

      if (data.success) {
        setFileContent(data.content);
      } else {
        setError(data.error || 'Failed to load file content');
        setFileContent('');
      }
    } catch (err) {
      setError('Failed to fetch file content');
      setFileContent('');
      console.error(err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [searchParams, router]);

  // Load file from URL parameter on mount
  useEffect(() => {
    const fileParam = searchParams.get('file');
    if (fileParam && !selectedFilePath) {
      handleFileSelect(fileParam);
    }
  }, [searchParams, handleFileSelect, selectedFilePath]);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/docs/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      } else {
        setError(data.error || 'Failed to search');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to perform search');
      setSearchResults([]);
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const isSearchMode = searchQuery.trim().length > 0;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* File Tree / Search Results Sidebar */}
      <Card className="w-80 flex-shrink-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">Notes</h2>
          <TextField.Root
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          >
            <TextField.Slot>
              <Search className="w-4 h-4" />
            </TextField.Slot>
          </TextField.Root>
        </div>
        <div className="flex-1 overflow-auto">
          {isSearchMode ? (
            // Search Results
            <div className="p-2">
              {isSearching ? (
                <div className="text-gray-500 text-center py-4">Searching...</div>
              ) : (
                <SearchResults
                  results={searchResults}
                  onResultClick={handleFileSelect}
                  selectedPath={selectedFilePath || undefined}
                />
              )}
            </div>
          ) : (
            // File Tree
            <div className="p-4">
              {isLoadingTree ? (
                <div className="text-gray-500">Loading file structure...</div>
              ) : error && fileTree.length === 0 ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <FileTree
                  nodes={fileTree}
                  onFileSelect={handleFileSelect}
                  selectedPath={selectedFilePath || undefined}
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Markdown Viewer */}
      <Card className="flex-1 overflow-hidden">
        {!selectedFilePath ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a markdown file to view its contents
          </div>
        ) : isLoadingContent ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading file content...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {error}
          </div>
        ) : (
          <MarkdownViewer
            content={fileContent}
            fileName={selectedFilePath.split('/').pop()}
          />
        )}
      </Card>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-120px)] text-gray-500">Loading...</div>}>
      <DocsPageContent />
    </Suspense>
  );
}
