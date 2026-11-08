'use client';

import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  Input,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { CRUDFormProps } from '@vigilant-broccoli/react-lib-higher-level';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useAuth } from '../providers/auth-provider';
import { sortTags } from './where-is-tags';

const ERROR_SAVE_FALLBACK = 'Saving failed. Please try again.';

const TAG_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;

const API = {
  ANALYZE: '/api/where-is/analyze',
  REANALYZE: '/api/where-is/reanalyze',
} as const;

const LABEL = {
  ANALYZE: 'Analyze',
  ANALYZING: 'Analyzing...',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  SAVING: 'Saving...',
  REANALYZE: 'Re-analyze',
  TAKE_PHOTO: 'Take Photo',
  CHOOSE_PHOTOS: 'Choose Photos',
} as const;

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

const REMOVE_BTN_CLASS =
  'absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center';

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

const ImageGrid = ({
  imageUrls,
  previews,
  onRemoveExisting,
  onRemovePreview,
}: {
  imageUrls: string[];
  previews: PreviewImage[];
  onRemoveExisting: (index: number) => void;
  onRemovePreview: (index: number) => void;
}) => (
  <div className="flex gap-2 flex-wrap">
    {imageUrls.map((url, i) => (
      <div key={url} className="relative">
        <img
          src={url}
          alt={`image ${i + 1}`}
          className="h-24 w-24 object-cover rounded"
        />
        <button
          onClick={() => onRemoveExisting(i)}
          className={REMOVE_BTN_CLASS}
        >
          ✕
        </button>
      </div>
    ))}
    {previews.map((p, i) => (
      <div key={i} className="relative">
        <img
          src={p.dataUrl}
          alt={`new ${i + 1}`}
          className="h-24 w-24 object-cover rounded"
        />
        <button onClick={() => onRemovePreview(i)} className={REMOVE_BTN_CLASS}>
          ✕
        </button>
      </div>
    ))}
  </div>
);

export const WhereIsFormComponent = ({
  formType,
  initialFormValues,
  submitHandler,
  onCancel,
}: CRUDFormProps<WhereIsFormValues>) => {
  const session = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialFormValues.title);
  const [description, setDescription] = useState(initialFormValues.description);
  const [tags, setTags] = useState<string[]>(initialFormValues.tags);
  const [tagInput, setTagInput] = useState('');
  const [previews, setPreviews] = useState<PreviewImage[]>(
    initialFormValues.images,
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialFormValues.imageUrls ?? [],
  );
  const [imageKeys, setImageKeys] = useState<string[]>(
    initialFormValues.imageKeys ?? [],
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isUpdate = formType === FORM_TYPE.UPDATE;

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

  const applyAnalysisResult = (result: { tags: string[] }) => {
    setTags(prev => [...new Set([...prev, ...result.tags])]);
  };

  const handleAnalyze = async () => {
    if (!previews.length) return;
    setAnalyzing(true);
    try {
      const result = await fetchAnalysis(API.ANALYZE, {
        images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
      });
      if (result) applyAnalysisResult(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReanalyze = async () => {
    if (!initialFormValues.id) return;
    setAnalyzing(true);
    try {
      const result = await fetchAnalysis(API.REANALYZE, {
        id: initialFormValues.id,
        existingTags: tags,
        additionalImages: previews.map(p => ({
          base64: p.base64,
          mimeType: p.mimeType,
        })),
      });
      if (result) applyAnalysisResult(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await submitHandler(
        {
          ...initialFormValues,
          title,
          description,
          tags,
          images: previews,
          imageUrls,
          imageKeys,
        },
        formType,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : ERROR_SAVE_FALLBACK);
    } finally {
      setSubmitting(false);
    }
  };

  const hasPhotos = imageUrls.length + previews.length > 0;

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
            </AnimatePresence>
          </MotionConfig>
        </div>
      </div>

      <ImageGrid
        imageUrls={imageUrls}
        previews={previews}
        onRemoveExisting={i => {
          setImageUrls(prev => prev.filter((_, j) => j !== i));
          setImageKeys(prev => prev.filter((_, j) => j !== i));
        }}
        onRemovePreview={i =>
          setPreviews(prev => prev.filter((_, j) => j !== i))
        }
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
        >
          {LABEL.TAKE_PHOTO}
        </Button>
        <Button
          variant="outline"
          onClick={() => libraryInputRef.current?.click()}
        >
          {LABEL.CHOOSE_PHOTOS}
        </Button>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        variant="secondary"
        onClick={isUpdate ? handleReanalyze : handleAnalyze}
        disabled={analyzing || submitting || !hasPhotos}
      >
        {analyzing
          ? LABEL.ANALYZING
          : isUpdate
            ? LABEL.REANALYZE
            : LABEL.ANALYZE}
      </Button>

      {error && (
        <Text size="1" color="red" as="p" role="alert">
          {error}
        </Text>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1"
          >
            {LABEL.CANCEL}
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={analyzing || submitting}
          className="flex-1"
        >
          {submitting ? LABEL.SAVING : LABEL.SAVE}
        </Button>
      </div>
    </div>
  );
};
