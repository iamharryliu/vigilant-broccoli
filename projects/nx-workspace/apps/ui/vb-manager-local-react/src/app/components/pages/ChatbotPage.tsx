
import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { ChatbotPanel } from '../chatbot-panel.component';
import { ChatHistorySidebar } from '../chat-history-sidebar.component';
import { useChatSuggestions } from '../../hooks/useChatSuggestions';
import { useChatHistory } from '../../hooks/useChatHistory';

const STORAGE_KEY_SIDEBAR_OPEN = 'vb-manager-chat-sidebar-open';
const HIDE_SIDEBAR_LABEL = 'Hide chat history';
const SHOW_SIDEBAR_LABEL = 'Show chat history';
const TOGGLE_ICON_SIZE = 18;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_TRANSITION_MS = 250;

export function ChatbotPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const suggestions = useChatSuggestions();
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
          onSelectChat={selectChat}
          onNewChat={newChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onTogglePinChat={togglePinChat}
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
