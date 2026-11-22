import { IconButton } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { useOpenSearch } from './search-context';

export function SearchButton() {
  const { t } = useTranslation();
  const openSearch = useOpenSearch();
  if (!openSearch) return null;

  return (
    <IconButton
      icon="search"
      variant="ghost"
      aria-label={t('SEARCH.OPEN')}
      onClick={openSearch}
    />
  );
}
