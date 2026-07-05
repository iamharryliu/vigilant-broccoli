import { Plus } from 'lucide-react';
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
import { IconButton, type IconButtonIcon } from './IconButton';
import { StackedImages } from './StackedImages';

const FULL_WIDTH_IMAGE_CLASS = 'w-full h-48 object-cover rounded';

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
  canShowEllipsis,
  getItemImages,
  getItemTitle,
  fullWidthImage = false,
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
  canShowEllipsis?: (item: T) => boolean;
  getItemImages?: (item: T) => string[] | undefined;
  getItemTitle?: (item: T) => string;
  fullWidthImage?: boolean;
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

  const renderItem = (item: T) => {
    const ellipsis =
      showEllipsis &&
      FormComponent &&
      (canShowEllipsis ? canShowEllipsis(item) : true) ? (
        <div onClick={e => e.stopPropagation()}>
          <EllipsisOptions
            item={item}
            FormComponent={FormComponent}
            deleteItem={handleDelete}
            copy={copy}
            submitHandler={submitHandler}
          />
        </div>
      ) : null;

    const imageUrls = getItemImages?.(item) ?? [];
    const title = getItemTitle?.(item);

    const content = ListItemComponent ? (
      <ListItemComponent item={item} items={items} />
    ) : (
      JSON.stringify(item)
    );

    const contentWithEllipsis = (alignClass: string) => (
      <div
        className={`flex-1 min-w-0 flex justify-between gap-2 ${alignClass}`}
      >
        <div className="flex-1 min-w-0">{content}</div>
        {ellipsis && <div className="shrink-0">{ellipsis}</div>}
      </div>
    );

    if (fullWidthImage && imageUrls.length > 0) {
      return (
        <div className="flex flex-col gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <img
            src={imageUrls[0]}
            alt={title}
            className={FULL_WIDTH_IMAGE_CLASS}
          />
          {contentWithEllipsis('items-start')}
        </div>
      );
    }

    return (
      <div className="flex items-start sm:items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        {imageUrls.length > 0 && <StackedImages urls={imageUrls} alt={title} />}
        {contentWithEllipsis('items-start sm:items-center')}
      </div>
    );
  };

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

const DEFAULT_DELETE_LABEL = 'Delete';
const DEFAULT_UPDATE_LABEL = 'Update';
const DEFAULT_DELETE_TITLE = 'Delete Item';
const DEFAULT_DELETE_DESCRIPTION = 'Are you sure you want to delete this item?';

type EllipsisIcon = Extract<IconButtonIcon, `ellipsis-${string}`>;

type EllipsisActionColor = 'red' | 'green' | 'blue' | 'gray' | 'amber';

export type EllipsisAction = {
  label: string;
  onSelect: () => void | Promise<void>;
  color?: EllipsisActionColor;
  disabled?: boolean;
  confirm?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
  };
};

export const EllipsisCTA = ({
  onUpdate,
  onDelete,
  deleteDisabled = false,
  confirmDescription,
  confirmTitle,
  updateLabel = DEFAULT_UPDATE_LABEL,
  deleteLabel = DEFAULT_DELETE_LABEL,
  actions,
  icon = 'ellipsis-horizontal',
  disabled = false,
}: {
  onUpdate?: () => void;
  onDelete?: () => void | Promise<void>;
  deleteDisabled?: boolean;
  confirmDescription?: string;
  confirmTitle?: string;
  updateLabel?: string;
  deleteLabel?: string;
  actions?: EllipsisAction[];
  icon?: EllipsisIcon;
  disabled?: boolean;
}) => {
  const [pendingConfirm, setPendingConfirm] = useState<EllipsisAction | null>(
    null,
  );

  const resolvedActions: EllipsisAction[] =
    actions ??
    ([
      onUpdate && {
        label: updateLabel,
        onSelect: onUpdate,
      },
      onDelete && {
        label: deleteLabel,
        color: 'red' as const,
        disabled: deleteDisabled,
        onSelect: onDelete,
        confirm: {
          title: confirmTitle,
          description: confirmDescription,
          confirmLabel: deleteLabel,
        },
      },
    ].filter(Boolean) as EllipsisAction[]);

  const handleSelect = (action: EllipsisAction) => {
    if (action.confirm) {
      setPendingConfirm(action);
      return;
    }
    void action.onSelect();
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" icon={icon} disabled={disabled} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {resolvedActions.map((action, idx) => (
            <DropdownMenu.Item
              key={`${action.label}-${idx}`}
              color={action.color}
              disabled={action.disabled}
              onSelect={() => handleSelect(action)}
            >
              {action.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DeleteItemConfirmationDialog
        open={pendingConfirm !== null}
        onOpenChange={open => {
          if (!open) setPendingConfirm(null);
        }}
        title={pendingConfirm?.confirm?.title}
        description={pendingConfirm?.confirm?.description}
        confirmLabel={
          pendingConfirm?.confirm?.confirmLabel ?? pendingConfirm?.label
        }
        deleteItem={async () => {
          if (!pendingConfirm) return;
          await pendingConfirm.onSelect();
          setPendingConfirm(null);
        }}
      />
    </div>
  );
};

export const DeleteItemConfirmationDialog = ({
  deleteItem,
  open,
  onOpenChange,
  title = DEFAULT_DELETE_TITLE,
  description = DEFAULT_DELETE_DESCRIPTION,
  confirmLabel = DEFAULT_DELETE_LABEL,
}: {
  deleteItem: () => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    {open === undefined && (
      <AlertDialog.Trigger>
        <Button className="w-min" variant="destructive">
          {confirmLabel}
        </Button>
      </AlertDialog.Trigger>
    )}
    <AlertDialog.Content className="sm:max-w-[425px]">
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
      <Button variant="destructive" onClick={deleteItem}>
        {confirmLabel}
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
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;
  async function dialogSubmitHandler(item: T, formType: FormType) {
    await submitHandler(item, formType);
    setOpen?.(false);
  }
  return (
    <Dialog.Root
      open={isControlled ? open : internalOpen}
      onOpenChange={setOpen}
    >
      {!isControlled && (
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
