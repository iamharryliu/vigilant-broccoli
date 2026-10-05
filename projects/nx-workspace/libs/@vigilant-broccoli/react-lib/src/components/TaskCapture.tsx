'use client';

import {
  ChangeEvent,
  ClipboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  HTTP_METHOD,
  HTTP_HEADERS,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { resizeImage } from '../utils/resizeImage';
import { GoogleTasksAuthAdapter } from './GoogleTasks';

const TASKS_LISTS_ENDPOINT = '/api/tasks/lists';
const TASKS_PARSE_IMAGE_ENDPOINT = '/api/tasks/parse-image';
const TASKS_CREATE_ENDPOINT = '/api/tasks/create';

const RECONNECT_GOOGLE_LABEL = 'Reconnect Google';
const RECONNECT_GOOGLE_DESCRIPTION =
  'Google Tasks access expired. Reconnect to keep creating tasks.';

type Phase = 'input' | 'analyzing' | 'preview' | 'creating' | 'done';

type TaskResult = { title: string; success: boolean; error?: string };
type TaskListOption = { id: string; title: string };

interface ImagePreview {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface TaskCaptureProps {
  auth: GoogleTasksAuthAdapter;
  onCreated?: () => void;
  taskListId?: string;
  renderVoiceAction?: (onTranscript: (text: string) => void) => ReactNode;
}

export const TaskCapture = ({
  auth,
  onCreated,
  taskListId: lockedTaskListId,
  renderVoiceAction,
}: TaskCaptureProps) => {
  const { authFetch, useGoogleToken, signInWithGoogle } = auth;
  const { clearGoogleToken } = useGoogleToken();

  const [phase, setPhase] = useState<Phase>('input');
  const [textInput, setTextInput] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [results, setResults] = useState<TaskResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [taskLists, setTaskLists] = useState<TaskListOption[]>([]);
  const [selectedListId, setSelectedListId] = useState(
    lockedTaskListId ?? '',
  );
  const [listsLoaded, setListsLoaded] = useState(!!lockedTaskListId);
  const [googleAuthError, setGoogleAuthError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lockedTaskListId || googleAuthError) return;
    let cancelled = false;
    const load = async () => {
      const res = await authFetch(TASKS_LISTS_ENDPOINT);
      if (res.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
        if (!cancelled) setGoogleAuthError(true);
        return;
      }
      const data = await res.json();
      if (cancelled) return;
      const lists: TaskListOption[] = data.taskLists ?? [];
      setTaskLists(lists);
      if (lists.length) setSelectedListId(lists[0].id ?? '');
      setListsLoaded(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, lockedTaskListId, googleAuthError]);

  useEffect(() => {
    if (googleAuthError) clearGoogleToken();
  }, [googleAuthError, clearGoogleToken]);

  const addImageFile = async (file: File) => {
    const { base64, mimeType, previewUrl } = await resizeImage(file);
    setImages(prev => [...prev, { base64, mimeType, previewUrl }]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(addImageFile);
    e.target.value = '';
  };

  const handlePaste = (e: ClipboardEvent) => {
    Array.from(e.clipboardData.items)
      .filter(item => item.type.startsWith('image/'))
      .forEach(item => {
        const file = item.getAsFile();
        if (file) addImageFile(file);
      });
  };

  const handleVoiceTranscript = (transcript: string) => {
    setTextInput(prev => (prev ? `${prev}\n${transcript}` : transcript));
  };

  const handleParse = async () => {
    if (!textInput.trim() && !images.length) return;
    setPhase('analyzing');
    setError(null);
    const res = await authFetch(TASKS_PARSE_IMAGE_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify({
        text: textInput.trim() || undefined,
        images: images.length
          ? images.map(i => ({ base64: i.base64, mimeType: i.mimeType }))
          : undefined,
        availableLists: lockedTaskListId ? undefined : taskLists,
      }),
    });
    if (!res.ok) {
      setError('Failed to extract tasks. Please try again.');
      setPhase('input');
      return;
    }
    const data = await res.json();
    if (!data.items?.length) {
      setError('No tasks found in the provided input.');
      setPhase('input');
      return;
    }
    setItems(data.items);
    if (
      !lockedTaskListId &&
      data.suggestedListId &&
      taskLists.some(l => l.id === data.suggestedListId)
    ) {
      setSelectedListId(data.suggestedListId);
    }
    setPhase('preview');
  };

  const handleCreateTasks = async () => {
    setPhase('creating');
    setError(null);
    const res = await authFetch(TASKS_CREATE_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify({ items, taskListId: selectedListId }),
    });
    if (res.status === HTTP_STATUS_CODES.UNAUTHORIZED) {
      setGoogleAuthError(true);
      setPhase('preview');
      return;
    }
    if (!res.ok) {
      setError('Failed to create tasks.');
      setPhase('preview');
      return;
    }
    const data = await res.json();
    setResults(data.results);
    setPhase('done');
    onCreated?.();
  };

  const handleReset = () => {
    setPhase('input');
    setItems([]);
    setResults([]);
    setError(null);
    setTextInput('');
    setNewItem('');
    setImages([]);
  };

  const selectedListName =
    taskLists.find(l => l.id === selectedListId)?.title ?? '';
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  if (googleAuthError) {
    return (
      <div className="space-y-3 py-4">
        <p className="text-sm text-gray-600">{RECONNECT_GOOGLE_DESCRIPTION}</p>
        <button
          onClick={() => signInWithGoogle()}
          className="w-full bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          {RECONNECT_GOOGLE_LABEL}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {phase === 'input' && (
        <>
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onPaste={handlePaste}
            placeholder={'Add a list, extra context for an image, or notes...'}
            rows={5}
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
                    onClick={() =>
                      setImages(prev => prev.filter((_, j) => j !== i))
                    }
                    className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
            {renderVoiceAction?.(handleVoiceTranscript)}
          </div>

          <button
            onClick={handleParse}
            disabled={!textInput.trim() && !images.length}
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Extract tasks
          </button>

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
        </>
      )}

      {(phase === 'analyzing' || phase === 'creating') && (
        <div className="flex items-center gap-3 py-4">
          <svg
            className="w-5 h-5 animate-spin text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-sm text-gray-600">
            {phase === 'analyzing'
              ? 'Extracting tasks...'
              : `Creating ${items.length} task${items.length !== 1 ? 's' : ''}...`}
          </p>
        </div>
      )}

      {phase === 'preview' && (
        <>
          {!lockedTaskListId && listsLoaded && taskLists.length > 1 && (
            <select
              value={selectedListId}
              onChange={e => setSelectedListId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {taskLists.map(l => (
                <option key={l.id} value={l.id ?? ''}>
                  {l.title}
                </option>
              ))}
            </select>
          )}

          <p className="text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? 's' : ''}
            {selectedListName ? ` → ${selectedListName}` : ''}
          </p>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <textarea
                  value={item}
                  rows={2}
                  onChange={e =>
                    setItems(prev =>
                      prev.map((v, j) => (j === i ? e.target.value : v)),
                    )
                  }
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
                <button
                  onClick={() =>
                    setItems(prev => prev.filter((_, j) => j !== i))
                  }
                  className="text-gray-400 hover:text-red-500 transition-colors px-1"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <textarea
              value={newItem}
              rows={2}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && newItem.trim()) {
                  e.preventDefault();
                  setItems(prev => [...prev, newItem.trim()]);
                  setNewItem('');
                }
              }}
              placeholder="Add another item..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
            <button
              onClick={() => {
                if (newItem.trim()) {
                  setItems(prev => [...prev, newItem.trim()]);
                  setNewItem('');
                }
              }}
              disabled={!newItem.trim()}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateTasks}
              disabled={!items.length || !selectedListId}
              className="flex-1 bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Create {items.length} task{items.length !== 1 ? 's' : ''}
            </button>
            <button
              onClick={handleReset}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Start over
            </button>
          </div>
        </>
      )}

      {phase === 'done' && (
        <>
          <p
            className={`text-sm rounded-xl px-4 py-3 ${failCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}
          >
            Created {successCount} task{successCount !== 1 ? 's' : ''}
            {failCount > 0 && ` · ${failCount} failed`}
          </p>

          <div className="space-y-1">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${r.success ? 'text-green-600' : 'text-red-500'}`}
                >
                  {r.success ? '✓' : '✗'}
                </span>
                <span className="text-sm text-gray-700">{r.title}</span>
                {r.error && (
                  <span className="text-xs text-red-400">({r.error})</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors"
          >
            Upload more
          </button>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
};
