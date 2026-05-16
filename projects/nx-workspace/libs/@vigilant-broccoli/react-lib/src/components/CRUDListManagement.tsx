import { Ellipsis, EllipsisVertical, Plus } from 'lucide-react';
import {
  ComponentType,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';
import {
  AlertDialog,
  Button,
  Card,
  Dialog,
  Heading,
  Popover,
} from '@radix-ui/themes';
import { FORM_TYPE, FormType } from '@vigilant-broccoli/common-js';

type CRUDItem = {
  id: string | number;
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
type DeleteItem = (id: string | number) => Promise<void>;

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
  ellipsis?: ReactNode;
}>;

export const CRUDItemList = <T extends CRUDItem>({
  items,
  setItems,
  HeaderComponent,
  FooterComponent,
  ListItemComponent,
  FormComponent,
  createItem,
  createItemFormDefaultValues,
  updateItem,
  deleteItem,
  onItemClick,
  copy = DEFAULT_COPY,
  isCards,
  showEllipsis = true,
}: {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  HeaderComponent?: ReactNode;
  FooterComponent?: ReactNode;
  ListItemComponent?: ListItemComponentProps<T>;
  FormComponent?: CRUDFormComponent<T>;
  createItem?: CreateItem<T>;
  createItemFormDefaultValues?: T;
  updateItem?: UpdateItem<T>;
  deleteItem?: DeleteItem;
  onItemClick?: (item: T) => void;
  copy?: ListManagementCopy;
  isCards?: boolean;
  showEllipsis?: boolean;
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
  async function handleDelete(id: string | number) {
    if (!deleteItem) return;
    await deleteItem(id);
    setItems(prev => prev.filter(item => item.id !== id));
  }

  const renderEllipsis = (item: T) =>
    showEllipsis && FormComponent ? (
      <div onClick={e => e.stopPropagation()}>
        <EllipsisOptions
          item={item}
          FormComponent={FormComponent}
          deleteItem={handleDelete}
          copy={copy}
          submitHandler={submitHandler}
        />
      </div>
    ) : undefined;

  const renderItem = (item: T) =>
    ListItemComponent ? (
      <ListItemComponent
        item={item}
        items={items}
        ellipsis={renderEllipsis(item)}
      />
    ) : (
      JSON.stringify(item)
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Heading>{copy.LIST.TITLE}</Heading>
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
          {items.map(item =>
            isCards ? (
              <Card
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className={onItemClick ? 'cursor-pointer' : ''}
              >
                {renderItem(item)}
              </Card>
            ) : (
              <div
                key={item.id}
                className={onItemClick ? 'cursor-pointer' : ''}
                onClick={() => onItemClick?.(item)}
              >
                {renderItem(item)}
              </div>
            ),
          )}
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
  deleteItem: (id: string | number) => Promise<void>;
  copy: ListManagementCopy;
}) => {
  const [updateOpen, setUpdateOpen] = useState(false);
  return (
    <>
      <EllipsisCTA
        onUpdate={() => setUpdateOpen(true)}
        onDelete={() => deleteItem(item.id)}
      />
      <CRUDItemFormDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        formType={FORM_TYPE.UPDATE}
        initialFormValues={item}
        FormComponent={UpdateFormComponent}
        submitHandler={formSubmitHandler}
        copy={copy}
      />
    </>
  );
};

export const EllipsisCTA = ({
  onUpdate,
  onDelete,
}: {
  onUpdate: () => void;
  onDelete: () => void | Promise<void>;
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div onClick={e => e.stopPropagation()}>
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="ghost">
            <EllipsisVertical className="sm:hidden" />
            <Ellipsis className="hidden sm:block" />
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-min">
          <div className="flex flex-col">
            <Button variant="ghost" onClick={onUpdate}>
              Update
            </Button>
            <Button
              variant="ghost"
              color="red"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        </Popover.Content>
      </Popover.Root>
      <DeleteItemConfirmationDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        deleteItem={async () => {
          await onDelete();
        }}
      />
    </div>
  );
};

export const DeleteItemConfirmationDialog = ({
  deleteItem,
  open,
  onOpenChange,
}: {
  deleteItem: () => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    setLoading(true);
    await deleteItem();
    setLoading(false);
  }
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {open === undefined && (
        <AlertDialog.Trigger>
          <Button className="w-min" color="red" variant="ghost">
            Delete
          </Button>
        </AlertDialog.Trigger>
      )}
      <AlertDialog.Content className="sm:max-w-[425px]">
        <AlertDialog.Title>Delete Item</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure you want to delete this item?
        </AlertDialog.Description>
        <Button color="red" loading={loading} onClick={handleDelete}>
          Delete
        </Button>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export const CRUDItemFormDialog = <T,>({
  formType,
  initialFormValues,
  FormComponent,
  submitHandler,
  copy,
  open,
  onOpenChange,
}: {
  formType: FormType;
  initialFormValues: T;
  FormComponent: CRUDFormComponent<T>;
  submitHandler: CRUDFormSubmitHandler<T>;
  copy: ListManagementCopy;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  async function dialogSubmitHandler(item: T, formType: FormType) {
    await submitHandler(item, formType);
    onOpenChange?.(false);
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {open === undefined && (
        <Dialog.Trigger>
          <Button variant="ghost">
            {formType === FORM_TYPE.CREATE ? <Plus /> : 'Update'}
          </Button>
        </Dialog.Trigger>
      )}
      <Dialog.Content onCloseAutoFocus={e => e.preventDefault()}>
        <Dialog.Title>{copy[formType].TITLE}</Dialog.Title>
        <Dialog.Description>{copy[formType].DESCRIPTION}</Dialog.Description>
        <FormComponent
          formType={formType}
          initialFormValues={initialFormValues}
          submitHandler={dialogSubmitHandler}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};
