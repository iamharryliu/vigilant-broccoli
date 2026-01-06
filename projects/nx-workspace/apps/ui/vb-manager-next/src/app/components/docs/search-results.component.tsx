'use client';

import { File, FileText } from 'lucide-react';
import { Badge } from '@radix-ui/themes';

export interface SearchResult {
  name: string;
  path: string;
  matchType: 'filename' | 'content';
  score: number;
  excerpt?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (path: string) => void;
  selectedPath?: string;
}

export function SearchResults({ results, onResultClick, selectedPath }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No results found
      </div>
    );
  }

  return (
    <div className="w-full">
      {results.map((result) => (
        <div
          key={result.path}
          className={`flex flex-col gap-1 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded border-b border-gray-200 dark:border-gray-700 ${
            selectedPath === result.path ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          onClick={() => onResultClick(result.path)}
        >
          <div className="flex items-center gap-2">
            {result.matchType === 'filename' ? (
              <File className="w-4 h-4 flex-shrink-0 text-blue-500" />
            ) : (
              <FileText className="w-4 h-4 flex-shrink-0 text-green-500" />
            )}
            <span className="text-sm font-medium truncate">{result.name}</span>
            <Badge
              size="1"
              color={result.matchType === 'filename' ? 'blue' : 'green'}
              className="ml-auto flex-shrink-0"
            >
              {result.matchType === 'filename' ? 'Name' : 'Content'}
            </Badge>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 pl-6 truncate">
            {result.path}
          </div>
          {result.excerpt && (
            <div className="text-xs text-gray-500 dark:text-gray-500 pl-6 line-clamp-2">
              {result.excerpt}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
