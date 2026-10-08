import { CreateTasksDialog, IconButton } from '@vigilant-broccoli/react-lib';
import { googleTasksAuth } from '../../libs/auth';
import { TaskVoiceButton } from './task-voice-button.component';

const CREATE_TASKS_LABEL = 'Create tasks';

export const CreateTasksDialogTrigger = ({
  taskListId,
  onCreated,
}: {
  taskListId?: string;
  onCreated: () => void;
}) => (
  <CreateTasksDialog
    trigger={
      <IconButton
        icon="bot"
        variant="outline"
        aria-label={CREATE_TASKS_LABEL}
      />
    }
    auth={googleTasksAuth}
    taskListId={taskListId}
    onCreated={onCreated}
    renderVoiceAction={onTranscript => (
      <TaskVoiceButton onTranscript={onTranscript} />
    )}
  />
);
