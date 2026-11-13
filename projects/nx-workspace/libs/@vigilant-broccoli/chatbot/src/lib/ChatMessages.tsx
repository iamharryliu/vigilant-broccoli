'use client';
import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  CopyButton,
  IconButton,
  ScrollArea,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { CHAT_ERROR_MESSAGE } from './chatbot.consts';
import type { ChatbotMessage } from './chatbot.types';
import { ChatMarkdown } from './ChatMarkdown';

const TYPING_LABEL = 'Thinking';

const TypingIndicator = () => (
  <div className="flex items-center gap-2 py-1">
    <Loader2 className="h-4 w-4 animate-spin" />
    <Text size="2" color="gray">
      {TYPING_LABEL}
    </Text>
  </div>
);

const MessageContent = ({ message }: { message: ChatbotMessage }) => {
  if (message.role === 'user') {
    return (
      <Text size="2" className="whitespace-pre-wrap">
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
  images: NonNullable<ChatbotMessage['images']>;
}) => (
  <div className="mb-2 flex flex-wrap gap-2">
    {images.map((img, index) => (
      <img
        key={index}
        src={`data:${img.mimeType};base64,${img.data}`}
        alt={`Uploaded ${index + 1}`}
        className="max-h-[200px] max-w-[200px] rounded-lg object-cover"
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
      <div className="flex justify-end gap-2">
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

const MessageActions = ({
  message,
  canRegenerate,
  canEdit,
  onRegenerate,
  onEdit,
}: {
  message: ChatbotMessage;
  canRegenerate: boolean;
  canEdit: boolean;
  onRegenerate: () => void;
  onEdit: () => void;
}) => (
  <div className="flex items-center gap-1 opacity-60 transition-opacity hover:opacity-100">
    <CopyButton text={message.content} label="Copy message" />
    {canEdit && (
      <IconButton
        variant="ghost"
        icon="edit"
        onClick={onEdit}
        aria-label="Edit message"
      />
    )}
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

const hasPlainActions = (message: ChatbotMessage): boolean =>
  !!message.content && !message.isStreaming;

const isEditableByDefault = (message: ChatbotMessage): boolean =>
  message.role === 'user';

interface MessageRowProps<M extends ChatbotMessage> {
  message: M;
  index: number;
  isEditing: boolean;
  canRegenerate: boolean;
  canEdit: boolean;
  showActions: boolean;
  extras: ReactNode;
  onRegenerate: () => void;
  onEditStart: (messageIndex: number) => void;
  onEditCancel: () => void;
  onEditSave: (messageIndex: number, text: string) => void;
}

const MessageRow = <M extends ChatbotMessage>({
  message,
  index,
  isEditing,
  canRegenerate,
  canEdit,
  showActions,
  extras,
  onRegenerate,
  onEditStart,
  onEditCancel,
  onEditSave,
}: MessageRowProps<M>) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex flex-col gap-1 ${
        isUser ? 'max-w-[85%] self-end' : 'max-w-full self-start'
      }`}
    >
      <div className={isUser ? 'rounded-2xl bg-accent px-3.5 py-2' : 'py-1'}>
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MessageContent message={message} />
          </div>
        )}
        {extras}
      </div>
      {!isEditing && showActions && (
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

export interface ChatMessagesAreaProps<M extends ChatbotMessage> {
  messages: M[];
  isStreaming: boolean;
  isDragging: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRegenerate: () => void;
  onEditSave: (messageIndex: number, text: string) => void;
  // Rendered inside a message bubble, e.g. a draft card.
  renderMessageExtras?: (message: M, index: number) => ReactNode;
  // Defaults to any message with finished text, so cards with their own
  // controls can opt out.
  hasActions?: (message: M) => boolean;
  // Defaults to user messages.
  isEditable?: (message: M) => boolean;
}

export const ChatMessagesArea = <M extends ChatbotMessage>({
  messages,
  isStreaming,
  isDragging,
  scrollRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onRegenerate,
  onEditSave,
  renderMessageExtras,
  hasActions = hasPlainActions,
  isEditable = isEditableByDefault,
}: ChatMessagesAreaProps<M>) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const lastIndex = messages.length - 1;

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative min-h-0 flex-1 overflow-hidden rounded-lg transition-colors ${
        isDragging ? 'border-2 border-dashed border-blue-500' : ''
      }`}
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-accent">
          <Text size="4" weight="medium" color="blue">
            Drop images here
          </Text>
        </div>
      )}
      <ScrollArea viewportRef={scrollRef} className="h-full">
        <div className="flex flex-col gap-3 px-4 py-2">
          {messages.map((message, index) => (
            <MessageRow
              key={index}
              message={message}
              index={index}
              isEditing={editingIndex === index}
              canRegenerate={
                index === lastIndex && !isStreaming && !!message.isChatReply
              }
              canEdit={!isStreaming && isEditable(message)}
              showActions={hasActions(message)}
              extras={renderMessageExtras?.(message, index)}
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
