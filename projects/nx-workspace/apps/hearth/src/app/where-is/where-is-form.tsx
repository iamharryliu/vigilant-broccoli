'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Badge,
  Button,
  Checkbox,
  DeleteItemConfirmationDialog,
  Input,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { CRUDFormProps } from '@vigilant-broccoli/react-lib-higher-level';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImagePlus, Sparkles, type LucideIcon } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useAuth } from '../providers/auth-provider';
import { sortTags } from './where-is-tags';

const ERROR_SAVE_FALLBACK = 'Saving failed. Please try again.';
const ERROR_ANALYZE = 'Analysis failed. Please try again.';

const TAG_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;
const AUTOSAVE_DEBOUNCE_MS = 800;

const API = {
  ANALYZE: '/api/where-is/analyze',
  REANALYZE: '/api/where-is/reanalyze',
} as const;

const LABEL = {
  ADD_SELECTED: 'Add selected',
  ANALYZING: 'Analyzing...',
  CANCEL: 'Cancel',
  CHOOSE_PHOTOS: 'Choose Photos',
  CLEAR_ALL: 'Clear all',
  DISMISS: 'Dismiss',
  DONE: 'Done',
  NO_NEW_TAGS: 'No new tags suggested.',
  SELECT_ALL: 'Select all',
  SUGGEST_TAGS: 'Suggest tags',
  REMOVE: 'Remove',
  REMOVE_PHOTO_DESCRIPTION: 'Remove this photo from the storage area?',
  REMOVE_PHOTO_TITLE: 'Remove Photo',
  REORDER_PHOTO: 'Drag to reorder photo',
  SAVED: 'Saved',
  SAVING: 'Saving...',
  SUBMIT: 'Submit',
  SUBMITTING: 'Submitting...',
  SUGGESTED_TAGS: 'Suggested tags',
  TITLE_REQUIRED: 'A title is required to save.',
} as const;

const SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
} as const;
type SaveStatus = (typeof SAVE_STATUS)[keyof typeof SAVE_STATUS];

export interface PreviewImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
  blob: Blob;
}

export type WhereIsFormValues = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: PreviewImage[];
  imageUrls?: string[];
  imageKeys?: string[];
};

type ExistingImage = { key: string; url: string };

type PendingRemoval =
  | { kind: 'existing'; key: string }
  | { kind: 'preview'; preview: PreviewImage };

const REMOVE_BTN_CLASS =
  'absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center disabled:cursor-not-allowed disabled:opacity-50';
const TILE_IMG_CLASS = 'h-24 w-24 object-cover rounded';

const UPLOAD_MAX_DIMENSION = 1920;
const UPLOAD_JPEG_QUALITY = 0.85;
const UPLOAD_MIME_TYPE = 'image/jpeg';

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      blob =>
        blob ? resolve(blob) : reject(new Error('Failed to create blob')),
      UPLOAD_MIME_TYPE,
      UPLOAD_JPEG_QUALITY,
    );
  });

const resizeImageFile = async (file: File): Promise<PreviewImage> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    UPLOAD_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL(UPLOAD_MIME_TYPE, UPLOAD_JPEG_QUALITY);
  const blob = await canvasToBlob(canvas);
  return {
    base64: dataUrl.split(',')[1],
    mimeType: UPLOAD_MIME_TYPE,
    dataUrl,
    blob,
  };
};

const toExistingImages = (values: WhereIsFormValues): ExistingImage[] =>
  (values.imageKeys ?? []).map((key, i) => ({
    key,
    url: values.imageUrls?.[i] ?? '',
  }));

// Previews are excluded: any unsaved preview makes the form dirty on its own.
const savedSnapshot = (values: WhereIsFormValues) =>
  JSON.stringify([
    values.title,
    values.description,
    values.tags,
    values.imageKeys ?? [],
  ]);

// Keeps the remove button from starting a drag or keyboard sort on its tile.
const stopDragStart = {
  onMouseDown: (e: React.SyntheticEvent) => e.stopPropagation(),
  onTouchStart: (e: React.SyntheticEvent) => e.stopPropagation(),
  onKeyDown: (e: React.SyntheticEvent) => e.stopPropagation(),
};

const RemoveButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    aria-label={LABEL.REMOVE_PHOTO_TITLE}
    onClick={onClick}
    disabled={disabled}
    className={REMOVE_BTN_CLASS}
    {...stopDragStart}
  >
    ✕
  </button>
);

const SortableImageTile = ({
  image,
  index,
  sortable,
  disabled,
  onRemove,
}: {
  image: ExistingImage;
  index: number;
  sortable: boolean;
  disabled: boolean;
  onRemove: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.key, disabled: !sortable || disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : undefined,
      }}
      className={`relative ${sortable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      {...(sortable ? { ...attributes, ...listeners } : {})}
      aria-label={sortable ? LABEL.REORDER_PHOTO : undefined}
    >
      <img
        src={image.url}
        alt={`image ${index + 1}`}
        className={TILE_IMG_CLASS}
        draggable={false}
      />
      <RemoveButton onClick={onRemove} disabled={disabled} />
    </div>
  );
};

const ImageGrid = ({
  existing,
  previews,
  sortable,
  disabled,
  onReorder,
  onRemove,
  children,
}: {
  existing: ExistingImage[];
  previews: PreviewImage[];
  sortable: boolean;
  disabled: boolean;
  onReorder: (images: ExistingImage[]) => void;
  onRemove: (removal: PendingRemoval) => void;
  children: ReactNode;
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // A long-press delay keeps swipes over the photos scrolling the dialog.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = existing.findIndex(img => img.key === active.id);
    const newIndex = existing.findIndex(img => img.key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(existing, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 flex-wrap">
        <SortableContext
          items={existing.map(img => img.key)}
          strategy={rectSortingStrategy}
        >
          {existing.map((image, i) => (
            <SortableImageTile
              key={image.key}
              image={image}
              index={i}
              sortable={sortable}
              disabled={disabled}
              onRemove={() => onRemove({ kind: 'existing', key: image.key })}
            />
          ))}
        </SortableContext>
        {previews.map((preview, i) => (
          <div key={i} className="relative">
            <img
              src={preview.dataUrl}
              alt={`new ${i + 1}`}
              className={TILE_IMG_CLASS}
            />
            <RemoveButton
              onClick={() => onRemove({ kind: 'preview', preview })}
              disabled={disabled}
            />
          </div>
        ))}
        {children}
      </div>
    </DndContext>
  );
};

const AddPhotoTile = ({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className="h-24 w-24 flex items-center justify-center rounded border border-[var(--gray-a7)] text-[var(--gray-11)] cursor-pointer transition-colors hover:bg-[var(--gray-a3)] hover:text-[var(--gray-12)] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Icon size={24} />
  </button>
);

const TagSuggestions = ({
  suggestions,
  onConfirm,
  onDismiss,
}: {
  suggestions: string[];
  onConfirm: (tags: string[]) => void;
  onDismiss: () => void;
}) => {
  const [selected, setSelected] = useState(() => new Set(suggestions));
  const toggle = (tag: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (!next.delete(tag)) next.add(tag);
      return next;
    });

  return (
    <div className="rounded-md border border-[var(--gray-a6)] p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Text size="1" weight="medium" as="p">
          {LABEL.SUGGESTED_TAGS}
        </Text>
        {suggestions.length > 1 && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="xs"
              disabled={selected.size === suggestions.length}
              onClick={() => setSelected(new Set(suggestions))}
            >
              {LABEL.SELECT_ALL}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              disabled={!selected.size}
              onClick={() => setSelected(new Set())}
            >
              {LABEL.CLEAR_ALL}
            </Button>
          </div>
        )}
      </div>
      {suggestions.length ? (
        <div className="flex flex-col gap-1.5">
          {sortTags(suggestions).map(tag => (
            <label
              key={tag}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selected.has(tag)}
                onCheckedChange={() => toggle(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
      ) : (
        <Text size="1" color="gray" as="p">
          {LABEL.NO_NEW_TAGS}
        </Text>
      )}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onDismiss}>
          {suggestions.length ? LABEL.CANCEL : LABEL.DISMISS}
        </Button>
        {suggestions.length > 0 && (
          <Button
            size="sm"
            disabled={!selected.size}
            onClick={() => onConfirm([...selected])}
          >
            {LABEL.ADD_SELECTED}
          </Button>
        )}
      </div>
    </div>
  );
};

export const WhereIsFormComponent = ({
  formType,
  initialFormValues,
  submitHandler,
  saveHandler,
  registerCloseGuard,
  onCancel,
}: CRUDFormProps<WhereIsFormValues>) => {
  const session = useAuth();
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialFormValues.title);
  const [description, setDescription] = useState(initialFormValues.description);
  const [tags, setTags] = useState<string[]>(initialFormValues.tags);
  const [tagInput, setTagInput] = useState('');
  const [previews, setPreviews] = useState<PreviewImage[]>(
    initialFormValues.images,
  );
  const [existing, setExisting] = useState<ExistingImage[]>(() =>
    toExistingImages(initialFormValues),
  );
  const [suggestedTags, setSuggestedTags] = useState<string[] | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null,
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SAVE_STATUS.IDLE);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');

  const isUpdate = formType === FORM_TYPE.UPDATE;
  const isSaving = saveStatus === SAVE_STATUS.SAVING;

  const values: WhereIsFormValues = {
    ...initialFormValues,
    title,
    description,
    tags,
    images: previews,
    imageUrls: existing.map(img => img.url),
    imageKeys: existing.map(img => img.key),
  };

  // Saves run from timers and promise chains, so they read the latest values through refs.
  const latestRef = useRef(values);
  latestRef.current = values;
  const saveHandlerRef = useRef(saveHandler);
  saveHandlerRef.current = saveHandler;
  const lastSavedRef = useRef(savedSnapshot(initialFormValues));
  const hasUnsavedChanges = (snapshot: WhereIsFormValues) =>
    snapshot.images.length > 0 ||
    savedSnapshot(snapshot) !== lastSavedRef.current;
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const saveQueuedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Serialized so overlapping PATCHes cannot race; a queued save coalesces later edits.
  const runSave = useCallback(() => {
    clearTimeout(debounceRef.current);
    if (saveQueuedRef.current) return saveChainRef.current;
    saveQueuedRef.current = true;
    saveChainRef.current = saveChainRef.current.then(async () => {
      saveQueuedRef.current = false;
      const snapshot = latestRef.current;
      const save = saveHandlerRef.current;
      if (!save || !hasUnsavedChanges(snapshot)) return;
      if (!snapshot.title.trim()) {
        setError(LABEL.TITLE_REQUIRED);
        return;
      }

      setSaveStatus(SAVE_STATUS.SAVING);
      setError('');
      try {
        const saved = (await save(snapshot, FORM_TYPE.UPDATE)) ?? snapshot;
        const savedExisting = toExistingImages(saved);
        const remainingPreviews = latestRef.current.images.filter(
          p => !snapshot.images.includes(p),
        );
        lastSavedRef.current = savedSnapshot({
          ...snapshot,
          imageKeys: savedExisting.map(img => img.key),
        });
        // Updated ahead of the re-render so an already-queued save does not re-upload these previews.
        latestRef.current = {
          ...latestRef.current,
          images: remainingPreviews,
          imageUrls: savedExisting.map(img => img.url),
          imageKeys: savedExisting.map(img => img.key),
        };
        setExisting(savedExisting);
        setPreviews(remainingPreviews);
        setSaveStatus(SAVE_STATUS.SAVED);
      } catch (e) {
        setError(e instanceof Error ? e.message : ERROR_SAVE_FALLBACK);
        setSaveStatus(SAVE_STATUS.ERROR);
      }
    });
    return saveChainRef.current;
  }, []);

  // Waits for the save so a failure stays visible instead of surfacing after the dialog closes.
  const flushBeforeClose = useCallback(async () => {
    await runSave();
    return !hasUnsavedChanges(latestRef.current);
  }, [runSave]);

  const handleDone = async () => {
    setClosing(true);
    try {
      if (await flushBeforeClose()) onCancel?.();
    } finally {
      setClosing(false);
    }
  };

  useEffect(() => {
    if (!isUpdate || !registerCloseGuard) return;
    registerCloseGuard(flushBeforeClose);
    return () => registerCloseGuard(null);
  }, [isUpdate, registerCloseGuard, flushBeforeClose]);

  useEffect(() => {
    if (!isUpdate) return;
    const warnIfUnsaved = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges(latestRef.current)) e.preventDefault();
    };
    window.addEventListener('beforeunload', warnIfUnsaved);
    return () => window.removeEventListener('beforeunload', warnIfUnsaved);
  }, [isUpdate]);

  useEffect(() => {
    if (isUpdate) runSave();
  }, [isUpdate, runSave, tags, previews, existing]);

  useEffect(() => {
    if (!isUpdate) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSave, AUTOSAVE_DEBOUNCE_MS);
  }, [isUpdate, runSave, title, description]);

  // Flushes a pending debounced edit when the dialog closes.
  useEffect(
    () => () => {
      if (isUpdate) runSave();
    },
    [isUpdate, runSave],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    Promise.all(files.map(resizeImageFile)).then(newPreviews =>
      setPreviews(prev => [...prev, ...newPreviews]),
    );
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const fetchAnalysis = async (
    url: string,
    body: object,
  ): Promise<{ tags: string[] } | null> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json();
  };

  const runAnalysis = async (url: string, body: object) => {
    setAnalyzing(true);
    setSuggestedTags(null);
    try {
      const result = await fetchAnalysis(url, body);
      if (!result) {
        setError(ERROR_ANALYZE);
        return;
      }
      const current = latestRef.current.tags;
      setSuggestedTags(
        [...new Set(result.tags.map(t => t.trim().toLowerCase()))].filter(
          t => t && !current.includes(t),
        ),
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (!previews.length) return;
    runAnalysis(API.ANALYZE, {
      images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
    });
  };

  const handleReanalyze = () => {
    if (!initialFormValues.id) return;
    runAnalysis(API.REANALYZE, {
      id: initialFormValues.id,
      existingTags: tags,
      additionalImages: previews.map(p => ({
        base64: p.base64,
        mimeType: p.mimeType,
      })),
    });
  };

  const confirmSuggestedTags = (selected: string[]) => {
    setTags(prev => [...new Set([...prev, ...selected])]);
    setSuggestedTags(null);
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    if (pendingRemoval.kind === 'existing') {
      const { key } = pendingRemoval;
      setExisting(prev => prev.filter(img => img.key !== key));
    } else {
      const { preview } = pendingRemoval;
      setPreviews(prev => prev.filter(p => p !== preview));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await submitHandler(values, formType);
    } catch (e) {
      setError(e instanceof Error ? e.message : ERROR_SAVE_FALLBACK);
    } finally {
      setSubmitting(false);
    }
  };

  const hasPhotos = existing.length + previews.length > 0;
  const photosLocked = submitting || isSaving;

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Title
        </Text>
        <Input
          placeholder="e.g. Kitchen cabinet above sink"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Description
        </Text>
        <Textarea
          placeholder="Brief description of contents"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Tags
        </Text>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1"
          />
          <Button onClick={addTag}>Add</Button>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <MotionConfig reducedMotion="user">
            <AnimatePresence initial={false} mode="popLayout">
              {sortTags(tags).map(tag => (
                <motion.span
                  key={tag}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={TAG_TRANSITION}
                  className="inline-flex"
                >
                  <Badge
                    variant="soft"
                    size="1"
                    className="cursor-pointer"
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                  >
                    {tag} ✕
                  </Badge>
                </motion.span>
              ))}
              <motion.span
                key={LABEL.SUGGEST_TAGS}
                layout
                transition={TAG_TRANSITION}
                className="inline-flex"
              >
                <Badge asChild variant="outline" size="1">
                  <button
                    type="button"
                    onClick={isUpdate ? handleReanalyze : handleAnalyze}
                    disabled={analyzing || submitting || !hasPhotos}
                    className="cursor-pointer gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    {analyzing ? LABEL.ANALYZING : LABEL.SUGGEST_TAGS}
                  </button>
                </Badge>
              </motion.span>
            </AnimatePresence>
          </MotionConfig>
        </div>
      </div>

      {suggestedTags && (
        <TagSuggestions
          key={suggestedTags.join(',')}
          suggestions={suggestedTags}
          onConfirm={confirmSuggestedTags}
          onDismiss={() => setSuggestedTags(null)}
        />
      )}

      <ImageGrid
        existing={existing}
        previews={previews}
        sortable={isUpdate}
        disabled={photosLocked}
        onReorder={setExisting}
        onRemove={setPendingRemoval}
      >
        <AddPhotoTile
          icon={ImagePlus}
          label={LABEL.CHOOSE_PHOTOS}
          onClick={() => libraryInputRef.current?.click()}
          disabled={photosLocked}
        />
      </ImageGrid>
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <Text size="1" color="red" as="p" role="alert">
          {error}
        </Text>
      )}

      {isUpdate ? (
        <div className="flex items-center justify-between gap-2">
          <Text size="1" color="gray" as="p" aria-live="polite">
            {isSaving
              ? LABEL.SAVING
              : saveStatus === SAVE_STATUS.SAVED
                ? LABEL.SAVED
                : ''}
          </Text>
          {onCancel && (
            <Button variant="outline" onClick={handleDone} disabled={closing}>
              {closing ? LABEL.SAVING : LABEL.DONE}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={analyzing || submitting}>
            {submitting ? LABEL.SUBMITTING : LABEL.SUBMIT}
          </Button>
        </div>
      )}

      <DeleteItemConfirmationDialog
        open={pendingRemoval !== null}
        onOpenChange={open => !open && setPendingRemoval(null)}
        title={LABEL.REMOVE_PHOTO_TITLE}
        description={LABEL.REMOVE_PHOTO_DESCRIPTION}
        confirmLabel={LABEL.REMOVE}
        deleteItem={confirmRemoval}
      />
    </div>
  );
};
