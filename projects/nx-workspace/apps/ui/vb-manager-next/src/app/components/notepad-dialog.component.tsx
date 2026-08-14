'use client';

import { Dialog } from '@radix-ui/themes';
import { VisuallyHidden } from '@vigilant-broccoli/react-lib';
import { NotepadEditorComponent } from './notepad-editor.component';

interface NotepadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotepadDialog = ({ open, onOpenChange }: NotepadDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          maxWidth: '800px',
          width: '90vw',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        <VisuallyHidden>
          <Dialog.Title>Notepad</Dialog.Title>
        </VisuallyHidden>
        <NotepadEditorComponent style={{ flex: 1 }} />
      </Dialog.Content>
    </Dialog.Root>
  );
};
