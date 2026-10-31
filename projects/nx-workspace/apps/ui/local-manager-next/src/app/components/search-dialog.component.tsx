'use client';
import { useRouter } from 'next/navigation';
import { QuickLinksDialog } from '@vigilant-broccoli/react-lib-higher-level';
import { QUICK_LINKS } from '../constants/quick-links';
import { isDesktopEmbedEnvironment, toEmbedRoute } from '../utils/embed.utils';
import { handleShellExecute } from '../utils/quick-links.utils';

type SearchDialogComponentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchDialogComponent({
  open,
  onOpenChange,
}: SearchDialogComponentProps) {
  const router = useRouter();
  return (
    <QuickLinksDialog
      links={QUICK_LINKS}
      enableFavorites
      open={open}
      onOpenChange={onOpenChange}
      onShellExecute={handleShellExecute}
      onEmbedOpen={link => router.push(toEmbedRoute(link))}
      onInternalOpen={router.push}
      canEmbed={isDesktopEmbedEnvironment}
    />
  );
}
