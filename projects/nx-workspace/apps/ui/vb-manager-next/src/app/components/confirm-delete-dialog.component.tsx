import { AlertDialog, Flex } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { ReactNode } from 'react';

interface ConfirmDeleteDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export const ConfirmDeleteDialog = ({
  trigger,
  open,
  onOpenChange,
  title = 'Confirm Delete',
  description,
  confirmLabel = 'Delete',
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>}
    <AlertDialog.Content maxWidth="400px">
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="secondary">
            Cancel
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </AlertDialog.Action>
      </Flex>
    </AlertDialog.Content>
  </AlertDialog.Root>
);
