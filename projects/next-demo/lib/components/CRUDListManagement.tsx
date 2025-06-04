import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { EllipsisVertical, Plus } from 'lucide-react';
import {
  ComponentType,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';
import { FORM_TYPE, FormType } from '../consts';

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
    TITLE: 'Title',
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
  FormComponent: CRUDFormComponent<T>;
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
        {createItem && createItemFormDefaultValues && (
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
                <EllipsisOptions
                  item={item}
                  FormComponent={FormComponent}
                  deleteItem={handleDelete}
                  copy={copy}
                  submitHandler={submitHandler}
                />
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <EllipsisVertical />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-min">
        <CRUDItemFormDialog
          formType={FORM_TYPE.UPDATE}
          initialFormValues={item}
          FormComponent={UpdateFormComponent}
          submitHandler={formSubmitHandler}
          copy={copy}
        />
        <DeleteItemConfirmationDialog deleteItem={() => deleteItem(item.id)} />
      </PopoverContent>
    </Popover>
  );
};

export const DeleteItemConfirmationDialog = ({
  deleteItem,
}: {
  deleteItem: () => Promise<void>;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-min text-red-500" variant="ghost">
          Ta Bort
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ta Bort Samtalstagg</DialogTitle>
          <DialogDescription>{`Är du säker på att du vill ta bort?`}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={deleteItem}>
            Ja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)}>
        {formType === FORM_TYPE.CREATE ? <Plus /> : 'Uppdatera'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy[formType].TITLE}</DialogTitle>
            <DialogDescription>{copy[formType].DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <FormComponent
            formType={formType}
            initialFormValues={initialFormValues}
            submitHandler={diaglogSubmitHandler}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
