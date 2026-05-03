'use client';

import { useRef, useState } from 'react';
import {
  EventDraftCard,
  EventDraft,
  EventDraftStatus,
} from './event-draft-card';
import { getGoogleToken } from '../providers/auth-provider';

interface ImagePreview {
  data: string;
  mimeType: string;
  previewUrl: string;
}

interface EventState {
  draft: EventDraft;
  status: EventDraftStatus;
  errorMessage?: string;
  eventLink?: string;
}

export const CalendarInput = () => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [eventStates, setEventStates] = useState<EventState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      setImages(prev => [
        ...prev,
        { data: base64, mimeType: file.type, previewUrl: result },
      ]);
    };
    reader.readAsDataURL(file);
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

  const handleParse = async () => {
    if (!text.trim() && images.length === 0) return;
    setParsing(true);
    setParseError(null);
    setEventStates([]);
    try {
      const res = await fetch('/api/calendar/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim() || undefined,
          images:
            images.length > 0
              ? images.map(i => ({ data: i.data, mimeType: i.mimeType }))
              : undefined,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error ?? 'Failed to parse');
        return;
      }
      setEventStates(
        (data.events as EventDraft[]).map(draft => ({
          draft,
          status: 'draft' as EventDraftStatus,
        })),
      );
    } finally {
      setParsing(false);
    }
  };

  const handleCreate = async (index: number, draft: EventDraft) => {
    setEventStates(prev =>
      prev.map((s, i) => (i === index ? { ...s, status: 'creating' } : s)),
    );

    const token = getGoogleToken();
    const res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(draft),
    });

    const data = await res.json();

    if (!res.ok) {
      setEventStates(prev =>
        prev.map((s, i) =>
          i === index
            ? {
                ...s,
                status: 'error',
                errorMessage: data.error ?? 'Failed to create',
              }
            : s,
        ),
      );
      return;
    }

    setEventStates(prev =>
      prev.map((s, i) =>
        i === index
          ? { ...s, status: 'created', eventLink: data.event?.htmlLink }
          : s,
      ),
    );
  };

  const handleCancel = (index: number) => {
    setEventStates(prev => prev.filter((_, i) => i !== index));
  };

  const canParse = (text.trim().length > 0 || images.length > 0) && !parsing;

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder="Paste event text, email, or image here..."
        rows={4}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
      />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img
                src={img.previewUrl}
                alt=""
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(i)}
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
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
          Gallery
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
          Camera
        </button>
        <button
          onClick={handleParse}
          disabled={!canParse}
          className="flex-1 bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {parsing ? 'Extracting...' : 'Extract events'}
        </button>
      </div>

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
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {parseError}
        </p>
      )}

      {eventStates.map((state, index) => (
        <EventDraftCard
          key={index}
          draft={state.draft}
          status={state.status}
          errorMessage={state.errorMessage}
          eventLink={state.eventLink}
          onCreate={draft => handleCreate(index, draft)}
          onCancel={() => handleCancel(index)}
        />
      ))}
    </div>
  );
};
