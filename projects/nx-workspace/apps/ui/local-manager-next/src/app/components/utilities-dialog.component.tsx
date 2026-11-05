'use client';

import {
  VisuallyHidden,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { UtilitiesComponent } from './utilities.component';

interface UtilitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UtilitiesDialog = ({
  open,
  onOpenChange,
}: UtilitiesDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
      aria-describedby={undefined}
      showCloseButton={false}
      style={{ maxWidth: '500px', width: '90vw', padding: '1.5rem' }}
    >
      <VisuallyHidden>
        <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
          Utilities
        </DialogTitle>
      </VisuallyHidden>
      <UtilitiesComponent />
    </DialogContent>
  </Dialog>
);
