import { EllipsisVertical, MoreHorizontal, Plus } from 'lucide-react';
import {
  ComponentType,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';
import {
  AlertDialog,
  Card,
  Dialog,
  DropdownMenu,
  Heading,
} from '@radix-ui/themes';
import { FORM_TYPE, FormType } from '@vigilant-broccoli/common-js';
import { Button } from './Button';

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

const DEFAULT_DELETE_DESCRIPTION = 'Are you sure you want to delete this item?';

export const ELLIPSIS_ICON = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
} as const;
export type EllipsisIcon = (typeof ELLIPSIS_ICON)[keyof typeof ELLIPSIS_ICON];

const ELLIPSIS_ICON_SIZE = 16;

export const EllipsisCTA = ({
  onUpdate,
  onDelete,
  deleteDisabled = false,
  confirmDescription,
  icon = ELLIPSIS_ICON.HORIZONTAL,
}: {
  onUpdate?: () => void;
  onDelete: () => void | Promise<void>;
  deleteDisabled?: boolean;
  confirmDescription?: string;
  icon?: EllipsisIcon;
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const TriggerIcon =
    icon === ELLIPSIS_ICON.VERTICAL ? EllipsisVertical : MoreHorizontal;
  return (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button size="icon" variant="ghost">
            <TriggerIcon size={ELLIPSIS_ICON_SIZE} />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {onUpdate && (
            <DropdownMenu.Item onSelect={onUpdate}>Update</DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            color="red"
            disabled={deleteDisabled}
            onSelect={() => setConfirmDelete(true)}
          >
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DeleteItemConfirmationDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        description={confirmDescription}
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
  description = DEFAULT_DELETE_DESCRIPTION,
}: {
  deleteItem: () => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  description?: string;
}) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    {open === undefined && (
      <AlertDialog.Trigger>
        <Button className="w-min" variant="destructive">
          Delete
        </Button>
      </AlertDialog.Trigger>
    )}
    <AlertDialog.Content className="sm:max-w-[425px]">
      <AlertDialog.Title>Delete Item</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
      <Button variant="destructive" onClick={deleteItem}>
        Delete
      </Button>
    </AlertDialog.Content>
  </AlertDialog.Root>
);

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
