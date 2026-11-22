import {
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Search } from 'lucide-react';
import { fuzzyMatch } from '../utils/fuzzy-match.utils';
import { cn } from '../utils/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './Dialog';

const KEYS = {
  DOWN: 'ArrowDown',
  UP: 'ArrowUp',
  ENTER: 'Enter',
} as const;

const DEFAULT_MAX_RESULTS = 8;

const DIALOG_CLASS =
  'top-[10vh] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0 motion-reduce:!animate-none';

export type SearchDialogItem = {
  id: string;
  title: string;
  description?: string;
};

export type SearchDialogProps<T extends SearchDialogItem> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: T[];
  onSelect: (item: T) => void;
  title: string;
  description: string;
  placeholder: string;
  emptyLabel: string;
  maxResults?: number;
};

export const SearchDialog = <T extends SearchDialogItem>({
  open,
  onOpenChange,
  items,
  onSelect,
  title,
  description,
  placeholder,
  emptyLabel,
  maxResults = DEFAULT_MAX_RESULTS,
}: SearchDialogProps<T>) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const [listHeight, setListHeight] = useState<number>();

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return items.slice(0, maxResults);
    return items
      .map(item => ({ item, ...fuzzyMatch(trimmed, item.title) }))
      .filter(result => result.matched)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(result => result.item);
  }, [items, query, maxResults]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
  }, [open]);

  // The portal mounts the list a render after `open` flips, so observe it via
  // a callback ref rather than an effect keyed on `open`. The layout effect
  // measures before paint and the height starts unset (auto, which CSS cannot
  // animate from), so opening never grows the list from zero.
  useLayoutEffect(() => {
    if (!list) {
      setListHeight(undefined);
      return;
    }
    const observer = new ResizeObserver(() => setListHeight(list.offsetHeight));
    observer.observe(list);
    setListHeight(list.offsetHeight);
    return () => observer.disconnect();
  }, [list]);

  const select = (item: T) => {
    onOpenChange(false);
    onSelect(item);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === KEYS.DOWN || e.key === KEYS.UP) {
      e.preventDefault();
      if (!results.length) return;
      const step = e.key === KEYS.DOWN ? 1 : -1;
      setActiveIndex(index => (index + step + results.length) % results.length);
    } else if (e.key === KEYS.ENTER && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) select(item);
    }
  };

  const activeId = results[activeIndex]
    ? `search-result-${activeIndex}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={DIALOG_CLASS}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-700">
          <Search
            className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
          <input
            autoFocus
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={placeholder}
            role="combobox"
            aria-expanded
            aria-controls="search-results"
            aria-activedescendant={activeId}
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-gray-400"
          />
        </div>
        <div
          style={{ height: listHeight }}
          className="overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none"
        >
          <ul
            ref={setList}
            id="search-results"
            role="listbox"
            className="max-h-[60vh] overflow-y-auto p-2"
          >
            {results.length === 0 && (
              <li className="animate-in fade-in-0 px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {emptyLabel}
              </li>
            )}
            {results.map((item, index) => (
              <li
                key={item.id}
                id={`search-result-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => select(item)}
                ref={node => {
                  if (index === activeIndex)
                    node?.scrollIntoView({ block: 'nearest' });
                }}
                className={cn(
                  'animate-in fade-in-0 cursor-pointer rounded-md px-3 py-2 duration-200 motion-reduce:animate-none',
                  index === activeIndex && 'bg-gray-100 dark:bg-gray-800',
                )}
              >
                <div className="text-sm font-medium">{item.title}</div>
                {item.description && (
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
