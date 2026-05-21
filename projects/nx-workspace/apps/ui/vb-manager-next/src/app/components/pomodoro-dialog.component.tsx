'use client';

import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { PomodoroUtilityContent } from '@vigilant-broccoli/react-utility';

interface PomodoroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PomodoroDialog = ({ open, onOpenChange }: PomodoroDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{ maxWidth: '400px', width: '90vw', padding: '1.5rem' }}
      >
        <VisuallyHidden>
          <Dialog.Title>Pomodoro Timer</Dialog.Title>
        </VisuallyHidden>
        <PomodoroUtilityContent />
      </Dialog.Content>
    </Dialog.Root>
  );
};
