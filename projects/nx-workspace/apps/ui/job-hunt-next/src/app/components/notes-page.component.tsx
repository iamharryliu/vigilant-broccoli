'use client';

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@vigilant-broccoli/react-lib';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { IS_DEMO } from '../constants/demo';
import { useTranslation } from '../i18n';

const SAVE_DEBOUNCE_MS = 800;

const SAVE_STATE = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  FAILED: 'failed',
} as const;

type SaveState = (typeof SAVE_STATE)[keyof typeof SAVE_STATE];

const STATE_LABEL_KEY = {
  [SAVE_STATE.IDLE]: null,
  [SAVE_STATE.SAVING]: 'NOTES.SAVING',
  [SAVE_STATE.SAVED]: 'NOTES.SAVED',
  [SAVE_STATE.FAILED]: 'NOTES.SAVE_FAILED',
} as const;

const putNotes = (content: string, keepalive = false) =>
  fetch(API_ENDPOINTS.NOTES, {
    method: HTTP_METHOD.PUT,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ content }),
    keepalive,
  });

export const NotesPage = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>(SAVE_STATE.IDLE);
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.NOTES)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => {
        setContent(data.content);
        setLoaded(true);
      })
      .catch(() => setLoadFailed(true));
  }, []);

  const flush = (keepalive = false) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current === null) return;
    const value = pending.current;
    pending.current = null;
    setSaveState(SAVE_STATE.SAVING);
    putNotes(value, keepalive)
      .then(res => setSaveState(res.ok ? SAVE_STATE.SAVED : SAVE_STATE.FAILED))
      .catch(() => setSaveState(SAVE_STATE.FAILED));
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  // Leaving the page inside the debounce window must not drop the last edit.
  useEffect(() => {
    const onHide = () => flushRef.current(true);
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      onHide();
    };
  }, []);

  const handleChange = (value: string) => {
    setContent(value);
    pending.current = value;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flush(), SAVE_DEBOUNCE_MS);
  };

  const labelKey = loadFailed
    ? 'NOTES.LOAD_FAILED'
    : STATE_LABEL_KEY[saveState];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <Textarea
        value={content}
        disabled={!loaded}
        readOnly={IS_DEMO}
        placeholder={t('NOTES.PLACEHOLDER')}
        onChange={event => handleChange(event.target.value)}
        className="min-h-0 flex-1 resize-none"
      />
      <p className="h-4 text-xs text-muted-foreground">
        {labelKey ? t(labelKey) : ''}
      </p>
    </div>
  );
};
