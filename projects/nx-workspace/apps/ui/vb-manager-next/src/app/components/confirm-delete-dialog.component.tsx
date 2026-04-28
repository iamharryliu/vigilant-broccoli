import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { ReactNode } from 'react';

interface ConfirmDeleteDialogProps {
  trigger: ReactNode;
  title?: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export const ConfirmDeleteDialog = ({
  trigger,
  title = 'Confirm Delete',
  description,
  confirmLabel = 'Delete',
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) => (
  <AlertDialog.Root>
    <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>
    <AlertDialog.Content maxWidth="400px">
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description>{description}</AlertDialog.Description>
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button
            variant="solid"
            color="red"
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
