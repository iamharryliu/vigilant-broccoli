'use client';

import {
  VisuallyHidden,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { NotepadEditorComponent } from './notepad-editor.component';

interface NotepadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotepadDialog = ({ open, onOpenChange }: NotepadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
        aria-describedby={undefined}
        showCloseButton={false}
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
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            Notepad
          </DialogTitle>
        </VisuallyHidden>
        <NotepadEditorComponent style={{ flex: 1 }} />
      </DialogContent>
    </Dialog>
  );
};
