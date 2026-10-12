'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './Dialog';
import { IconButton } from './IconButton';
import { WINDOW_OPEN_FEATURES } from '../utils/browser.utils';

const WINDOW_TARGET_BLANK = '_blank';
const OPEN_IN_NEW_TAB_LABEL = 'Open in new tab';
const CLOSE_LABEL = 'Close';

export type EmbedDialogProps = {
  title: string;
  url: string | null;
  onOpenChange: (open: boolean) => void;
};

export function EmbedDialog({ title, url, onOpenChange }: EmbedDialogProps) {
  const openInNewTab = () => {
    if (!url) return;
    window.open(url, WINDOW_TARGET_BLANK, WINDOW_OPEN_FEATURES);
    onOpenChange(false);
  };

  return (
    <Dialog open={url !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90dvh] w-[calc(100%-2rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
          <DialogTitle className="truncate text-base">{title}</DialogTitle>
          <div className="flex items-center gap-1">
            <IconButton
              icon="external-link"
              variant="ghost"
              aria-label={OPEN_IN_NEW_TAB_LABEL}
              title={OPEN_IN_NEW_TAB_LABEL}
              onClick={openInNewTab}
            />
            <IconButton
              icon="x"
              variant="ghost"
              aria-label={CLOSE_LABEL}
              onClick={() => onOpenChange(false)}
            />
          </div>
        </div>
        <DialogDescription className="sr-only">{title}</DialogDescription>
        {url && (
          <iframe
            title={title}
            src={url}
            className="min-h-0 w-full flex-1 border-0"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
