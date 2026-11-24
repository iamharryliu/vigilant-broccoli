import { useState } from 'react';
import {
  DarkModeIconButton,
  DeleteIconButton,
  IconButton,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

export function IconButtonDemo() {
  const { t } = useTranslation();
  const [dark, setDark] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.BUTTON.ICON_BUTTONS')}>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton icon="x" title="Close" />
          <IconButton icon="filter" variant="outline" title="Filter" />
          <IconButton icon="search" variant="ghost" title="Search" />
          <IconButton icon="plus" variant="secondary" title="Add" />
          <IconButton icon="minus" variant="secondary" title="Remove" />
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.DELETE_ICON_BUTTON')}>
        <div className="flex flex-wrap items-center gap-3">
          <DeleteIconButton title="Delete" />
        </div>
      </DemoSection>

      <DemoSection title={t('DEMO_SECTION.BUTTON.DARK_MODE_ICON_BUTTON')}>
        <div className="flex flex-wrap items-center gap-3">
          <DarkModeIconButton dark={dark} onToggle={setDark} />
        </div>
      </DemoSection>
    </div>
  );
}
