'use client';

import { useState } from 'react';
import { IconButton, Select } from '@radix-ui/themes';
import { MessageCircle, Mail, Search, Moon, Sun } from 'lucide-react';
import { ChatbotDialog } from './chatbot-dialog.component';
import { EmailModalComponent } from './email-modal.component';
import { SearchDialogComponent } from './search-dialog.component';
import { useTheme } from '../theme-context';
import { useAppMode } from '../app-mode-context';

export const FloatingIslandComponent = () => {
  const { appearance, toggleTheme } = useTheme();
  const { appMode, setAppMode } = useAppMode();
  const [chatbotDialogOpen, setChatbotDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  return (
    <>
      {/* Floating Card Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'row',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: 'var(--color-background)',
          borderRadius: '0.75rem',
          border: '1px solid var(--gray-6)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Chatbot Button */}
        <IconButton
          onClick={() => setChatbotDialogOpen(true)}
          variant="soft"
          size="2"
          title="Jarvis"
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <MessageCircle size={20} />
        </IconButton>

        {/* Email Button */}
        <IconButton
          onClick={() => setEmailDialogOpen(true)}
          variant="soft"
          size="2"
          title="Email"
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Mail size={20} />
        </IconButton>

        {/* Search Button */}
        <IconButton
          onClick={() => setSearchDialogOpen(true)}
          variant="soft"
          size="2"
          title="Search"
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Search size={20} />
        </IconButton>

        {/* Theme Toggle Button */}
        <IconButton
          onClick={toggleTheme}
          variant="soft"
          size="2"
          title={appearance === 'light' ? 'Dark mode' : 'Light mode'}
          style={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {appearance === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>

        {/* Mode Select */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select.Root value={appMode} onValueChange={setAppMode}>
            <Select.Trigger placeholder="Select mode" />
            <Select.Content>
              <Select.Item value="personal">Personal</Select.Item>
              <Select.Item value="work">Work</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {/* Dialogs */}
      <ChatbotDialog open={chatbotDialogOpen} onOpenChange={setChatbotDialogOpen} />
      <EmailModalComponent open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
      <SearchDialogComponent open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
    </>
  );
};
