'use client';

import { Box, Flex } from '@radix-ui/themes';
import { ChatbotPanel } from '../chatbot-dialog.component';
import { ChatHistorySidebar } from '../chat-history-sidebar.component';
import { useChatHistory } from '../../hooks/useChatHistory';

export function ChatbotPage() {
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
    return <Box style={{ height: '100%', width: '100%' }} />;
  }

  return (
    <Flex style={{ height: '100%', width: '100%' }}>
      <ChatHistorySidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
      />
      <Box style={{ flex: 1, minWidth: 0, height: '100%' }}>
        <ChatbotPanel
          key={sessionKey}
          variant="page"
          initialMessages={currentMessages}
          onMessagesChange={updateCurrentMessages}
        />
      </Box>
    </Flex>
  );
}
