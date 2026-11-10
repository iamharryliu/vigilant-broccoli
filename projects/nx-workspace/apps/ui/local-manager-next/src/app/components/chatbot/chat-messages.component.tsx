'use client';
import {
  ChatMessagesArea,
  type ChatMessagesAreaProps,
} from '@vigilant-broccoli/react-lib-higher-level';
import { isCommandMessage } from '../../utils/chat-messages.utils';
import { EventDraft, EventDraftCard } from '../event-draft-card.component';
import { TaskListDraftCard } from '../task-list-draft-card.component';
import type { Message, TasksCreateParams } from './chatbot.types';

// Draft cards carry their own controls, so only plain text replies get actions.
const hasActions = (message: Message): boolean =>
  !!message.content &&
  !message.isStreaming &&
  !message.eventDraft &&
  !message.taskDrafts;

// Command results and suggestions did not come from the typed text.
const isEditable = (message: Message): boolean =>
  message.role === 'user' && !isCommandMessage(message);

export const MessagesArea = ({
  onEventCreate,
  onEventCancel,
  onTasksCreate,
  onTasksCancel,
  ...props
}: Omit<
  ChatMessagesAreaProps<Message>,
  'renderMessageExtras' | 'hasActions' | 'isEditable'
> & {
  onEventCreate: (messageIndex: number, draft: EventDraft) => void;
  onEventCancel: (messageIndex: number) => void;
  onTasksCreate: (messageIndex: number, params: TasksCreateParams) => void;
  onTasksCancel: (messageIndex: number) => void;
}) => (
  <ChatMessagesArea
    {...props}
    hasActions={hasActions}
    isEditable={isEditable}
    renderMessageExtras={(message, index) => (
      <>
        {message.eventDraft && (
          <EventDraftCard
            draft={message.eventDraft}
            status={message.eventStatus || 'draft'}
            errorMessage={message.eventError}
            eventLink={message.eventLink}
            onCreate={draft => onEventCreate(index, draft)}
            onCancel={() => onEventCancel(index)}
          />
        )}
        {message.taskDrafts && (
          <TaskListDraftCard
            drafts={message.taskDrafts}
            status={message.taskStatus || 'draft'}
            errorMessage={message.taskError}
            createdSummary={message.taskCreatedSummary}
            onCreate={params => onTasksCreate(index, params)}
            onCancel={() => onTasksCancel(index)}
          />
        )}
      </>
    )}
  />
);
