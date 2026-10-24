import { useState } from 'react';
import { Pencil, Pin, PinOff, Plus, Search, Trash } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  IconButton,
  Input,
  ScrollArea,
  Text,
} from '@vigilant-broccoli/react-lib';
import type { Chat } from '../hooks/useChatHistory';

interface ChatHistorySidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onTogglePinChat: (id: string) => void;
}

const EMPTY_HISTORY_LABEL = 'No previous chats';
const NO_MATCHES_LABEL = 'No matching chats';
const SEARCH_PLACEHOLDER = 'Search chats';
const NEW_CHAT_LABEL = 'New chat';
const CHAT_OPTIONS_LABEL = 'Chat options';
const RENAME_LABEL = 'Rename';
const PIN_LABEL = 'Pin';
const UNPIN_LABEL = 'Unpin';
const DELETE_LABEL = 'Delete';
const MENU_ICON_SIZE = 14;
const KEY_ESCAPE = 'Escape';

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
  onRename,
  onTogglePin,
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onTogglePin: () => void;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draft, setDraft] = useState(chat.title);

  const commitRename = () => {
    setIsRenaming(false);
    if (draft.trim() && draft.trim() !== chat.title) onRename(draft);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={isRenaming ? undefined : onSelect}
      onKeyDown={e => {
        if (isRenaming || e.target !== e.currentTarget) return;
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
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
        {isRenaming ? (
          <Input
            autoFocus
            value={draft}
            className="h-7 px-2 py-1"
            onChange={e => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === KEY_ENTER) commitRename();
              if (e.key === KEY_ESCAPE) setIsRenaming(false);
            }}
          />
        ) : (
          <Text
            size="2"
            weight={isActive ? 'medium' : 'regular'}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {chat.pinned && <Pin size={12} className="inline mr-1" />}
            {chat.title}
          </Text>
        )}
        <Text size="1" color="gray">
          {formatTimestamp(chat.updatedAt)}
        </Text>
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            icon="ellipsis-horizontal"
            variant="ghost"
            aria-label={CHAT_OPTIONS_LABEL}
            onClick={e => e.stopPropagation()}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="end"
          onClick={e => e.stopPropagation()}
          onCloseAutoFocus={e => e.preventDefault()}
        >
          <DropdownMenu.Item
            onSelect={() => {
              setDraft(chat.title);
              setIsRenaming(true);
            }}
          >
            <Pencil size={MENU_ICON_SIZE} />
            {RENAME_LABEL}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={onTogglePin}>
            {chat.pinned ? (
              <PinOff size={MENU_ICON_SIZE} />
            ) : (
              <Pin size={MENU_ICON_SIZE} />
            )}
            {chat.pinned ? UNPIN_LABEL : PIN_LABEL}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" onSelect={onDelete}>
            <Trash size={MENU_ICON_SIZE} />
            {DELETE_LABEL}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

const matchesQuery = (chat: Chat, query: string): boolean =>
  chat.title.toLowerCase().includes(query) ||
  chat.messages.some(m =>
    (m.displayContent || m.content || '').toLowerCase().includes(query),
  );

// Stable sort keeps the recency order within the pinned and unpinned groups.
const pinnedFirst = (chats: Chat[]): Chat[] => [
  ...chats.filter(c => c.pinned),
  ...chats.filter(c => !c.pinned),
];

export const ChatHistorySidebar = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
}: ChatHistorySidebarProps) => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleChats = pinnedFirst(chats).filter(
    c => !normalizedQuery || matchesQuery(c, normalizedQuery),
  );

  return (
    <div
      className="flex flex-col"
      style={{
        width: '16rem',
        flexShrink: 0,
        height: '100%',
        borderRight: '1px solid var(--gray-5)',
        backgroundColor: 'var(--color-panel-solid)',
      }}
    >
      <div style={{ padding: '1rem 0.75rem 0.5rem 0.75rem' }}>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === KEY_ESCAPE) setQuery('');
            }}
            placeholder={SEARCH_PLACEHOLDER}
            aria-label={SEARCH_PLACEHOLDER}
            className="h-8 pl-8"
          />
        </div>
      </div>
      <div style={{ padding: '0 0.75rem 0.5rem 0.75rem' }}>
        <Button
          onClick={onNewChat}
          variant="secondary"
          className="w-full justify-start"
        >
          <Plus size={16} />
          {NEW_CHAT_LABEL}
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0 [&_[data-radix-scroll-area-viewport]>div]:!block">
        <div
          className="flex flex-col gap-1"
          style={{ padding: '0.25rem 0.5rem 0.75rem 0.5rem' }}
        >
          {visibleChats.length === 0 ? (
            <Text size="1" color="gray" style={{ padding: '0.5rem 0.625rem' }}>
              {chats.length === 0 ? EMPTY_HISTORY_LABEL : NO_MATCHES_LABEL}
            </Text>
          ) : (
            visibleChats.map(chat => (
              <ChatRow
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onSelect={() => onSelectChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onRename={title => onRenameChat(chat.id, title)}
                onTogglePin={() => onTogglePinChat(chat.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
