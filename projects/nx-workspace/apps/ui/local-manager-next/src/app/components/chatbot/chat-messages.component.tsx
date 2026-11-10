'use client';
import { useState, type CSSProperties } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  CopyButton,
  IconButton,
  ScrollArea,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { CHAT_ERROR_MESSAGE } from '../../constants/chatbot.consts';
import { isCommandMessage } from '../../utils/chat-messages.utils';
import { EventDraft, EventDraftCard } from '../event-draft-card.component';
import { TaskListDraftCard } from '../task-list-draft-card.component';
import { ChatMarkdown } from './chat-markdown.component';
import type { Message, TasksCreateParams } from './chatbot.types';

const TYPING_LABEL = 'Thinking';

const USER_MESSAGE_STYLE: CSSProperties = {
  padding: '0.5rem 0.875rem',
  borderRadius: '1rem',
  backgroundColor: 'var(--accent-3)',
};

const ASSISTANT_MESSAGE_STYLE: CSSProperties = {
  padding: '0.25rem 0',
};

const TypingIndicator = () => (
  <div className="flex gap-2 items-center" style={{ padding: '0.25rem 0' }}>
    <Loader2 className="h-4 w-4 animate-spin" />
    <Text size="2" color="gray">
      {TYPING_LABEL}
    </Text>
  </div>
);

const MessageContent = ({ message }: { message: Message }) => {
  if (message.role === 'user') {
    return (
      <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
        {message.displayContent || message.content}
      </Text>
    );
  }
  if (message.isStreaming && !message.content) return <TypingIndicator />;
  return message.content ? <ChatMarkdown content={message.content} /> : null;
};

const MessageImages = ({
  images,
}: {
  images: NonNullable<Message['images']>;
}) => (
  <div className="flex gap-2 flex-wrap" style={{ marginBottom: '0.5rem' }}>
    {images.map((img, imgIndex) => (
      <img
        key={imgIndex}
        src={`data:${img.mimeType};base64,${img.data}`}
        alt={`Uploaded ${imgIndex + 1}`}
        style={{
          maxWidth: '200px',
          maxHeight: '200px',
          borderRadius: '0.5rem',
          objectFit: 'cover',
        }}
      />
    ))}
  </div>
);

const EditMessageForm = ({
  initialText,
  onSave,
  onCancel,
}: {
  initialText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}) => {
  const [text, setText] = useState(initialText);
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" disabled={!text.trim()} onClick={() => onSave(text)}>
          Save and resend
        </Button>
      </div>
    </div>
  );
};

// Draft cards carry their own controls, so only plain text replies get actions.
const hasActions = (message: Message): boolean =>
  !!message.content &&
  !message.isStreaming &&
  !message.eventDraft &&
  !message.taskDrafts;

const MessageActions = ({
  message,
  canRegenerate,
  canEdit,
  onRegenerate,
  onEdit,
}: {
  message: Message;
  canRegenerate: boolean;
  canEdit: boolean;
  onRegenerate: () => void;
  onEdit: () => void;
}) => (
  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
    <CopyButton text={message.content} label="Copy message" />
    {canEdit && <IconButton variant="ghost" icon="edit" onClick={onEdit} />}
    {canRegenerate && (
      <IconButton
        variant="ghost"
        icon="rotate-ccw"
        onClick={onRegenerate}
        aria-label={
          message.content === CHAT_ERROR_MESSAGE ? 'Retry' : 'Regenerate'
        }
      />
    )}
  </div>
);

interface MessageRowProps {
  message: Message;
  index: number;
  isBusy: boolean;
  isEditing: boolean;
  canRegenerate: boolean;
  onEventCreate: (messageIndex: number, draft: EventDraft) => void;
  onEventCancel: (messageIndex: number) => void;
  onTasksCreate: (messageIndex: number, params: TasksCreateParams) => void;
  onTasksCancel: (messageIndex: number) => void;
  onRegenerate: () => void;
  onEditStart: (messageIndex: number) => void;
  onEditCancel: () => void;
  onEditSave: (messageIndex: number, text: string) => void;
}

const MessageRow = ({
  message,
  index,
  isBusy,
  isEditing,
  canRegenerate,
  onEventCreate,
  onEventCancel,
  onTasksCreate,
  onTasksCancel,
  onRegenerate,
  onEditStart,
  onEditCancel,
  onEditSave,
}: MessageRowProps) => {
  const isUser = message.role === 'user';
  const showActions = !isEditing && hasActions(message);
  const canEdit = isUser && !isBusy && !isCommandMessage(message);

  return (
    <div
      className="group flex flex-col gap-1"
      style={{
        maxWidth: isUser ? '85%' : '100%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={isUser ? USER_MESSAGE_STYLE : ASSISTANT_MESSAGE_STYLE}>
        {message.images && message.images.length > 0 && (
          <MessageImages images={message.images} />
        )}
        {isEditing ? (
          <EditMessageForm
            initialText={message.content}
            onSave={text => onEditSave(index, text)}
            onCancel={onEditCancel}
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MessageContent message={message} />
          </div>
        )}
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
      </div>
      {showActions && (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <MessageActions
            message={message}
            canRegenerate={canRegenerate}
            canEdit={canEdit}
            onRegenerate={onRegenerate}
            onEdit={() => onEditStart(index)}
          />
        </div>
      )}
    </div>
  );
};

export const MessagesArea = ({
  messages,
  isStreaming,
  isDragging,
  scrollRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onEventCreate,
  onEventCancel,
  onTasksCreate,
  onTasksCancel,
  onRegenerate,
  onEditSave,
}: {
  messages: Message[];
  isStreaming: boolean;
  isDragging: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onEventCreate: (messageIndex: number, draft: EventDraft) => void;
  onEventCancel: (messageIndex: number) => void;
  onTasksCreate: (messageIndex: number, params: TasksCreateParams) => void;
  onTasksCancel: (messageIndex: number) => void;
  onRegenerate: () => void;
  onEditSave: (messageIndex: number, text: string) => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const lastIndex = messages.length - 1;

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        flex: 1,
        position: 'relative',
        border: isDragging ? '2px dashed var(--accent-9)' : 'none',
        borderRadius: '0.5rem',
        transition: 'border 0.2s ease',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--accent-2)',
            borderRadius: '0.5rem',
            zIndex: 10,
          }}
        >
          <Text size="4" weight="medium" color="blue">
            Drop images here
          </Text>
        </div>
      )}
      <ScrollArea viewportRef={scrollRef} className="h-full">
        <div className="flex flex-col gap-3" style={{ padding: '0.5rem 1rem' }}>
          {messages.map((message, index) => (
            <MessageRow
              key={index}
              message={message}
              index={index}
              isBusy={isStreaming}
              isEditing={editingIndex === index}
              canRegenerate={
                index === lastIndex && !isStreaming && !!message.isChatReply
              }
              onEventCreate={onEventCreate}
              onEventCancel={onEventCancel}
              onTasksCreate={onTasksCreate}
              onTasksCancel={onTasksCancel}
              onRegenerate={onRegenerate}
              onEditStart={setEditingIndex}
              onEditCancel={() => setEditingIndex(null)}
              onEditSave={(messageIndex, text) => {
                setEditingIndex(null);
                onEditSave(messageIndex, text);
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
