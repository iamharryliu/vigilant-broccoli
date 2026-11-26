'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { useTranslation } from '../i18n';
import {
  addMatchPostings,
  type StoredMatchPosting,
} from '../utils/job-matches-storage.utils';

// Saving the pasted text replaces the stored posting text, which also makes
// its brief stale so a new one is generated.
export const RedoMatchingDialog = ({
  posting,
  onClose,
}: {
  posting: StoredMatchPosting | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(posting?.text ?? '');
  }, [posting]);

  const save = async () => {
    if (!posting) return;
    setSaving(true);
    try {
      await addMatchPostings([
        {
          url: posting.url,
          title: posting.title,
          text,
          posted: posting.posted,
          easyApply: posting.easyApply,
        },
      ]);
      onClose();
    } catch {
      toast.error(t('MATCHES.SAVE_FAILED'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!posting} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t('MATCHES.REDO_TITLE')}</DialogTitle>
          <DialogDescription>{t('MATCHES.REDO_DESCRIPTION')}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder={t('MATCHES.REDO_PLACEHOLDER')}
          className="h-72 resize-none"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('MATCHES.CANCEL')}
          </Button>
          <Button loading={saving} disabled={!text.trim()} onClick={save}>
            {t('MATCHES.REDO_SAVE')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
