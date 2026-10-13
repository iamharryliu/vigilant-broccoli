'use client';

import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './Dialog';
import { TaskCapture, TaskCaptureProps } from './TaskCapture';

const DEFAULT_TITLE = 'Create tasks';

const DIALOG_CONTENT_CLASS =
  'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto';

export interface CreateTasksDialogProps extends TaskCaptureProps {
  trigger: ReactNode;
  title?: string;
}

export const CreateTasksDialog = ({
  trigger,
  title = DEFAULT_TITLE,
  auth,
  onCreated,
  taskListId,
  renderVoiceAction,
}: CreateTasksDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={DIALOG_CONTENT_CLASS}
        aria-describedby={undefined}
      >
        <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
          {title}
        </DialogTitle>
        {open && (
          <TaskCapture
            auth={auth}
            taskListId={taskListId}
            renderVoiceAction={renderVoiceAction}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
