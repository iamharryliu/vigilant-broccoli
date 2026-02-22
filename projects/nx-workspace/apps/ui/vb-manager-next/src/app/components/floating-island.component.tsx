'use client';

import { useState } from 'react';
import { IconButton, Select } from '@radix-ui/themes';
import { MessageCircle, Mail, Search, Moon, Sun } from 'lucide-react';
import { ChatbotDialog } from './chatbot-dialog.component';
import { EmailModalComponent } from './email-modal.component';
import { SearchDialogComponent } from './search-dialog.component';
import { useTheme } from '../theme-context';
import { useAppMode } from '../app-mode-context';
import { useDayAnalysisSuggestions } from './day-analysis-data-preview.component';

interface FloatingIslandProps {
  searchDialogOpen?: boolean;
  setSearchDialogOpen?: (open: boolean) => void;
  chatbotDialogOpen?: boolean;
  setChatbotDialogOpen?: (open: boolean) => void;
  emailDialogOpen?: boolean;
  setEmailDialogOpen?: (open: boolean) => void;
}

const isWeekPlanningVisible = (): boolean => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek >= 0 && dayOfWeek <= 3;
};

const generatePlanningPrompt = (data: any): string =>
  `Please help me plan my day based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events and suggest how to prepare for them
2. My tasks organized by priority (urgent/important/delegate/eliminate) for both personal and work
3. Any overdue tasks that need immediate attention
4. The current weather and how it might affect my plans
5. Give me a structured plan with time blocks and priorities`;

const generateWeekPlanningPrompt = (data: any): string =>
  `Please help me plan my work week based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events for this week and suggest how to prepare for major meetings
2. My priority tasks for the week - what needs to be done by Friday
3. Any overdue tasks that need immediate attention this week
4. Realistic time blocks for deep work and focus sessions
5. Give me a strategic plan for Monday-Friday with daily focus areas`;

export const FloatingIslandComponent = ({
  searchDialogOpen: externalSearchOpen,
  setSearchDialogOpen: externalSetSearchOpen,
  chatbotDialogOpen: externalChatbotOpen,
  setChatbotDialogOpen: externalSetChatbotOpen,
  emailDialogOpen: externalEmailOpen,
  setEmailDialogOpen: externalSetEmailOpen,
}: FloatingIslandProps = {}) => {
  const { appearance, toggleTheme } = useTheme();
  const { appMode, setAppMode } = useAppMode();
  const [internalChatbotDialogOpen, setInternalChatbotDialogOpen] = useState(false);
  const [internalEmailDialogOpen, setInternalEmailDialogOpen] = useState(false);
  const [internalSearchDialogOpen, setInternalSearchDialogOpen] = useState(false);
  const dayData = useDayAnalysisSuggestions();

  const getSuggestions = () => {
    if (!dayData) return [];
    const suggestions = [
      {
        title: '📅 Plan My Day',
        prompt: generatePlanningPrompt(dayData),
      },
    ];
    if (isWeekPlanningVisible()) {
      suggestions.push({
        title: '📊 Plan My Work Week',
        prompt: generateWeekPlanningPrompt(dayData),
      });
    }
    return suggestions;
  };

  const searchDialogOpen = externalSearchOpen ?? internalSearchDialogOpen;
  const setSearchDialogOpen = externalSetSearchOpen ?? setInternalSearchDialogOpen;
  const chatbotDialogOpen = externalChatbotOpen ?? internalChatbotDialogOpen;
  const setChatbotDialogOpen = externalSetChatbotOpen ?? setInternalChatbotDialogOpen;
  const emailDialogOpen = externalEmailOpen ?? internalEmailDialogOpen;
  const setEmailDialogOpen = externalSetEmailOpen ?? setInternalEmailDialogOpen;

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
      <ChatbotDialog
        open={chatbotDialogOpen}
        onOpenChange={setChatbotDialogOpen}
        suggestions={getSuggestions()}
      />
      <EmailModalComponent open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
      <SearchDialogComponent open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
    </>
  );
};
