'use client';

import { useEffect, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { buildBookmarklet } from '../utils/bookmarklet.utils';
import { useTranslation } from '../i18n';

type JobApplicationHelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasteManually: () => void;
};

export const JobApplicationHelpDialog = ({
  open,
  onOpenChange,
  onPasteManually,
}: JobApplicationHelpDialogProps) => {
  const { t } = useTranslation();
  const bookmarkletRef = useRef<HTMLAnchorElement>(null);

  // React refuses `javascript:` hrefs, so the link is set on the DOM node.
  useEffect(() => {
    if (!open) return;
    // Wait for the dialog content to mount before the ref exists.
    const id = requestAnimationFrame(() =>
      bookmarkletRef.current?.setAttribute(
        'href',
        buildBookmarklet(window.location.origin),
      ),
    );
    return () => cancelAnimationFrame(id);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t('HELP.TITLE')}</DialogTitle>
          <DialogDescription>
            {t('HELP.DESCRIPTION_BEFORE')}{' '}
            <a
              ref={bookmarkletRef}
              onClick={event => event.preventDefault()}
              className="underline"
            >
              {t('HELP.BOOKMARKLET')}
            </a>{' '}
            {t('HELP.DESCRIPTION_AFTER')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t('HELP.MANUAL')}</p>
          <Button variant="outline" onClick={onPasteManually}>
            {t('HELP.PASTE_MANUALLY')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
