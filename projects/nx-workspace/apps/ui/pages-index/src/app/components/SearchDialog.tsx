import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  fuzzyMatch,
  useFocusSearchShortcut,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { buildSearchEntries } from '../consts/searchEntries';
import type { SearchEntry } from '../consts/searchEntries';

const KEYS = {
  DOWN: 'ArrowDown',
  UP: 'ArrowUp',
  ENTER: 'Enter',
} as const;

const MAX_RESULTS = 8;

const DIALOG_CLASS =
  'top-[10vh] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0 motion-reduce:!animate-none';

export function SearchDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const entries = useMemo(
    () => buildSearchEntries(t as (key: never) => string),
    [t],
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return entries.slice(0, MAX_RESULTS);
    return entries
      .map(entry => ({ entry, ...fuzzyMatch(trimmed, entry.title) }))
      .filter(result => result.matched)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map(result => result.entry);
  }, [entries, query]);

  const openDialog = useCallback(() => setOpen(true), []);
  useFocusSearchShortcut(openDialog);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    if (!open || !list) return;
    const observer = new ResizeObserver(() => setListHeight(list.offsetHeight));
    observer.observe(list);
    setListHeight(list.offsetHeight);
    return () => observer.disconnect();
  }, [open]);

  const select = (entry: SearchEntry) => {
    setOpen(false);
    if (entry.route) navigate(entry.href);
    else window.location.href = entry.href;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEYS.DOWN || e.key === KEYS.UP) {
      e.preventDefault();
      if (!results.length) return;
      const step = e.key === KEYS.DOWN ? 1 : -1;
      setActiveIndex(index => (index + step + results.length) % results.length);
    } else if (e.key === KEYS.ENTER && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const entry = results[activeIndex];
      if (entry) select(entry);
    }
  };

  const activeId = results[activeIndex]
    ? `search-result-${activeIndex}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className={DIALOG_CLASS}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">{t('SEARCH.TITLE')}</DialogTitle>
        <DialogDescription className="sr-only">
          {t('SEARCH.DESCRIPTION')}
        </DialogDescription>
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
            placeholder={t('SEARCH.PLACEHOLDER')}
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
            ref={listRef}
            id="search-results"
            role="listbox"
            className="max-h-[60vh] overflow-y-auto p-2"
          >
            {results.length === 0 && (
              <li className="animate-in fade-in-0 px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('SEARCH.EMPTY')}
              </li>
            )}
            {results.map((entry, index) => (
              <li
                key={entry.id}
                id={`search-result-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => select(entry)}
                ref={node => {
                  if (index === activeIndex)
                    node?.scrollIntoView({ block: 'nearest' });
                }}
                className={`animate-in fade-in-0 slide-in-from-top-1 cursor-pointer rounded-md px-3 py-2 duration-200 motion-reduce:animate-none ${
                  index === activeIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="text-sm font-medium">{entry.title}</div>
                {entry.description && (
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {entry.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
