import { useMemo, useState } from 'react';

export type FolderItem = {
  name: string;
  filepath: string;
  type: 'file' | 'folder';
  children?: FolderItem[];
};

type Props = {
  root: FolderItem | null;
  selectedFilepath?: string;
  placeholder?: string;
  isTitleCase?: boolean;
  fileFilter?: (filename: string) => boolean;
  onSelect: (file: FolderItem) => void;
};

const stripExt = (name: string) =>
  name
    .replace('.md', '')
    .replace('.go', '')
    .replace('.py', '')
    .replace('.ts', '');

const flatten = (
  item: FolderItem,
  filter: (n: string) => boolean,
  out: FolderItem[] = [],
): FolderItem[] => {
  if (item.type === 'file' && filter(item.name)) out.push(item);
  item.children?.forEach(c => flatten(c, filter, out));
  return out;
};

const filterTree = (
  item: FolderItem,
  query: string,
  fileFilter: (n: string) => boolean,
): FolderItem | null => {
  if (item.type === 'file') {
    const ok = item.name.toLowerCase().includes(query) && fileFilter(item.name);
    return ok ? item : null;
  }
  const kids = (item.children ?? [])
    .map(c => filterTree(c, query, fileFilter))
    .filter((c): c is FolderItem => c !== null);
  if (kids.length === 0) return null;
  return { ...item, children: kids };
};

function FolderNode({
  item,
  selectedFilepath,
  isTitleCase,
  onSelect,
  depth = 0,
}: {
  item: FolderItem;
  selectedFilepath?: string;
  isTitleCase: boolean;
  onSelect: (file: FolderItem) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  if (item.type === 'file') {
    const isSelected = selectedFilepath === item.filepath;
    return (
      <div
        onClick={() => onSelect(item)}
        className={`cursor-pointer px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {isTitleCase ? stripExt(item.name) : item.name}
      </div>
    );
  }
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        className="cursor-pointer px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <span className="mr-1">{open ? '▾' : '▸'}</span>
        {item.name}
      </div>
      {open && item.children
        ? item.children.map(child => (
            <FolderNode
              key={child.filepath || child.name}
              item={child}
              selectedFilepath={selectedFilepath}
              isTitleCase={isTitleCase}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))
        : null}
    </div>
  );
}

export function FileTree({
  root,
  selectedFilepath,
  placeholder = 'Search files...',
  isTitleCase = false,
  fileFilter = () => true,
  onSelect,
}: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const flatMatches = useMemo(() => {
    if (!root || !q) return [];
    return flatten(root, fileFilter).filter(f =>
      f.name.toLowerCase().includes(q),
    );
  }, [root, q, fileFilter]);

  const filteredRoot = useMemo(() => {
    if (!root || !q) return root;
    return filterTree(root, q, fileFilter);
  }, [root, q, fileFilter]);

  if (!root) return null;

  return (
    <div>
      <div className="mb-3 relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
      </div>
      {q && flatMatches.length > 0 ? (
        <>
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Found {flatMatches.length} file
            {flatMatches.length === 1 ? '' : 's'}
          </div>
          <div className="space-y-1">
            {flatMatches.map(file => (
              <div
                key={file.filepath}
                onClick={() => onSelect(file)}
                className={`cursor-pointer px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedFilepath === file.filepath
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : ''
                }`}
              >
                <div className="font-medium text-sm">
                  {isTitleCase ? stripExt(file.name) : file.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {file.filepath}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : q && flatMatches.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          No matching files found
        </div>
      ) : filteredRoot?.children ? (
        filteredRoot.children.map(child => (
          <FolderNode
            key={child.filepath || child.name}
            item={child}
            selectedFilepath={selectedFilepath}
            isTitleCase={isTitleCase}
            onSelect={onSelect}
          />
        ))
      ) : null}
    </div>
  );
}
