import { useRef, useState } from 'react';
import {
  type Chat,
  ChatHistorySidebar,
  ChatInputArea,
  ChatMessagesArea,
  type ChatbotMessage,
  ConfirmDeleteDialog,
} from '@vigilant-broccoli/chatbot';
import { Button } from '@vigilant-broccoli/react-lib';

export const ConfirmDeleteDialogDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete chat
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete chat?"
        description="This chat and its messages will be removed."
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

const SAMPLE_MESSAGES: ChatbotMessage[] = [
  { role: 'user', content: 'What can this component do?' },
  {
    role: 'assistant',
    content:
      'It renders the conversation with **Markdown**, copy and regenerate actions, and editable user messages.',
    isChatReply: true,
  },
];

const noop = () => undefined;

export const ChatMessagesAreaDemo = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  return (
    <div className="flex h-80 max-w-xl flex-col">
      <ChatMessagesArea
        messages={messages}
        isStreaming={false}
        isDragging={false}
        scrollRef={scrollRef}
        onDragOver={noop}
        onDragLeave={noop}
        onDrop={noop}
        onRegenerate={noop}
        onEditSave={(index, text) =>
          setMessages(prev =>
            prev.map((message, i) =>
              i === index ? { ...message, content: text } : message,
            ),
          )
        }
      />
    </div>
  );
};

export const ChatInputAreaDemo = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  return (
    <div className="max-w-xl">
      <ChatInputArea
        uploadedImages={[]}
        input={input}
        isStreaming={false}
        fileInputRef={fileInputRef}
        textInputRef={textInputRef}
        onImageRemove={noop}
        onImageUpload={noop}
        onInputChange={setInput}
        onKeyDown={noop}
        onSend={() => setInput('')}
        onStop={noop}
        placeholder="Type a message…"
      />
    </div>
  );
};

const NOW = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

const SAMPLE_CHATS: Chat<ChatbotMessage>[] = [
  {
    id: 'trip',
    title: 'Plan a weekend trip',
    messages: [],
    createdAt: NOW - DAY_MS,
    updatedAt: NOW - DAY_MS,
    pinned: true,
  },
  {
    id: 'recipe',
    title: 'Dinner recipe ideas',
    messages: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const ChatHistorySidebarDemo = () => {
  const [chats, setChats] = useState(SAMPLE_CHATS);
  const [currentChatId, setCurrentChatId] = useState<string | null>('trip');
  const update = (id: string, change: Partial<Chat<ChatbotMessage>>) =>
    setChats(prev =>
      prev.map(chat => (chat.id === id ? { ...chat, ...change } : chat)),
    );
  return (
    <div className="flex h-96 w-72 flex-col rounded-lg border border-border">
      <ChatHistorySidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={() => setCurrentChatId(null)}
        onDeleteChat={id =>
          setChats(prev => prev.filter(chat => chat.id !== id))
        }
        onRenameChat={(id, title) => update(id, { title })}
        onTogglePinChat={id =>
          update(id, { pinned: !chats.find(chat => chat.id === id)?.pinned })
        }
      />
    </div>
  );
};
