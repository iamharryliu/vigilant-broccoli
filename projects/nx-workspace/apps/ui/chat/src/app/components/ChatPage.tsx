'use client';

import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import {
  ChatHistorySidebar,
  ChatSettings,
  ChatSettingsPage,
  useChatHistory,
  useChatSettings,
  type ChatbotMessage,
} from '@vigilant-broccoli/chatbot';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL, STORAGE_KEY } from '../app.const';
import { ChatPanel } from './ChatPanel';

const SETTINGS_STORAGE_KEYS = {
  model: STORAGE_KEY.MODEL,
  useKnowledgeBase: STORAGE_KEY.USE_KNOWLEDGE_BASE,
  speakReplies: STORAGE_KEY.SPEAK_REPLIES,
  voiceId: STORAGE_KEY.VOICE_ID,
};

const HISTORY_STORAGE_KEYS = {
  chats: STORAGE_KEY.CHATS,
  currentChat: STORAGE_KEY.CURRENT_CHAT,
};

const HIDE_SIDEBAR_LABEL = 'Hide chat history';
const SHOW_SIDEBAR_LABEL = 'Show chat history';
const TOGGLE_ICON_SIZE = 18;

export function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Overlays rather than replaces ChatPanel so an in-flight stream and draft survive.
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    selectedModel,
    setSelectedModel,
    useKnowledgeBase,
    setUseKnowledgeBase,
    speakReplies,
    setSpeakReplies,
    voiceId,
    setVoiceId,
  } = useChatSettings({
    models: CHAT_MODELS,
    defaultModel: DEFAULT_CHAT_MODEL,
    storageKeys: SETTINGS_STORAGE_KEYS,
  });
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
  } = useChatHistory<ChatbotMessage>(HISTORY_STORAGE_KEYS);

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
          onSelectChat={id => {
            setIsSettingsOpen(false);
            selectChat(id);
          }}
          onNewChat={() => {
            setIsSettingsOpen(false);
            newChat();
          }}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onTogglePinChat={togglePinChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
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
        {isSettingsOpen && (
          <ChatSettingsPage>
            <ChatSettings
              models={CHAT_MODELS}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              useKnowledgeBase={useKnowledgeBase}
              onUseKnowledgeBaseChange={setUseKnowledgeBase}
              speakReplies={speakReplies}
              onSpeakRepliesChange={setSpeakReplies}
              voiceId={voiceId}
              onVoiceIdChange={setVoiceId}
            />
          </ChatSettingsPage>
        )}
        <ChatPanel
          key={sessionKey}
          initialMessages={currentMessages}
          onMessagesChange={updateCurrentMessages}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          useKnowledgeBase={useKnowledgeBase}
          speakReplies={speakReplies}
          voiceId={voiceId}
        />
      </div>
    </main>
  );
}
