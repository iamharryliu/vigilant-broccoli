'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import {
  JOB_APPLICATION_BOOKMARKLET,
  isJobApplicationBookmarkletMessage,
  isJobPostingsBookmarkletMessage,
} from '@vigilant-broccoli/common-js';
import { extractJobPosting } from '../utils/job-posting.utils';
import { IS_DEMO } from '../constants/demo';
import { useStartApplicationRun } from '../hooks/use-start-application-run';
import { useTranslation } from '../i18n';

const INPUT_CLASS_NAME =
  'w-full rounded border border-border bg-transparent p-2 text-sm';

type JobApplicationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const JobApplicationDialog = ({
  open,
  onOpenChange,
}: JobApplicationDialogProps) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const startApplicationRun = useStartApplicationRun();

  useEffect(() => {
    const prefill = (event: MessageEvent) => {
      if (
        !isJobApplicationBookmarkletMessage(event.data) ||
        isJobPostingsBookmarkletMessage(event.data)
      )
        return;
      (event.source as Window | null)?.postMessage(
        JOB_APPLICATION_BOOKMARKLET.ACK,
        event.origin,
      );
      setUrl(event.data.url);
      setText(extractJobPosting(event.data.title ?? '', event.data.text));
      onOpenChange(true);
    };
    window.addEventListener('message', prefill);
    return () => window.removeEventListener('message', prefill);
  }, [onOpenChange]);

  const run = async () => {
    setRunning(true);
    const started = await startApplicationRun({ url, text });
    setRunning(false);
    if (!started) return;
    setUrl('');
    setText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] w-[95vw] max-w-none flex-col">
        <DialogHeader>
          <DialogTitle>{t('DIALOG.TITLE')}</DialogTitle>
          <DialogDescription>{t('DIALOG.DESCRIPTION')}</DialogDescription>
        </DialogHeader>
        <input
          type="url"
          value={url}
          onChange={event => setUrl(event.target.value)}
          disabled={running}
          placeholder={t('DIALOG.URL_PLACEHOLDER')}
          className={INPUT_CLASS_NAME}
        />
        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          disabled={running}
          placeholder={t('DIALOG.TEXT_PLACEHOLDER')}
          className={`${INPUT_CLASS_NAME} min-h-0 flex-1 resize-none`}
        />
        <div className="flex justify-end">
          <Button
            onClick={run}
            loading={running}
            disabled={IS_DEMO || !text.trim()}
          >
            {t('DIALOG.RUN')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
