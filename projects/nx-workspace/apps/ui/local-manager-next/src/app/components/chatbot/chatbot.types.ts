import type {
  EventDraft,
  EventDraftStatus,
} from '../event-draft-card.component';
import type {
  TaskDraftItem,
  TaskListDraftStatus,
} from '../task-list-draft-card.component';

export interface MessageImage {
  data: string;
  mimeType: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  // Set on assistant messages produced by the chat model, the only ones that
  // can be regenerated; command results and drafts are not chat replies.
  isChatReply?: boolean;
  displayContent?: string;
  images?: MessageImage[];
  eventDraft?: EventDraft;
  eventStatus?: EventDraftStatus;
  eventError?: string;
  eventLink?: string;
  taskDrafts?: TaskDraftItem[];
  taskStatus?: TaskListDraftStatus;
  taskError?: string;
  taskCreatedSummary?: string;
}

export type SetMessages = React.Dispatch<React.SetStateAction<Message[]>>;

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
