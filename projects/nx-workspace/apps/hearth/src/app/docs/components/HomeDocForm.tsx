'use client';

import { useRef, useState } from 'react';
import { Text } from '@radix-ui/themes';
import { Button, Input, Select, Textarea } from '@vigilant-broccoli/react-lib';
import { DOC_CATEGORIES, DocCategory } from '../../../lib/types';

export interface HomeDocFormData {
  name: string;
  description: string;
  category: DocCategory;
  files: { base64: string; mimeType: string; name: string }[];
}

interface Props {
  initialData?: Partial<Omit<HomeDocFormData, 'files'>>;
  onSubmit: (data: HomeDocFormData) => Promise<void>;
  onDelete?: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ACCEPTED = '.pdf,image/jpeg,image/png,image/webp,image/heic';

export function HomeDocForm({
  initialData,
  onSubmit,
  onDelete,
  onCancel,
  isEdit,
}: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [category, setCategory] = useState<DocCategory>(
    initialData?.category ?? 'Other',
  );
  const [pendingFiles, setPendingFiles] = useState<HomeDocFormData['files']>(
    [],
  );
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    Promise.all(
      files.map(
        file =>
          new Promise<HomeDocFormData['files'][number]>(resolve => {
            const reader = new FileReader();
            reader.onload = ev => {
              const dataUrl = ev.target?.result as string;
              resolve({
                base64: dataUrl.split(',')[1],
                mimeType: file.type,
                name: file.name,
              });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then(incoming => setPendingFiles(prev => [...prev, ...incoming]));
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isEdit && !pendingFiles.length) return;
    setSubmitting(true);
    await onSubmit({ name, description, category, files: pendingFiles });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 mt-2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Name
          </Text>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Home Insurance Policy 2025"
            required
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Description
          </Text>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional notes"
            rows={2}
          />
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Category
          </Text>
          <Select
            selectedOption={category}
            setValue={setCategory}
            options={DOC_CATEGORIES as unknown as DocCategory[]}
          />
        </div>

        {!isEdit && (
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Files (PDF, JPG, PNG, WebP)
            </Text>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              + Add Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {pendingFiles.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {pendingFiles.map((f, i) => (
                  <div
                    className="flex items-center justify-between text-sm"
                    key={i}
                  >
                    <Text size="1" className="truncate flex-1">
                      {f.name}
                    </Text>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingFiles(prev => prev.filter((_, j) => j !== i))
                      }
                      className="text-gray-400 hover:text-red-500 ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between gap-2 pt-2">
          <div>
            {isEdit && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save' : 'Upload'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
