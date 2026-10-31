'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { getLocalTimeZone } from '@vigilant-broccoli/common-browser';
import { resizeImage } from '@vigilant-broccoli/react-lib';
import { EventDraftCard, EventDraft, EventDraftStatus } from './EventDraftCard';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { CalendarEventBookmarkletLink } from './CalendarEventBookmarkletLink';
import { useCalendarEventTranslation } from './i18n';

interface ImagePreview {
  data: string;
  mimeType: string;
  previewUrl: string;
}

interface EventState {
  id: string;
  draft: EventDraft;
  status: EventDraftStatus;
  errorMessage?: string;
  eventLink?: string;
}

export interface CalendarInputProps {
  header: ReactNode;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
  onUnauthorized?: () => Promise<void>;
  renderVoiceAction?: (onTranscript: (text: string) => void) => ReactNode;
  // Replaces the text when it changes; `autoParse` then runs Extract on it.
  initialText?: string;
  autoParse?: boolean;
}

export const CalendarInput = ({
  header,
  authFetch,
  onUnauthorized,
  renderVoiceAction,
  initialText,
  autoParse,
}: CalendarInputProps) => {
  const { t } = useCalendarEventTranslation();
  const [text, setText] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [eventStates, setEventStates] = useState<EventState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firstDraftRef = useRef<HTMLDivElement>(null);
  const [parsedCount, setParsedCount] = useState(0);
  // Wait for the drafts to render before scrolling to the first one.
  useEffect(() => {
    if (parsedCount === 0) return;
    firstDraftRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [parsedCount]);

  const addImageFile = async (file: File) => {
    const { base64, mimeType, previewUrl } = await resizeImage(file);
    setImages(prev => [...prev, { data: base64, mimeType, previewUrl }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(addImageFile);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    Array.from(e.clipboardData.items)
      .filter(item => item.type.startsWith('image/'))
      .forEach(item => {
        const file = item.getAsFile();
        if (file) addImageFile(file);
      });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleParse = async (override?: string) => {
    const input = override ?? text;
    if (!input.trim() && images.length === 0) return;
    setParsing(true);
    setParseError(null);
    setEventStates([]);
    try {
      const res = await authFetch('/api/calendar/parse', {
        method: HTTP_METHOD.POST,
        headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
        body: JSON.stringify({
          text: input.trim() || undefined,
          images:
            images.length > 0
              ? images.map(i => ({ data: i.data, mimeType: i.mimeType }))
              : undefined,
          timeZone: getLocalTimeZone(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? t('PARSE_ERROR'));
        return;
      }
      setEventStates(
        (data.events as EventDraft[]).map(draft => ({
          id: crypto.randomUUID(),
          draft,
          status: 'draft' as EventDraftStatus,
        })),
      );
      textareaRef.current?.blur();
      setParsedCount(count => count + 1);
    } catch {
      setParseError(t('PARSE_ERROR'));
    } finally {
      setParsing(false);
    }
  };

  // Only a new `initialText` should re-run; `handleParse` is recreated each render.
  useEffect(() => {
    if (!initialText) return;
    setText(initialText);
    if (autoParse) handleParse(initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  const handleCreate = async (id: string, draft: EventDraft) => {
    setEventStates(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'creating' } : s)),
    );

    try {
      const res = await authFetch('/api/calendar/events', {
        method: HTTP_METHOD.POST,
        headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
        body: JSON.stringify({
          ...draft,
          start: draft.allDay ? draft.start.slice(0, 10) : draft.start,
          end: draft.allDay
            ? (draft.end || draft.start).slice(0, 10)
            : draft.end || draft.start,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === HTTP_STATUS_CODES.UNAUTHORIZED && onUnauthorized) {
          await onUnauthorized();
          return;
        }
        setEventStates(prev =>
          prev.map(s =>
            s.id === id
              ? {
                  ...s,
                  status: 'error',
                  errorMessage: data.error ?? t('CREATE_ERROR'),
                }
              : s,
          ),
        );
        return;
      }

      setEventStates(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, status: 'created', eventLink: data.event?.htmlLink }
            : s,
        ),
      );
    } catch {
      setEventStates(prev =>
        prev.map(event =>
          event.id === id
            ? { ...event, status: 'error', errorMessage: t('CREATE_ERROR') }
            : event,
        ),
      );
    }
  };

  const handleCancel = (id: string) => {
    setEventStates(prev => prev.filter(event => event.id !== id));
  };

  const canParse =
    (text.trim().length > 0 || images.length > 0) &&
    !parsing &&
    !eventStates.some(event => event.status === 'creating');

  return (
    <>
      {header}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onPaste={handlePaste}
          aria-label={t('INPUT')}
          placeholder={t('INPUT')}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white dark:border-gray-700 dark:bg-gray-900"
        />

        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img.previewUrl}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  aria-label={t('REMOVE_IMAGE')}
                  onClick={() => removeImage(i)}
                  // eslint-disable-next-line vigilant-broccoli/require-dark-variant -- remove badge overlays a photo thumbnail, not a themed surface
                  className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t('GALLERY')}
          </button>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {t('CAMERA')}
          </button>
          {renderVoiceAction?.(transcript =>
            setText(prev => (prev ? `${prev}\n${transcript}` : transcript)),
          )}
        </div>

        <CalendarEventBookmarkletLink />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {parseError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 dark:text-red-300 dark:bg-red-950">
            {parseError}
          </p>
        )}

        {eventStates.map((state, index) => (
          <div key={state.id} ref={index === 0 ? firstDraftRef : undefined}>
            <EventDraftCard
              draft={state.draft}
              status={state.status}
              errorMessage={state.errorMessage}
              eventLink={state.eventLink}
              onCreate={draft => handleCreate(state.id, draft)}
              onCancel={() => handleCancel(state.id)}
            />
          </div>
        ))}
      </div>

      <div className="shrink-0 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-6 sm:pb-6">
        <button
          onClick={() => handleParse()}
          disabled={!canParse}
          className="w-full bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {t(parsing ? 'EXTRACTING' : 'EXTRACT')}
        </button>
      </div>
    </>
  );
};
