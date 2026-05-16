'use client';

import { useState } from 'react';
import { Flex, Text, TextField, Badge, Button } from '@radix-ui/themes';
import { CRUDFormProps } from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';

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
};

type AnalysisPreview = {
  description: string;
  tags: string[];
  oldDescription?: string;
};

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
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisPreview, setAnalysisPreview] =
    useState<AnalysisPreview | null>(null);

  const isUpdate = formType === FORM_TYPE.UPDATE;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    Promise.all(
      files.map(
        file =>
          new Promise<PreviewImage>(resolve => {
            const reader = new FileReader();
            reader.onload = ev => {
              const dataUrl = ev.target?.result as string;
              resolve({
                base64: dataUrl.split(',')[1],
                mimeType: file.type,
                dataUrl,
              });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then(newPreviews => setPreviews(prev => [...prev, ...newPreviews]));
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

  const handleAnalyze = async () => {
    if (!title.trim() || !previews.length) return;
    setAnalyzing(true);
    setAnalysisPreview(null);
    try {
      const result = await fetchAnalysis('/api/where-is/analyze', {
        images: previews.map(p => ({ base64: p.base64, mimeType: p.mimeType })),
      });
      if (result) setAnalysisPreview(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReanalyze = async () => {
    if (!initialFormValues.id) return;
    setAnalyzing(true);
    setAnalysisPreview(null);
    try {
      const result = await fetchAnalysis('/api/where-is/reanalyze', {
        id: initialFormValues.id,
        existingTags: tags,
      });
      if (result)
        setAnalysisPreview({ ...result, oldDescription: description });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (!isUpdate && !previews.length) return;
    if (!isUpdate && !analysisPreview) {
      await handleAnalyze();
      return;
    }
    await submitHandler(
      {
        ...initialFormValues,
        title,
        description: analysisPreview?.description ?? description,
        tags: analysisPreview?.tags ?? tags,
        images: previews,
      },
      formType,
    );
  };

  return (
    <Flex direction="column" gap="3" mt="3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Title
        </Text>
        <TextField.Root
          placeholder="e.g. Kitchen cabinet above sink"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Description
        </Text>
        <TextField.Root
          placeholder="Brief description of contents"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Tags
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="Add tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1"
          />
          <Button onClick={addTag}>Add</Button>
        </Flex>
        <Flex gap="2" mt="2" wrap="wrap">
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
        </Flex>
      </div>

      {isUpdate && (
        <Button variant="soft" onClick={handleReanalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
      )}

      {!isUpdate && (
        <>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="text-sm"
          />
          {previews.length > 0 && (
            <Flex gap="2" wrap="wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  <img
                    src={p.dataUrl}
                    alt={`preview ${i + 1}`}
                    className="h-24 w-24 object-cover rounded"
                  />
                  <button
                    onClick={() =>
                      setPreviews(prev => prev.filter((_, j) => j !== i))
                    }
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white border-none rounded-full w-5 h-5 cursor-pointer text-xs leading-5 text-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </Flex>
          )}
        </>
      )}

      {analysisPreview && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              Analysis preview
            </Text>
            {analysisPreview.oldDescription ? (
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  Choose description:
                </Text>
                <Flex gap="2" direction="column">
                  {(
                    [
                      { label: '✦ New', d: analysisPreview.description },
                      { label: '◎ Current', d: analysisPreview.oldDescription },
                    ] as { label: string; d: string }[]
                  ).map(({ label, d }) => (
                    <button
                      key={label}
                      onClick={() =>
                        setAnalysisPreview(prev =>
                          prev ? { ...prev, description: d } : prev,
                        )
                      }
                      className={`text-left text-sm p-2 rounded border transition-colors ${d === analysisPreview.description ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                    >
                      {label}: {d}
                    </button>
                  ))}
                </Flex>
              </Flex>
            ) : (
              <Text size="2">{analysisPreview.description}</Text>
            )}
            <Text size="1" color="gray">
              New tags appended:
            </Text>
            <Flex gap="1" wrap="wrap">
              {analysisPreview.tags.map(tag => (
                <Badge key={tag} variant="soft" size="1">
                  {tag}
                </Badge>
              ))}
            </Flex>
            <Flex gap="2" mt="1">
              <Button size="1" onClick={handleSubmit}>
                Apply & Save
              </Button>
              <Button
                size="1"
                variant="soft"
                color="gray"
                onClick={() => setAnalysisPreview(null)}
              >
                Discard
              </Button>
            </Flex>
          </Flex>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={analyzing || !!analysisPreview}>
        {isUpdate
          ? 'Save'
          : analyzing
            ? 'Analyzing...'
            : `Analyze${previews.length > 1 ? ` (${previews.length} images)` : ''}`}
      </Button>
    </Flex>
  );
};
