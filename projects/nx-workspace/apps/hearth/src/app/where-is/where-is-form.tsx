'use client';

import { useState } from 'react';
import { Text, Badge } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  Input,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';

const API = {
  ANALYZE: '/api/where-is/analyze',
  REANALYZE: '/api/where-is/reanalyze',
} as const;

const LABEL = {
  ANALYZING: 'Analyzing...',
  SAVE: 'Save',
  REANALYZE: 'Re-analyze',
} as const;

export interface PreviewImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

export type WhereIsFormValues = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: PreviewImage[];
  imageUrls?: string[];
};

const REMOVE_BTN_CLASS =
  'absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center';

const UPLOAD_MAX_DIMENSION = 1920;
const UPLOAD_JPEG_QUALITY = 0.85;
const UPLOAD_MIME_TYPE = 'image/jpeg';

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
  return { base64: dataUrl.split(',')[1], mimeType: UPLOAD_MIME_TYPE, dataUrl };
};

const ImageGrid = ({
  imageUrls,
  previews,
  onRemoveUrl,
  onRemovePreview,
}: {
  imageUrls: string[];
  previews: PreviewImage[];
  onRemoveUrl: (url: string) => void;
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
        <button onClick={() => onRemoveUrl(url)} className={REMOVE_BTN_CLASS}>
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
}: CRUDFormProps<WhereIsFormValues>) => {
  const session = useAuth();
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
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const isUpdate = formType === FORM_TYPE.UPDATE;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
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
  ): Promise<{ description: string; tags: string[] } | null> => {
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

  const applyAnalysisResult = (result: {
    description: string;
    tags: string[];
  }) => {
    setDescription(result.description);
    setTags(prev => [...new Set([...prev, ...result.tags])]);
  };

  const handleAnalyze = async () => {
    if (!title.trim() || !previews.length) return;
    setAnalyzing(true);
    try {
      const result = await fetchAnalysis(API.ANALYZE, {
        images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
      });
      if (result) {
        applyAnalysisResult(result);
        setAnalyzed(true);
      }
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
    if (!isUpdate && !previews.length) return;
    if (!isUpdate && !analyzed) {
      await handleAnalyze();
      return;
    }
    await submitHandler(
      {
        ...initialFormValues,
        title,
        description,
        tags,
        images: previews,
        imageUrls,
      },
      formType,
    );
  };

  const submitLabel = analyzing
    ? LABEL.ANALYZING
    : isUpdate || analyzed
      ? LABEL.SAVE
      : `Analyze${previews.length > 1 ? ` (${previews.length} images)` : ''}`;

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
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="soft"
              size="1"
              className="cursor-pointer"
              onClick={() => setTags(prev => prev.filter(t => t !== tag))}
            >
              {tag} ✕
            </Badge>
          ))}
        </div>
      </div>

      <ImageGrid
        imageUrls={imageUrls}
        previews={previews}
        onRemoveUrl={url => setImageUrls(prev => prev.filter(u => u !== url))}
        onRemovePreview={i =>
          setPreviews(prev => prev.filter((_, j) => j !== i))
        }
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="text-sm"
      />

      {isUpdate && (
        <Button
          variant="secondary"
          onClick={handleReanalyze}
          disabled={analyzing}
        >
          {analyzing ? LABEL.ANALYZING : LABEL.REANALYZE}
        </Button>
      )}

      <Button onClick={handleSubmit} disabled={analyzing}>
        {submitLabel}
      </Button>
    </div>
  );
};
