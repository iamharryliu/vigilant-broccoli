import { useRef, useState, ReactNode } from 'react';
import { Badge, Text, TextField } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';

type TextItem = {
  id: number;
  title: string;
  description: string;
  tags: string[];
};

const DEFAULT_FORM: TextItem = { id: 0, title: '', description: '', tags: [] };

const COPY = {
  LIST: { TITLE: 'Items', EMPTY_MESSAGE: 'No items yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Item',
    DESCRIPTION: 'Add a new item with title, description, and tags.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Item',
    DESCRIPTION: 'Edit the title, description, and tags.',
  },
};

const SEED_ITEMS: TextItem[] = [
  {
    id: 1,
    title: 'Design System',
    description: 'Component library and design tokens.',
    tags: ['design', 'ui'],
  },
  {
    id: 2,
    title: 'API Gateway',
    description: 'Central entry point for all backend services.',
    tags: ['backend', 'infra'],
  },
  {
    id: 3,
    title: 'Auth Service',
    description: 'Handles authentication and session management.',
    tags: ['auth', 'backend'],
  },
];

const TextListItem = ({
  item,
  ellipsis,
}: {
  item: TextItem;
  ellipsis?: ReactNode;
}) => (
  <div className="flex-1 min-w-0">
    <div className="flex justify-between items-center">
      <Text weight="bold" size="2">
        {item.title}
      </Text>
      {ellipsis}
    </div>
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

const TextItemForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<TextItem>) => {
  const [title, setTitle] = useState(initialFormValues.title);
  const [description, setDescription] = useState(initialFormValues.description);
  const [tags, setTags] = useState<string[]>(initialFormValues.tags);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Title
        </Text>
        <TextField.Root
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Description
        </Text>
        <TextField.Root
          placeholder="Description"
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
      <Button
        onClick={async () =>
          submitHandler(
            { ...initialFormValues, title, description, tags },
            formType,
          )
        }
      >
        {formType === FORM_TYPE.UPDATE ? 'Save' : 'Add Item'}
      </Button>
    </div>
  );
};

export const CRUDListNoImagesDemo = ({
  isCards,
  showEllipsis,
}: {
  isCards?: boolean;
  showEllipsis?: boolean;
}) => {
  const [items, setItems] = useState<TextItem[]>(SEED_ITEMS);
  const nextId = useRef(Math.max(...SEED_ITEMS.map(i => i.id)) + 1);

  return (
    <CRUDItemList
      items={items}
      setItems={setItems}
      createItem={async form => ({ ...form, id: nextId.current++ })}
      createItemFormDefaultValues={DEFAULT_FORM}
      updateItem={() => Promise.resolve()}
      deleteItem={() => Promise.resolve()}
      FormComponent={TextItemForm}
      ListItemComponent={TextListItem as never}
      copy={COPY}
      isCards={isCards}
      showEllipsis={showEllipsis}
    />
  );
};
