'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Pin,
  PinOff,
  Search,
  Settings,
  SquarePen,
  Trash,
} from 'lucide-react';
import {
  Button,
  DropdownMenu,
  IconButton,
  Input,
  ScrollArea,
  Select,
  Switch,
  Text,
} from '@vigilant-broccoli/react-lib';
import type { LLMModel } from '@vigilant-broccoli/common-js';
import { CHAT_MODELS, KEY } from '../app.const';
import type { Chat } from '../hooks/useChatHistory';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface ChatHistorySidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onTogglePinChat: (id: string) => void;
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
  useKnowledgeBase: boolean;
  onUseKnowledgeBaseChange: (value: boolean) => void;
}

const KNOWLEDGE_BASE_LABEL = 'Knowledge base';
const EMPTY_HISTORY_LABEL = 'No previous chats';
const NO_MATCHES_LABEL = 'No matching chats';
const SEARCH_PLACEHOLDER = 'Search chats';
const NEW_CHAT_LABEL = 'New chat';
const CHAT_SETTINGS_LABEL = 'Chat settings';
const BACK_TO_CHATS_LABEL = 'Back to chats';
const RECENTS_LABEL = 'Recents';
const MODEL_LABEL = 'Model';
const CHAT_OPTIONS_LABEL = 'Chat options';
const DELETE_CHAT_TITLE = 'Delete Chat';
const DELETE_CHAT_WARNING =
  'Chats are stored only in this browser, so this cannot be undone.';
const MENU_ICON_SIZE = 14;

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
        if (e.key === KEY.ENTER || e.key === KEY.SPACE) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
        isActive ? 'bg-accent' : 'hover:bg-muted'
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {isRenaming ? (
          <Input
            autoFocus
            value={draft}
            className="h-7 px-2 py-1"
            onChange={e => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === KEY.ENTER) commitRename();
              if (e.key === KEY.ESCAPE) setIsRenaming(false);
            }}
          />
        ) : (
          <Text
            size="2"
            weight={isActive ? 'medium' : 'regular'}
            className="truncate"
          >
            {chat.pinned && <Pin size={12} className="mr-1 inline" />}
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
            Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={onTogglePin}>
            {chat.pinned ? (
              <PinOff size={MENU_ICON_SIZE} />
            ) : (
              <Pin size={MENU_ICON_SIZE} />
            )}
            {chat.pinned ? 'Unpin' : 'Pin'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" onSelect={onDelete}>
            <Trash size={MENU_ICON_SIZE} />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

const formatModelLabel = (model: string) =>
  model
    .split('-')
    .map(part => part.toUpperCase())
    .join(' ');

const matchesQuery = (chat: Chat, query: string): boolean =>
  chat.title.toLowerCase().includes(query) ||
  chat.messages.some(m => m.content.toLowerCase().includes(query));

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
  selectedModel,
  onModelChange,
  useKnowledgeBase,
  onUseKnowledgeBaseChange,
}: ChatHistorySidebarProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pendingDeleteChat, setPendingDeleteChat] = useState<Chat | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleChats = pinnedFirst(chats).filter(
    c => !normalizedQuery || matchesQuery(c, normalizedQuery),
  );

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      {isSettingsOpen ? (
        <div className="flex flex-col gap-4 px-3 py-4">
          <Button
            onClick={() => setIsSettingsOpen(false)}
            variant="ghost"
            className="w-full justify-start"
          >
            <ArrowLeft size={16} />
            {BACK_TO_CHATS_LABEL}
          </Button>
          <div className="flex flex-col gap-1.5">
            <Text size="1" color="gray">
              {MODEL_LABEL}
            </Text>
            <Select
              value={selectedModel}
              onValueChange={value => onModelChange(value as LLMModel)}
              options={CHAT_MODELS}
              triggerClassName="w-full"
              renderItem={formatModelLabel}
            />
          </div>
          <label className="flex items-center justify-between gap-2">
            <Text size="2">{KNOWLEDGE_BASE_LABEL}</Text>
            <Switch
              checked={useKnowledgeBase}
              onCheckedChange={onUseKnowledgeBaseChange}
            />
          </label>
        </div>
      ) : (
        <>
          <div className="px-3 pb-2 pt-4">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === KEY.ESCAPE) setQuery('');
                }}
                placeholder={SEARCH_PLACEHOLDER}
                aria-label={SEARCH_PLACEHOLDER}
                className="h-8 pl-8"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 px-3 pb-2">
            <Button
              onClick={onNewChat}
              variant="ghost"
              className="w-full justify-start"
            >
              <SquarePen size={16} />
              {NEW_CHAT_LABEL}
            </Button>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="ghost"
              className="w-full justify-start"
            >
              <Settings size={16} />
              {CHAT_SETTINGS_LABEL}
            </Button>
          </div>
          <Text
            size="1"
            color="gray"
            weight="medium"
            className="px-5 pb-1 pt-2"
          >
            {RECENTS_LABEL}
          </Text>
          <ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
            <div className="flex flex-col gap-1 px-2 pb-3 pt-1">
              {visibleChats.length === 0 ? (
                <Text size="1" color="gray" className="px-2.5 py-2">
                  {chats.length === 0 ? EMPTY_HISTORY_LABEL : NO_MATCHES_LABEL}
                </Text>
              ) : (
                visibleChats.map(chat => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === currentChatId}
                    onSelect={() => onSelectChat(chat.id)}
                    onDelete={() => setPendingDeleteChat(chat)}
                    onRename={title => onRenameChat(chat.id, title)}
                    onTogglePin={() => onTogglePinChat(chat.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
      <ConfirmDeleteDialog
        open={pendingDeleteChat !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteChat(null);
        }}
        title={DELETE_CHAT_TITLE}
        description={`Delete "${pendingDeleteChat?.title ?? ''}"? ${DELETE_CHAT_WARNING}`}
        onConfirm={() => {
          if (pendingDeleteChat) onDeleteChat(pendingDeleteChat.id);
          setPendingDeleteChat(null);
        }}
      />
    </div>
  );
};
