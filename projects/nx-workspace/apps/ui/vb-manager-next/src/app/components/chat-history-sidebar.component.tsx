'use client';

import { Flex, Text } from '@radix-ui/themes';
import { Plus } from 'lucide-react';
import {
  Button,
  DeleteIconButton,
  ScrollArea,
} from '@vigilant-broccoli/react-lib';
import type { Chat } from '../hooks/useChatHistory';

interface ChatHistorySidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

const EMPTY_HISTORY_LABEL = 'No previous chats';
const NEW_CHAT_LABEL = 'New chat';
const DELETE_CHAT_LABEL = 'Delete chat';

const KEY_ENTER = 'Enter';
const KEY_SPACE = ' ';

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

const formatTimestamp = (ts: number): string => {
  const date = new Date(ts);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay
    ? date.toLocaleTimeString([], TIME_FORMAT)
    : date.toLocaleDateString([], DATE_FORMAT);
};

const ChatRow = ({
  chat,
  isActive,
  onSelect,
  onDelete,
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onSelect}
    onKeyDown={e => {
      if (e.key === KEY_ENTER || e.key === KEY_SPACE) {
        e.preventDefault();
        onSelect();
      }
    }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.625rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      backgroundColor: isActive ? 'var(--accent-3)' : 'transparent',
      transition: 'background-color 0.15s ease',
    }}
    onMouseEnter={e => {
      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--gray-3)';
    }}
    onMouseLeave={e => {
      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
    }}
  >
    <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
      <Text
        size="2"
        weight={isActive ? 'medium' : 'regular'}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {chat.title}
      </Text>
      <Text size="1" color="gray">
        {formatTimestamp(chat.updatedAt)}
      </Text>
    </Flex>
    <DeleteIconButton
      aria-label={DELETE_CHAT_LABEL}
      onClick={e => {
        e.stopPropagation();
        onDelete();
      }}
    />
  </div>
);

export const ChatHistorySidebar = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatHistorySidebarProps) => (
  <Flex
    direction="column"
    style={{
      width: '16rem',
      flexShrink: 0,
      height: '100%',
      borderRight: '1px solid var(--gray-5)',
      backgroundColor: 'var(--color-panel-solid)',
    }}
  >
    <div style={{ padding: '1rem 0.75rem 0.5rem 0.75rem' }}>
      <Button
        onClick={onNewChat}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus size={16} />
        {NEW_CHAT_LABEL}
      </Button>
    </div>
    <ScrollArea className="flex-1 min-h-0">
      <Flex
        direction="column"
        gap="1"
        style={{ padding: '0.25rem 0.5rem 0.75rem 0.5rem' }}
      >
        {chats.length === 0 ? (
          <Text size="1" color="gray" style={{ padding: '0.5rem 0.625rem' }}>
            {EMPTY_HISTORY_LABEL}
          </Text>
        ) : (
          chats.map(chat => (
            <ChatRow
              key={chat.id}
              chat={chat}
              isActive={chat.id === currentChatId}
              onSelect={() => onSelectChat(chat.id)}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))
        )}
      </Flex>
    </ScrollArea>
  </Flex>
);
