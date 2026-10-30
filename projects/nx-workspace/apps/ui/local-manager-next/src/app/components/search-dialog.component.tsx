'use client';
import { QuickLinksDialog } from '@vigilant-broccoli/react-lib-higher-level';
import { QUICK_LINKS } from '../constants/quick-links';
import { isDesktopEmbedEnvironment } from '../utils/embed.utils';
import { handleShellExecute } from '../utils/quick-links.utils';

type SearchDialogComponentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchDialogComponent({
  open,
  onOpenChange,
}: SearchDialogComponentProps) {
  return (
    <QuickLinksDialog
      links={QUICK_LINKS}
      enableFavorites
      open={open}
      onOpenChange={onOpenChange}
      onShellExecute={handleShellExecute}
      canEmbed={isDesktopEmbedEnvironment}
    />
  );
}
