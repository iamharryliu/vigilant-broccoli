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
  addSavedPostings,
  type SavedPosting,
} from '../utils/saved-postings-storage.utils';

// Saving the pasted text replaces the stored posting text, which also makes
// its brief stale so a new one is generated.
export const RecapturePostingDialog = ({
  posting,
  onClose,
}: {
  posting: SavedPosting | null;
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
      await addSavedPostings([
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
      toast.error(t('JOB_POSTINGS.SAVE_FAILED'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!posting} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t('JOB_POSTINGS.RECAPTURE_TITLE')}</DialogTitle>
          <DialogDescription>
            {t('JOB_POSTINGS.RECAPTURE_DESCRIPTION')}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder={t('JOB_POSTINGS.RECAPTURE_PLACEHOLDER')}
          className="h-72 resize-none"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('JOB_POSTINGS.CANCEL')}
          </Button>
          <Button loading={saving} disabled={!text.trim()} onClick={save}>
            {t('JOB_POSTINGS.RECAPTURE_SAVE')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
