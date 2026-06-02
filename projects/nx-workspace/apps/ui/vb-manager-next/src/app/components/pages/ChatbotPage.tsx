'use client';

import { Box } from '@radix-ui/themes';
import { ChatbotPanel } from '../chatbot-dialog.component';

export function ChatbotPage() {
  return (
    <Box
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ChatbotPanel variant="page" />
    </Box>
  );
}
