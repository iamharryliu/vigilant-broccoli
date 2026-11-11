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
} from '@vigilant-broccoli/react-lib-higher-level';
import { ChatbotPanel } from '../chatbot/chatbot-panel.component';
import type { Message } from '../chatbot/chatbot.types';
import { useChatSuggestions } from '../../hooks/useChatSuggestions';
import {
  CHAT_MODELS,
  CHAT_SETTINGS_STORAGE_KEYS,
  DEFAULT_CHAT_MODEL,
} from '../../constants/chatbot.consts';

const HISTORY_STORAGE_KEYS = {
  chats: 'vb-manager-chats',
  currentChat: 'vb-manager-chat-current',
};

const STORAGE_KEY_SIDEBAR_OPEN = 'vb-manager-chat-sidebar-open';
const HIDE_SIDEBAR_LABEL = 'Hide chat history';
const SHOW_SIDEBAR_LABEL = 'Show chat history';
const TOGGLE_ICON_SIZE = 18;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_TRANSITION_MS = 250;

export function ChatbotPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const suggestions = useChatSuggestions();
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
    storageKeys: CHAT_SETTINGS_STORAGE_KEYS,
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
  } = useChatHistory<Message>(HISTORY_STORAGE_KEYS);

  useEffect(() => {
    try {
      setIsSidebarOpen(
        localStorage.getItem(STORAGE_KEY_SIDEBAR_OPEN) !== 'false',
      );
    } catch {
      // Storage unavailable; keep the sidebar open.
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isSidebarOpen;
    setIsSidebarOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY_SIDEBAR_OPEN, String(next));
    } catch {
      // Preference just won't persist.
    }
  };

  if (!isHydrated) {
    return <div style={{ height: '100%', width: '100%' }} />;
  }

  return (
    <div className="flex" style={{ height: '100%', width: '100%' }}>
      <div
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
        style={{
          width: isSidebarOpen ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          height: '100%',
          overflow: 'hidden',
          transition: `width ${SIDEBAR_TRANSITION_MS}ms ease`,
        }}
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
      <div
        style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative' }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? HIDE_SIDEBAR_LABEL : SHOW_SIDEBAR_LABEL}
          title={isSidebarOpen ? HIDE_SIDEBAR_LABEL : SHOW_SIDEBAR_LABEL}
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            zIndex: 10,
          }}
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
        <ChatbotPanel
          key={sessionKey}
          suggestions={suggestions}
          initialMessages={currentMessages}
          onMessagesChange={updateCurrentMessages}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          useKnowledgeBase={useKnowledgeBase}
          speakReplies={speakReplies}
          voiceId={voiceId}
        />
      </div>
    </div>
  );
}
