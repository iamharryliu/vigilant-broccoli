'use client';

import { useRef, useState } from 'react';
import {
  Button,
  Flex,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
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
      <Flex direction="column" gap="3" mt="2">
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Name
          </Text>
          <TextField.Root
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
          <TextArea
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
          <Select.Root
            value={category}
            onValueChange={v => setCategory(v as DocCategory)}
          >
            <Select.Trigger />
            <Select.Content>
              {DOC_CATEGORIES.map(c => (
                <Select.Item key={c} value={c}>
                  {c}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {!isEdit && (
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Files (PDF, JPG, PNG, WebP)
            </Text>
            <Button
              type="button"
              variant="soft"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
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
              <Flex direction="column" gap="1" mt="2">
                {pendingFiles.map((f, i) => (
                  <Flex
                    key={i}
                    align="center"
                    justify="between"
                    className="text-sm"
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
                  </Flex>
                ))}
              </Flex>
            )}
          </div>
        )}

        <Flex justify="between" gap="2" pt="2">
          <div>
            {isEdit && onDelete && (
              <Button
                type="button"
                color="red"
                variant="soft"
                onClick={onDelete}
                className="cursor-pointer"
              >
                Delete
              </Button>
            )}
          </div>
          <Flex gap="2">
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={onCancel}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting ? 'Saving...' : isEdit ? 'Save' : 'Upload'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
