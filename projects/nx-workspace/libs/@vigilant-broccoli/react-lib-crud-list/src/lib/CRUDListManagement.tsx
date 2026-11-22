import { ChevronDown, Plus } from 'lucide-react';
import {
  ComponentType,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react';
import { FORM_TYPE, FormType } from '@vigilant-broccoli/common-js';
import {
  Button,
  Card,
  ClearableInput,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  type EllipsisAction,
  EllipsisCTA,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Heading,
  IconButton,
  StackedImages,
} from '@vigilant-broccoli/react-lib';

type ListSearch = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

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
// An update may resolve with the saved item so autosaving forms can adopt server-assigned fields.
type UpdateItem<T> = (item: T) => Promise<T | void>;
type DeleteItem = (id: string | number) => Promise<void>;

type CRUDFormSubmitHandler<T> = (
  item: T,
  formType: FormType,
) => Promise<T | void>;
export type CRUDFormProps<T> = {
  formType: FormType;
  initialFormValues: T;
  submitHandler: CRUDFormSubmitHandler<T>;
  // Saves without closing the dialog, for forms that autosave.
  saveHandler?: CRUDFormSubmitHandler<T>;
  // The dialog awaits the registered guard before any close and stays open when it resolves false.
  registerCloseGuard?: (guard: CloseGuard | null) => void;
  onCancel?: () => void;
};
type CloseGuard = () => Promise<boolean>;
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
  ExpandedComponent,
  defaultExpandedIds,
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
  itemActions,
  updateLabel,
  deleteConfirmation,
  getItemImages,
  getItemTitle,
  fullWidthImage = false,
  showDialogCloseButton,
  search,
  createLabel,
  compact,
}: {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  HeaderComponent?: ReactNode;
  FooterComponent?: ReactNode;
  ListItemComponent?: ListItemComponentProps<T>;
  ExpandedComponent?: ComponentType<{ item: T }>;
  defaultExpandedIds?: T['id'][];
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
  itemActions?: (item: T) => EllipsisAction[];
  updateLabel?: string;
  deleteConfirmation?: { title?: string; description?: string };
  getItemImages?: (item: T) => string[] | undefined;
  getItemTitle?: (item: T) => string;
  fullWidthImage?: boolean;
  showDialogCloseButton?: boolean;
  search?: ListSearch;
  createLabel?: string;
  compact?: boolean;
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<T['id']>>(
    () => new Set(defaultExpandedIds),
  );
  // Kept after collapsing so the panel can animate closed.
  const [openedIds, setOpenedIds] = useState<Set<T['id']>>(
    () => new Set(defaultExpandedIds),
  );
  const toggleExpanded = (id: T['id']) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
    setOpenedIds(prev => new Set(prev).add(id));
  };

  const handleItemClick = (item: T) => {
    onItemClick?.(item);
    if (ExpandedComponent) toggleExpanded(item.id);
  };

  async function submitHandler(item: T, formType: FormType) {
    if (formType === FORM_TYPE.CREATE && createItem) {
      const newItem = await createItem(item);
      setItems(prev => [...prev, newItem]);
    }
    if (formType === FORM_TYPE.UPDATE && updateItem) {
      const saved = (await updateItem(item)) ?? item;
      setItems(prev => prev.map(x => (x.id === item.id ? saved : x)));
      return saved;
    }
  }
  async function handleDelete(id: string | number) {
    if (!deleteItem) return;
    await deleteItem(id);
    setItems(prev => prev.filter(item => item.id !== id));
  }

  const renderItem = (item: T) => {
    const showItemEllipsis =
      showEllipsis && (canShowEllipsis ? canShowEllipsis(item) : true);
    // Without a form the list is read-only: the menu holds only `itemActions`.
    const ellipsis = !showItemEllipsis ? null : FormComponent ? (
      <div onClick={e => e.stopPropagation()}>
        <EllipsisOptions
          item={item}
          FormComponent={FormComponent}
          deleteItem={handleDelete}
          copy={copy}
          submitHandler={submitHandler}
          extraActions={itemActions?.(item)}
          updateLabel={updateLabel}
          deleteConfirmation={deleteConfirmation}
          showDialogCloseButton={showDialogCloseButton}
        />
      </div>
    ) : itemActions ? (
      <EllipsisCTA actions={itemActions(item)} />
    ) : null;

    const imageUrls = getItemImages?.(item) ?? [];
    const title = getItemTitle?.(item);

    const content = ListItemComponent ? (
      <ListItemComponent item={item} items={items} />
    ) : (
      JSON.stringify(item)
    );

    const isExpanded = expandedIds.has(item.id);
    const contentWithEllipsis = (alignClass: string) => (
      <div
        className={`flex-1 min-w-0 flex justify-between gap-2 ${alignClass}`}
      >
        <div className="flex-1 min-w-0">{content}</div>
        {ExpandedComponent && (
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 self-center transition-transform duration-300',
              isExpanded && 'rotate-180',
            )}
          />
        )}
        {ellipsis && <div className="shrink-0">{ellipsis}</div>}
      </div>
    );

    const row = (() => {
      if (fullWidthImage && imageUrls.length > 0) {
        return (
          <div className="flex flex-col gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
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
        <div className="flex items-start sm:items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
          {imageUrls.length > 0 && (
            <StackedImages urls={imageUrls} alt={title} />
          )}
          {contentWithEllipsis('items-start sm:items-center')}
        </div>
      );
    })();

    if (!ExpandedComponent) return row;
    return (
      <div>
        {row}
        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
            isExpanded
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            {openedIds.has(item.id) && (
              <div className="p-2" onClick={e => e.stopPropagation()}>
                <ExpandedComponent item={item} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        {search ? (
          <div className="flex-1 min-w-0">
            <ClearableInput
              value={search.value}
              placeholder={search.placeholder}
              onChange={e => search.onChange(e.target.value)}
              onClear={() => search.onChange('')}
            />
          </div>
        ) : (
          <Heading>{copy.LIST.TITLE}</Heading>
        )}
        {createItem && createItemFormDefaultValues && FormComponent && (
          <CRUDItemFormDialog
            formType={FORM_TYPE.CREATE}
            initialFormValues={createItemFormDefaultValues}
            FormComponent={FormComponent}
            submitHandler={submitHandler}
            copy={copy}
            showCloseButton={showDialogCloseButton}
            createLabel={createLabel}
          />
        )}
      </div>
      {items.length ? (
        <>
          {HeaderComponent}
          <div className={compact ? 'space-y-1' : 'space-y-4'}>
            {items.map(item =>
              isCards ? (
                <Card
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={
                    onItemClick || ExpandedComponent ? 'cursor-pointer' : ''
                  }
                >
                  {renderItem(item)}
                </Card>
              ) : (
                <div
                  key={item.id}
                  className={
                    onItemClick || ExpandedComponent ? 'cursor-pointer' : ''
                  }
                  onClick={() => handleItemClick(item)}
                >
                  {renderItem(item)}
                </div>
              ),
            )}
          </div>
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
  extraActions,
  updateLabel = DEFAULT_UPDATE_LABEL,
  deleteConfirmation,
  showDialogCloseButton,
}: {
  item: T;
  FormComponent: CRUDFormComponent<T>;
  submitHandler: CRUDFormSubmitHandler<T>;
  deleteItem: (id: string | number) => Promise<void>;
  copy: ListManagementCopy;
  extraActions?: EllipsisAction[];
  updateLabel?: string;
  deleteConfirmation?: { title?: string; description?: string };
  showDialogCloseButton?: boolean;
}) => {
  const [updateOpen, setUpdateOpen] = useState(false);
  const hasExtraActions = Boolean(extraActions?.length);
  const ctaProps = hasExtraActions
    ? {
        actions: [
          { label: updateLabel, onSelect: () => setUpdateOpen(true) },
          ...(extraActions ?? []),
          {
            label: DEFAULT_DELETE_LABEL,
            color: 'red' as const,
            onSelect: () => deleteItem(item.id),
            confirm: {
              ...deleteConfirmation,
              confirmLabel: DEFAULT_DELETE_LABEL,
            },
          },
        ],
      }
    : {
        onUpdate: () => setUpdateOpen(true),
        onDelete: () => deleteItem(item.id),
        confirmTitle: deleteConfirmation?.title,
        confirmDescription: deleteConfirmation?.description,
      };
  return (
    <>
      <EllipsisCTA {...ctaProps} updateLabel={updateLabel} />
      <CRUDItemFormDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        formType={FORM_TYPE.UPDATE}
        initialFormValues={item}
        FormComponent={UpdateFormComponent}
        submitHandler={formSubmitHandler}
        copy={copy}
        showCloseButton={showDialogCloseButton}
      />
    </>
  );
};

const DEFAULT_DELETE_LABEL = 'Delete';
const DEFAULT_UPDATE_LABEL = 'Update';
const CLOSE_LABEL = 'Close';

export const CRUDItemFormDialog = <T,>({
  formType,
  initialFormValues,
  FormComponent,
  submitHandler,
  copy,
  open,
  onOpenChange,
  showCloseButton = false,
  createLabel,
}: {
  formType: FormType;
  initialFormValues: T;
  FormComponent: CRUDFormComponent<T>;
  submitHandler: CRUDFormSubmitHandler<T>;
  copy: ListManagementCopy;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCloseButton?: boolean;
  createLabel?: string;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeGuardRef = useRef<CloseGuard | null>(null);
  const isControlled = open !== undefined;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;
  const registerCloseGuard = useCallback((guard: CloseGuard | null) => {
    closeGuardRef.current = guard;
  }, []);
  async function dialogSubmitHandler(item: T, formType: FormType) {
    await submitHandler(item, formType);
    setOpen?.(false);
  }
  // Covers the header X, Escape and overlay clicks alike.
  async function requestClose() {
    const guard = closeGuardRef.current;
    if (guard) {
      setClosing(true);
      try {
        if (!(await guard())) return;
      } finally {
        setClosing(false);
      }
    }
    setOpen?.(false);
  }
  const handleOpenChange = (next: boolean) =>
    next ? setOpen?.(true) : requestClose();
  return (
    <Dialog
      open={isControlled ? open : internalOpen}
      onOpenChange={handleOpenChange}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost">
            {formType === FORM_TYPE.CREATE ? (
              <>
                <Plus />
                {createLabel}
              </>
            ) : (
              'Update'
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        showCloseButton={false}
        className={cn(
          'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
          FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
        )}
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <DialogTitle className="text-xl font-bold leading-7 tracking-normal">
            {copy[formType].TITLE}
          </DialogTitle>
          {showCloseButton && (
            <IconButton
              variant="ghost"
              icon="x"
              aria-label={CLOSE_LABEL}
              onClick={requestClose}
              disabled={closing}
              className="shrink-0"
            />
          )}
        </div>
        <DialogDescription className="text-base">
          {copy[formType].DESCRIPTION}
        </DialogDescription>
        <FormComponent
          formType={formType}
          initialFormValues={initialFormValues}
          submitHandler={dialogSubmitHandler}
          saveHandler={submitHandler}
          registerCloseGuard={registerCloseGuard}
          onCancel={() => setOpen?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
