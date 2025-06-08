import { EllipsisVertical, Plus } from 'lucide-react';
import {
  ComponentType,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';
import { AlertDialog, Button, Popover } from '@radix-ui/themes';
import { FORM_TYPE, FormType } from '@vigilant-broccoli/common-js';

type CRUDItem = {
  id: number;
};

interface ListManagementCopy {
  LIST: {
    TITLE: string;
    EMPTY_MESSAGE: string;
  };
  [FORM_TYPE.CREATE]: {
    TITLE: string;
    DESCRIPTION: string;
  };
  [FORM_TYPE.UPDATE]: {
    TITLE: string;
    DESCRIPTION: string;
  };
}

const DEFAULT_COPY = {
  LIST: {
    TITLE: 'CRUD List Management Title',
    EMPTY_MESSAGE: 'No items.',
  },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Create Item',
    DESCRIPTION: 'Create item description.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Item',
    DESCRIPTION: 'Update item description.',
  },
};

type CreateItem<T> = (item: T) => Promise<T>;
type UpdateItem<T> = (item: T) => Promise<void>;
type DeleteItem = (id: number) => Promise<void>;

type CRUDFormSubmitHandler<T> = (item: T, formType: FormType) => Promise<void>;
export type CRUDFormProps<T> = {
  formType: FormType;
  initialFormValues: T;
  submitHandler: CRUDFormSubmitHandler<T>;
};
type CRUDFormComponent<T> = ComponentType<CRUDFormProps<T>>;

type ListItemComponentProps<T> = ComponentType<{
  item: T;
  items: T[];
}>;

export const CRUDItemList = <T extends CRUDItem>({
  HeaderComponent,
  FooterComponent,
  items,
  setItems,
  ListItemComponent,
  FormComponent,
  createItem,
  createItemFormDefaultValues,
  updateItem,
  deleteItem,
  copy = DEFAULT_COPY,
}: {
  HeaderComponent?: ReactNode;
  FooterComponent?: ReactNode;
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  ListItemComponent: ListItemComponentProps<T>;
  FormComponent?: CRUDFormComponent<T>;
  createItem?: CreateItem<T>;
  createItemFormDefaultValues?: T;
  updateItem?: UpdateItem<T>;
  deleteItem?: DeleteItem;
  copy?: ListManagementCopy;
}) => {
  async function submitHandler(item: T, formType: FormType) {
    if (formType === FORM_TYPE.CREATE && createItem) {
      const newItem = await createItem(item);
      setItems(prev => [...prev, newItem]);
    }
    if (formType === FORM_TYPE.UPDATE && updateItem) {
      await updateItem(item);
      setItems(prev => prev.map(x => (x.id === item.id ? item : x)));
    }
  }
  async function handleDelete(id: number) {
    if (!deleteItem) return;
    await deleteItem(id);
    setItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>{copy.LIST.TITLE}</h2>
        {createItem && createItemFormDefaultValues && FormComponent && (
          <CRUDItemFormDialog
            formType={FORM_TYPE.CREATE}
            initialFormValues={createItemFormDefaultValues}
            FormComponent={FormComponent}
            submitHandler={submitHandler}
            copy={copy}
          />
        )}
      </div>
      {items.length ? (
        <>
          {HeaderComponent}
          {items.map(item => {
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="w-full">
                  <ListItemComponent item={item} items={items} />
                </div>
                {FormComponent && (
                  <EllipsisOptions
                    item={item}
                    FormComponent={FormComponent}
                    deleteItem={handleDelete}
                    copy={copy}
                    submitHandler={submitHandler}
                  />
                )}
              </div>
            );
          })}
          {FooterComponent}
        </>
      ) : (
        <p>{copy.LIST.EMPTY_MESSAGE}</p>
      )}
    </div>
  );
};

const EllipsisOptions = <T extends CRUDItem>({
  item,
  FormComponent: UpdateFormComponent,
  submitHandler: formSubmitHandler,
  deleteItem,
  copy,
}: {
  item: T;
  FormComponent: CRUDFormComponent<T>;
  submitHandler: CRUDFormSubmitHandler<T>;
  deleteItem: DeleteItem;
  copy: ListManagementCopy;
}) => {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="ghost">
          <EllipsisVertical />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-min">
        <CRUDItemFormDialog
          formType={FORM_TYPE.UPDATE}
          initialFormValues={item}
          FormComponent={UpdateFormComponent}
          submitHandler={formSubmitHandler}
          copy={copy}
        />
        <DeleteItemConfirmationDialog deleteItem={() => deleteItem(item.id)} />
      </Popover.Content>
    </Popover.Root>
  );
};

export const DeleteItemConfirmationDialog = ({
  deleteItem,
}: {
  deleteItem: () => Promise<void>;
}) => {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button className="w-min text-red-500" variant="ghost">
          Ta Bort
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content className="sm:max-w-[425px]">
        <AlertDialog.Title>Ta Bort Samtalstagg</AlertDialog.Title>
        <AlertDialog.Description>{`Är du säker på att du vill ta bort?`}</AlertDialog.Description>
        <Button onClick={deleteItem}>Ja</Button>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

const CRUDItemFormDialog = <T,>({
  formType,
  initialFormValues,
  FormComponent,
  submitHandler,
  copy,
}: {
  formType: FormType;
  initialFormValues: T;
  FormComponent: CRUDFormComponent<T>;
  submitHandler: CRUDFormSubmitHandler<T>;
  copy: ListManagementCopy;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  async function diaglogSubmitHandler(item: T, formType: FormType) {
    await submitHandler(item, formType);
    setIsOpen(false);
  }
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialog.Trigger>
        <Button variant="ghost" onClick={() => setIsOpen(true)}>
          {formType === FORM_TYPE.CREATE ? <Plus /> : 'Uppdatera'}
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>{copy[formType].TITLE}</AlertDialog.Title>
        <AlertDialog.Description>
          {copy[formType].DESCRIPTION}
        </AlertDialog.Description>
        <FormComponent
          formType={formType}
          initialFormValues={initialFormValues}
          submitHandler={diaglogSubmitHandler}
        />
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
