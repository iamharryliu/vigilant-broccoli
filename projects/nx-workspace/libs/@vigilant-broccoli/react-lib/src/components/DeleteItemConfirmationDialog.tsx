import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';
import { Button } from './Button';

const DEFAULT_DELETE_LABEL = 'Delete';
const DEFAULT_CANCEL_LABEL = 'Cancel';
const DEFAULT_DELETE_TITLE = 'Delete Item';
const DEFAULT_DELETE_DESCRIPTION = 'Are you sure you want to delete this item?';

export const DeleteItemConfirmationDialog = ({
  deleteItem,
  open,
  onOpenChange,
  title = DEFAULT_DELETE_TITLE,
  description = DEFAULT_DELETE_DESCRIPTION,
  confirmLabel = DEFAULT_DELETE_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
}: {
  deleteItem: () => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <AlertDialog
      open={isControlled ? open : internalOpen}
      onOpenChange={setOpen}
    >
      {!isControlled && (
        <AlertDialogTrigger asChild>
          <Button className="w-min" variant="destructive">
            {confirmLabel}
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{cancelLabel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={async event => {
                event.preventDefault();
                await deleteItem();
                setOpen(false);
              }}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
