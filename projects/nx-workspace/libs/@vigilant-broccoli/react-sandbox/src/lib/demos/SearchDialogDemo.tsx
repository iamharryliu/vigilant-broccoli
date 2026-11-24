import { useCallback, useState } from 'react';
import {
  Button,
  SearchDialog,
  SearchDialogItem,
  Text,
  useFocusSearchShortcut,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';

const ITEM_KEYS = [
  'STATUS',
  'DEPLOYMENTS',
  'CHANGELOG',
  'DOCKER',
  'NPM',
] as const;

export const SearchDialogDemo = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>();

  const openDialog = useCallback(() => setOpen(true), []);
  useFocusSearchShortcut(openDialog);

  const items: SearchDialogItem[] = ITEM_KEYS.map(key => ({
    id: key,
    title: t(`SEARCH_DIALOG.ITEMS.${key}.TITLE`),
    description: t(`SEARCH_DIALOG.ITEMS.${key}.DESCRIPTION`),
  }));

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="outline" onClick={openDialog}>
        {t('SEARCH_DIALOG.OPEN')}
      </Button>
      <Text size="2" color="gray">
        {selected
          ? t('FOUNDATION_DEMO.SELECTED', { value: selected })
          : t('SEARCH_DIALOG.HINT')}
      </Text>
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        items={items}
        onSelect={item => setSelected(item.title)}
        title={t('SEARCH_DIALOG.TITLE')}
        description={t('SEARCH_DIALOG.DESCRIPTION')}
        placeholder={t('SEARCH_DIALOG.PLACEHOLDER')}
        emptyLabel={t('SEARCH_DIALOG.EMPTY')}
      />
    </div>
  );
};
