'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { STORAGE_KEY } from '../app.const';
import { useChatHistory } from '../hooks/useChatHistory';
import { useChatSettings } from '../hooks/useChatSettings';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { ChatPanel } from './ChatPanel';

const HIDE_SIDEBAR_LABEL = 'Hide chat history';
const SHOW_SIDEBAR_LABEL = 'Show chat history';
const TOGGLE_ICON_SIZE = 18;

export function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    selectedModel,
    setSelectedModel,
    useKnowledgeBase,
    setUseKnowledgeBase,
  } = useChatSettings();
  const {
    chats,
    currentChatId,
    currentMessages,
    sessionKey,
    selectChat,
    newChat,
    deleteChat,
    renameChat,
    togglePinChat,
    updateCurrentMessages,
    isHydrated,
  } = useChatHistory();

  useEffect(() => {
    try {
      setIsSidebarOpen(
        localStorage.getItem(STORAGE_KEY.SIDEBAR_OPEN) !== 'false',
      );
    } catch {
      // Storage unavailable; keep the sidebar open.
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isSidebarOpen;
    setIsSidebarOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY.SIDEBAR_OPEN, String(next));
    } catch {
      // Preference just won't persist.
    }
  };

  if (!isHydrated) return <main className="h-screen w-full" />;

  const sidebarLabel = isSidebarOpen ? HIDE_SIDEBAR_LABEL : SHOW_SIDEBAR_LABEL;

  return (
    <main className="flex h-screen w-full bg-background text-foreground">
      <div
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
        className={`h-full shrink-0 overflow-hidden transition-[width] duration-200 ${
          isSidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <ChatHistorySidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={selectChat}
          onNewChat={newChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onTogglePinChat={togglePinChat}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          useKnowledgeBase={useKnowledgeBase}
          onUseKnowledgeBaseChange={setUseKnowledgeBase}
        />
      </div>
      <div className="relative h-full min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarLabel}
          title={sidebarLabel}
          className="absolute left-2 top-2 z-10"
        >
          {isSidebarOpen ? (
            <PanelLeftClose size={TOGGLE_ICON_SIZE} />
          ) : (
            <PanelLeftOpen size={TOGGLE_ICON_SIZE} />
          )}
        </Button>
        <ChatPanel
          key={sessionKey}
          initialMessages={currentMessages}
          onMessagesChange={updateCurrentMessages}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          useKnowledgeBase={useKnowledgeBase}
        />
      </div>
    </main>
  );
}
