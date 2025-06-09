import { useEffect, useState } from 'react';
import { Button, Heading, Switch } from '@radix-ui/themes';
import { CRUDFormProps, CRUDItemList } from '@vigilant-broccoli/react-lib';
import {
  JSONPlaceHolderPost,
  JSONPlaceholderPostService,
} from '@vigilant-broccoli/common-js';

export const CRUDListManagementDemo = () => {
  const [items, setItems] = useState<JSONPlaceHolderPost[]>([]);
  const [isCards, setIsCards] = useState(false);
  const createItemFormDefaultValues = { id: 0, title: '' };

  useEffect(() => {
    JSONPlaceholderPostService.getTodos(5).then(data => {
      setItems(data);
    });
  }, []);

  async function createItem(item: JSONPlaceHolderPost) {
    const data = await JSONPlaceholderPostService.createTodo(item, items);
    return {
      ...data,
      id: Math.max(...items.map(item => item.id)) + 1,
    };
  }

  async function updateItem(item: JSONPlaceHolderPost) {
    await JSONPlaceholderPostService.updateTodo(item);
  }

  async function deleteItem(id: number) {
    await JSONPlaceholderPostService.deleteTodo(id);
  }

  return (
    <>
      <Heading>CRUD List Management Demo</Heading>
      <Switch checked={isCards} onCheckedChange={setIsCards} />
      <CRUDItemList
        createItemFormDefaultValues={createItemFormDefaultValues}
        items={items}
        setItems={setItems}
        ListItemComponent={ListItem}
        FormComponent={Form}
        createItem={createItem}
        updateItem={updateItem}
        deleteItem={deleteItem}
        isCards={isCards}
      />
    </>
  );
};

const ListItem = ({ item }: { item: JSONPlaceHolderPost }) => {
  return (
    <span>
      {item.id} {item.title}
    </span>
  );
};

const Form = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<JSONPlaceHolderPost>) => {
  const [item, setItem] = useState(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    await submitHandler(item, formType);
    setIsSubmitting(false);
  }

  return (
    <>
      <div>
        <label htmlFor="name">Title</label>
        <input
          id="name"
          value={item.title}
          onChange={e =>
            setItem(prev => {
              return { ...prev, title: e.target.value };
            })
          }
        />
      </div>

      <Button onClick={handleSubmit} loading={isSubmitting} className="w-full">
        Submit
      </Button>
    </>
  );
};
