'use client';

import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { PomodoroComponent } from './pomodoro.component';
import { usePomodoro } from '../hooks/usePomodoro';

interface PomodoroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pomodoro: ReturnType<typeof usePomodoro>;
}

export const PomodoroDialog = ({
  open,
  onOpenChange,
  pomodoro,
}: PomodoroDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{ maxWidth: '400px', width: '90vw', padding: '1.5rem' }}
      >
        <VisuallyHidden>
          <Dialog.Title>Pomodoro Timer</Dialog.Title>
        </VisuallyHidden>
        <PomodoroComponent pomodoro={pomodoro} />
      </Dialog.Content>
    </Dialog.Root>
  );
};
