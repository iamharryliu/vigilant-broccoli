import type {
  EventDraft,
  EventDraftStatus,
} from '../event-draft-card.component';
import type {
  TaskDraftItem,
  TaskListDraftStatus,
} from '../task-list-draft-card.component';

import type {
  ChatbotImage,
  ChatbotMessage,
  SetChatbotMessages,
} from '@vigilant-broccoli/react-lib-higher-level';

export type MessageImage = ChatbotImage;

export interface Message extends ChatbotMessage {
  eventDraft?: EventDraft;
  eventStatus?: EventDraftStatus;
  eventError?: string;
  eventLink?: string;
  taskDrafts?: TaskDraftItem[];
  taskStatus?: TaskListDraftStatus;
  taskError?: string;
  taskCreatedSummary?: string;
}

export type SetMessages = SetChatbotMessages<Message>;

export interface ChatCommand {
  name: string;
  label: string;
  description: string;
  showInSuggestions: boolean;
  handler: () => Promise<void> | void;
}

export interface ChatSuggestion {
  title: string;
  prompt?: string;
  onClick?: (signal: AbortSignal) => Promise<{ prompt: string } | void>;
}

export interface TasksCreateParams {
  tasks: TaskDraftItem[];
  targetListId?: string;
  newListTitle?: string;
}
