'use client';

import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import {
  buildMatchesBookmarklet,
  readBookmarkletTarget,
} from '../utils/bookmarklet.utils';

type JobMatchesHelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const JobMatchesHelpDialog = ({
  open,
  onOpenChange,
}: JobMatchesHelpDialogProps) => {
  const { t } = useTranslation();
  const bookmarkletRef = useRef<HTMLAnchorElement>(null);

  // React refuses `javascript:` hrefs, so the link is set on the DOM node.
  useEffect(() => {
    if (!open) return;
    // Wait for the dialog content to mount before the ref exists.
    const id = requestAnimationFrame(() =>
      bookmarkletRef.current?.setAttribute(
        'href',
        buildMatchesBookmarklet(readBookmarkletTarget()),
      ),
    );
    return () => cancelAnimationFrame(id);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t('MATCHES.HELP_TITLE')}</DialogTitle>
          <DialogDescription>
            {t('MATCHES.DESCRIPTION_BEFORE')}{' '}
            <a
              ref={bookmarkletRef}
              onClick={event => event.preventDefault()}
              className="underline"
            >
              {t('MATCHES.BOOKMARKLET')}
            </a>{' '}
            {t('MATCHES.DESCRIPTION_AFTER')}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
