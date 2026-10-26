'use client';

import { useEffect, useRef, useState } from 'react';
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
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { extractJobPosting } from '../utils/job-posting.utils';
import { APP_ROUTE } from '../app.const';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { useTranslation } from '../i18n';

const BOOKMARKLET_MESSAGE_SOURCE = 'job-application-bookmarklet';
const BOOKMARKLET_ACK = 'job-application-ack';
// Cleanup happens in `extractJobPosting`, so send the whole page, not a slice.
const BOOKMARKLET_TEXT_LIMIT = 300000;
const BOOKMARKLET_EXPAND_WAIT_MS = 600;
// Only collapsed "… more" / "Show more" / "See more" toggles; other expanders
// (menus, filters) are left alone.
const BOOKMARKLET_EXPANDER_PATTERN = /(…|\.\.\.)\s*more|(show|see)\s+more/i;
const BOOKMARKLET_RETRY_MS = 300;
const BOOKMARKLET_GIVE_UP_MS = 15000;

const UNSAFE_JS_CHAR_MAP: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const escapeUnsafeJsChars = (value: string) =>
  value.replace(
    /[<>\u002F\b\f\n\r\t\0\u2028\u2029]/g,
    char => UNSAFE_JS_CHAR_MAP[char],
  );

type BookmarkletMessage = {
  source: typeof BOOKMARKLET_MESSAGE_SOURCE;
  url: string;
  title?: string;
  text: string;
};

const isBookmarkletMessage = (data: unknown): data is BookmarkletMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as BookmarkletMessage).source === BOOKMARKLET_MESSAGE_SOURCE;

// Runs on the job posting's page, so it cannot call the API (no bearer token,
// and the page's CSP may block it). It opens this app first, inside the click,
// so popup blockers allow it, then expands collapsed sections ("… more"),
// which keep their text out of the page until opened. It posts the page until
// the app acknowledges, since the new tab may still be loading or redirecting
// to login.
const buildBookmarklet = (origin: string) =>
  `javascript:(function(){var o=${escapeUnsafeJsChars(JSON.stringify(origin))};var w=window.open(o+'${APP_ROUTE.APPLICATIONS.path}');document.querySelectorAll('[aria-expanded="false"]').forEach(function(b){if(${BOOKMARKLET_EXPANDER_PATTERN}.test(b.innerText))b.click()});setTimeout(function(){var m={source:'${BOOKMARKLET_MESSAGE_SOURCE}',url:location.href,title:document.title,text:document.body.innerText.slice(0,${BOOKMARKLET_TEXT_LIMIT})};var t=setInterval(function(){w.postMessage(m,o)},${BOOKMARKLET_RETRY_MS});window.addEventListener('message',function(e){if(e.origin===o&&e.data==='${BOOKMARKLET_ACK}')clearInterval(t)});setTimeout(function(){clearInterval(t)},${BOOKMARKLET_GIVE_UP_MS})},${BOOKMARKLET_EXPAND_WAIT_MS})})()`;

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

  useEffect(() => {
    const prefill = (event: MessageEvent) => {
      if (!isBookmarkletMessage(event.data)) return;
      (event.source as Window | null)?.postMessage(
        BOOKMARKLET_ACK,
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
          onClick: () => router.push(APP_ROUTE.RUNS.path),
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
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t('DIALOG.TITLE')}</DialogTitle>
          <DialogDescription>
            {t('DIALOG.DESCRIPTION_BEFORE')}{' '}
            <a
              ref={bookmarkletRef}
              onClick={event => event.preventDefault()}
              className="underline"
            >
              {t('DIALOG.BOOKMARKLET')}
            </a>{' '}
            {t('DIALOG.DESCRIPTION_AFTER')}
          </DialogDescription>
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
          rows={8}
          placeholder={t('DIALOG.TEXT_PLACEHOLDER')}
          className={`${INPUT_CLASS_NAME} resize-y`}
        />
        <div className="flex justify-end">
          <Button onClick={run} loading={running} disabled={!text.trim()}>
            {t('DIALOG.RUN')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
