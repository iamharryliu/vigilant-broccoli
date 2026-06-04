import { useRef, useState } from 'react';
import { Badge, Text, TextField } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';

type ImageItem = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
};

type ImageItemForm = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  imageDataUrl: string;
};

type ImageItemFormWithUrl = ImageItemForm & { imageUrl?: string };

const FULL_WIDTH_IMAGE_CLASS = 'w-full h-48 object-cover rounded';

const DEFAULT_FORM: ImageItemForm = {
  id: 0,
  title: '',
  description: '',
  tags: [],
  imageDataUrl: '',
};

const COPY = {
  LIST: { TITLE: 'Image Items', EMPTY_MESSAGE: 'No items yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Item',
    DESCRIPTION: 'Upload an image with title, description, and tags.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Item',
    DESCRIPTION: 'Edit the title, description, and tags.',
  },
};

const SEED_ITEMS: ImageItem[] = [
  {
    id: 1,
    title: 'Mountain Landscape',
    description: 'A scenic view of a mountain range at sunset.',
    tags: ['nature', 'mountains', 'sunset'],
    imageUrl: 'https://picsum.photos/seed/mountain/400/300',
  },
  {
    id: 2,
    title: 'City Street',
    description: 'Busy urban street with people and traffic.',
    tags: ['city', 'urban', 'street'],
    imageUrl: 'https://picsum.photos/seed/city/400/300',
  },
  {
    id: 3,
    title: 'Ocean Waves',
    description: 'Calm ocean waves on a sandy beach.',
    tags: ['ocean', 'beach', 'waves'],
    imageUrl: 'https://picsum.photos/seed/ocean/400/300',
  },
];

const ImageListItem = ({ item }: { item: ImageItemFormWithUrl }) => (
  <div className="min-w-0">
    <Text weight="bold" size="2" as="p">
      {item.title}
    </Text>
    <Text size="1" color="gray" as="p">
      {item.description}
    </Text>
    <div className="flex flex-wrap gap-1 mt-1">
      {item.tags.map(tag => (
        <Badge key={tag} variant="soft" size="1">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

const ImageItemFormComponent = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<ImageItemForm>) => {
  const [title, setTitle] = useState(initialFormValues.title);
  const [description, setDescription] = useState(initialFormValues.description);
  const [tags, setTags] = useState<string[]>(initialFormValues.tags);
  const [tagInput, setTagInput] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(
    initialFormValues.imageDataUrl,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdate = formType === FORM_TYPE.UPDATE;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await submitHandler(
      { ...initialFormValues, title, description, tags, imageDataUrl },
      formType,
    );
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Title
        </Text>
        <TextField.Root
          placeholder="e.g. Mountain Landscape"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Description
        </Text>
        <TextField.Root
          placeholder="Brief description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Tags
        </Text>
        <div className="flex gap-2">
          <TextField.Root
            placeholder="Add tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            className="flex-1"
          />
          <Button onClick={async () => addTag()}>Add</Button>
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
      {!isUpdate && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="text-sm"
          />
          {imageDataUrl && (
            <img
              src={imageDataUrl}
              alt="preview"
              className={FULL_WIDTH_IMAGE_CLASS}
            />
          )}
        </>
      )}
      <Button onClick={handleSubmit}>{isUpdate ? 'Save' : 'Add Item'}</Button>
    </div>
  );
};

export const CRUDListWithImagesDemo = ({
  isCards,
  showEllipsis,
  fullWidthImage,
}: {
  isCards?: boolean;
  showEllipsis?: boolean;
  fullWidthImage?: boolean;
}) => {
  const [items, setItems] = useState<ImageItemForm[]>(
    SEED_ITEMS.map(item => ({ ...item, imageDataUrl: '' })),
  );
  const nextId = useRef(Math.max(...SEED_ITEMS.map(i => i.id)) + 1);

  const createItem = async (form: ImageItemForm): Promise<ImageItemForm> => {
    return { ...form, id: nextId.current++ };
  };

  const updateItem = (_form: ImageItemForm) => Promise.resolve();

  const deleteItem = (_id: string | number) => Promise.resolve();

  return (
    <CRUDItemList
      items={items as never}
      setItems={setItems as never}
      createItem={createItem as never}
      createItemFormDefaultValues={DEFAULT_FORM}
      updateItem={updateItem as never}
      deleteItem={deleteItem}
      FormComponent={ImageItemFormComponent as never}
      ListItemComponent={ImageListItem as never}
      copy={COPY}
      getItemImages={(item: ImageItemFormWithUrl) => {
        const src = item.imageDataUrl || item.imageUrl;
        return src ? [src] : [];
      }}
      getItemTitle={(item: ImageItemForm) => item.title}
      fullWidthImage={fullWidthImage}
      isCards={isCards}
      showEllipsis={showEllipsis}
    />
  );
};
