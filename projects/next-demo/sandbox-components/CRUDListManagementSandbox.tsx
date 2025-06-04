import { useEffect, useState } from 'react';
import { Button } from '../lib/components/Button';
import {
  CRUDFormProps,
  CRUDItemList,
} from '../lib/components/CRUDListManagement';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type Item = {
  id: number;
  title: string;
};

const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

export const CRUDListManagementDemo = () => {
  const [items, setItems] = useState<Item[]>([]);
  const createItemFormDefaultValues = { id: 0, title: '' };

  useEffect(() => {
    fetch(apiUrl + '?_limit=5')
      .then(res => res.json())
      .then(data => {
        setItems(data);
      });
  }, []);

  async function createItem(item: Item) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(item),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    });
    const data = await response.json();
    return {
      ...data,
      id: Math.max(...items.map(item => item.id)) + 1,
    };
  }

  async function updateItem(item: Item) {
    await fetch(`${apiUrl}/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    });
  }

  async function deleteItem(id: number) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  }

  return (
    <CRUDItemList
      createItemFormDefaultValues={createItemFormDefaultValues}
      items={items}
      setItems={setItems}
      ListItemComponent={ListItem}
      FormComponent={Form}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
    />
  );
};

const ListItem = ({ item }: { item: Item }) => {
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
}: CRUDFormProps<Item>) => {
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
        <Label htmlFor="name">Title</Label>
        <Input
          id="name"
          value={item.title}
          onChange={e =>
            setItem(prev => {
              return { ...prev, title: e.target.value };
            })
          }
        />
      </div>

      <Button
        onClick={handleSubmit}
        isLoading={isSubmitting}
        className="w-full"
      >
        Skicka
      </Button>
    </>
  );
};
