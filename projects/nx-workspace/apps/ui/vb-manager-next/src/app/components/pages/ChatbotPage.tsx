'use client';

import { ChatbotPanel } from '../chatbot-panel.component';
import { ChatHistorySidebar } from '../chat-history-sidebar.component';
import { useChatSuggestions } from '../../hooks/useChatSuggestions';
import { useChatHistory } from '../../hooks/useChatHistory';

export function ChatbotPage() {
  const suggestions = useChatSuggestions();
  const {
    chats,
    currentChatId,
    currentMessages,
    sessionKey,
    selectChat,
    newChat,
    deleteChat,
    updateCurrentMessages,
    isHydrated,
  } = useChatHistory();

  if (!isHydrated) {
    return <div style={{ height: '100%', width: '100%' }} />;
  }

  return (
    <div className="flex" style={{ height: '100%', width: '100%' }}>
      <ChatHistorySidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
      />
      <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
        <ChatbotPanel
          key={sessionKey}
          suggestions={suggestions}
          initialMessages={currentMessages}
          onMessagesChange={updateCurrentMessages}
        />
      </div>
    </div>
  );
}
