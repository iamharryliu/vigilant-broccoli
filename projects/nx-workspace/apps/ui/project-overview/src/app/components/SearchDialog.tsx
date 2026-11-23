import { ReactNode, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchDialog as LibSearchDialog,
  useFocusSearchShortcut,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { buildSearchEntries } from '../consts/searchEntries';
import type { SearchEntry } from '../consts/searchEntries';
import { SearchContext } from './search-context';

export function SearchProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const entries = useMemo(
    () => buildSearchEntries(t as (key: never) => string),
    [t],
  );

  const openDialog = useCallback(() => setOpen(true), []);
  useFocusSearchShortcut(openDialog);

  const select = (entry: SearchEntry) => {
    if (entry.route) navigate(entry.href);
    else window.location.href = entry.href;
  };

  return (
    <SearchContext.Provider value={openDialog}>
      <LibSearchDialog
        open={open}
        onOpenChange={setOpen}
        items={entries}
        onSelect={select}
        title={t('SEARCH.TITLE')}
        description={t('SEARCH.DESCRIPTION')}
        placeholder={t('SEARCH.PLACEHOLDER')}
        emptyLabel={t('SEARCH.EMPTY')}
      />
      {children}
    </SearchContext.Provider>
  );
}
