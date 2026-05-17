'use client';

import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { UtilitiesComponent } from './utilities.component';

interface UtilitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UtilitiesDialog = ({
  open,
  onOpenChange,
}: UtilitiesDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Content
      style={{ maxWidth: '500px', width: '90vw', padding: '1.5rem' }}
    >
      <VisuallyHidden>
        <Dialog.Title>Utilities</Dialog.Title>
      </VisuallyHidden>
      <UtilitiesComponent />
    </Dialog.Content>
  </Dialog.Root>
);
