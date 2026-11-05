'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JOB_APPLICATION_BOOKMARKLET,
  JSON_CONTENT_TYPE,
  isJobApplicationBookmarkletMessage,
} from '@vigilant-broccoli/common-js';
import { extractJobPosting } from '../utils/job-posting.utils';
import { RUNS_TAB_URL } from '../app.const';
import { IS_DEMO } from '../constants/demo';
import { API_ENDPOINTS } from '../constants/api-endpoints';
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
  const router = useRouter();

  useEffect(() => {
    const prefill = (event: MessageEvent) => {
      if (!isJobApplicationBookmarkletMessage(event.data)) return;
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
    try {
      const response = await fetch(API_ENDPOINTS.JOB_APPLICATIONS_RUN, {
        method: HTTP_METHOD.POST,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ url, text }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setUrl('');
      setText('');
      onOpenChange(false);
      toast.success(t('DIALOG.STARTED'), {
        action: {
          label: t('DIALOG.VIEW_PROGRESS'),
          onClick: () => router.push(RUNS_TAB_URL),
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('DIALOG.RUN_FAILED'));
    } finally {
      setRunning(false);
    }
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
