'use client';

import { useState, useEffect } from 'react';
import { IconButton, Select, Text, Flex } from '@radix-ui/themes';
import { MessageCircle, Mail, Search, Moon, Sun, Calendar } from 'lucide-react';
import { ChatbotDialog } from './chatbot-dialog.component';
import { EmailModalComponent } from './email-modal.component';
import { SearchDialogComponent } from './search-dialog.component';
import { CalendarDialog } from './calendar-dialog.component';
import { useTheme } from '../theme-context';
import { useAppMode } from '../app-mode-context';
import { useDayAnalysisSuggestions } from './day-analysis-data-preview.component';
import { ClockComponent } from './clock.component';

interface FloatingIslandProps {
  searchDialogOpen?: boolean;
  setSearchDialogOpen?: (open: boolean) => void;
  chatbotDialogOpen?: boolean;
  setChatbotDialogOpen?: (open: boolean) => void;
  emailDialogOpen?: boolean;
  setEmailDialogOpen?: (open: boolean) => void;
  calendarDialogOpen?: boolean;
  setCalendarDialogOpen?: (open: boolean) => void;
}

const isWeekPlanningVisible = (): boolean => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek >= 0 && dayOfWeek <= 3;
};

const generatePlanningPrompt = (data: Record<string, unknown>): string =>
  `Please help me plan my day based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events and suggest how to prepare for them
2. My tasks organized by priority (urgent/important/delegate/eliminate) for both personal and work
3. Any overdue tasks that need immediate attention
4. The current weather and how it might affect my plans
5. Give me a structured plan with time blocks and priorities`;

const generateWeekPlanningPrompt = (data: Record<string, unknown>): string =>
  `Please help me plan my work week based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events for this week and suggest how to prepare for major meetings
2. My priority tasks for the week - what needs to be done by Friday
3. Any overdue tasks that need immediate attention this week
4. Realistic time blocks for deep work and focus sessions
5. Give me a strategic plan for Monday-Friday with daily focus areas`;

const generateOutfitRecommendationPrompt = (outfitText: string): string =>
  `Here is an outfit recommendation based on the current weather:

${outfitText}

Please help me refine this recommendation by:
1. Suggesting alternative outfit options if needed
2. Adding accessories based on the weather
3. Considering my schedule and activities for today
4. Providing styling tips for the recommended outfits`;

const BUTTON_STYLE = {
  cursor: 'pointer' as const,
  transition: 'transform 0.2s ease',
};

const getDialogState = (
  externalOpen: boolean | undefined,
  internalOpen: boolean,
): boolean => externalOpen ?? internalOpen;

export const FloatingIslandComponent = ({
  searchDialogOpen: externalSearchOpen,
  setSearchDialogOpen: externalSetSearchOpen,
  chatbotDialogOpen: externalChatbotOpen,
  setChatbotDialogOpen: externalSetChatbotOpen,
  emailDialogOpen: externalEmailOpen,
  setEmailDialogOpen: externalSetEmailOpen,
  calendarDialogOpen: externalCalendarOpen,
  setCalendarDialogOpen: externalSetCalendarOpen,
}: FloatingIslandProps = {}) => {
  const { appearance, toggleTheme } = useTheme();
  const { appMode, setAppMode } = useAppMode();
  const [internalChatbotDialogOpen, setInternalChatbotDialogOpen] =
    useState(false);
  const [internalEmailDialogOpen, setInternalEmailDialogOpen] = useState(false);
  const [internalSearchDialogOpen, setInternalSearchDialogOpen] =
    useState(false);
  const [internalCalendarDialogOpen, setInternalCalendarDialogOpen] =
    useState(false);
  const [outfitRecommendation, setOutfitRecommendation] = useState<string>('');
  const dayData = useDayAnalysisSuggestions();

  useEffect(() => {
    const fetchOutfitRecommendation = async () => {
      const MALMÖ = { lat: 55.605, lon: 13.0038 };
      try {
        const response = await fetch(
          `/api/outfit-recommendation?lat=${MALMÖ.lat}&lon=${MALMÖ.lon}`,
        );

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let text = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
        }

        setOutfitRecommendation(text);
      } catch (err) {
        // Error fetching outfit recommendation
      }
    };

    fetchOutfitRecommendation();
  }, [setOutfitRecommendation]);

  const getSuggestions = () => {
    if (!dayData) return [];
    const suggestions = [
      {
        title: '📅 Plan My Day',
        prompt: generatePlanningPrompt(dayData),
      },
    ];

    if (outfitRecommendation) {
      suggestions.push({
        title: '👔 Get Outfit Recommendation',
        prompt: generateOutfitRecommendationPrompt(outfitRecommendation),
      });
    }

    if (isWeekPlanningVisible()) {
      suggestions.push({
        title: '📊 Plan My Work Week',
        prompt: generateWeekPlanningPrompt(dayData),
      });
    }

    return suggestions;
  };

  const searchDialogOpen = getDialogState(
    externalSearchOpen,
    internalSearchDialogOpen,
  );
  const setSearchDialogOpen =
    externalSetSearchOpen ?? setInternalSearchDialogOpen;
  const chatbotDialogOpen = getDialogState(
    externalChatbotOpen,
    internalChatbotDialogOpen,
  );
  const setChatbotDialogOpen =
    externalSetChatbotOpen ?? setInternalChatbotDialogOpen;
  const emailDialogOpen = getDialogState(
    externalEmailOpen,
    internalEmailDialogOpen,
  );
  const setEmailDialogOpen = externalSetEmailOpen ?? setInternalEmailDialogOpen;
  const calendarDialogOpen = getDialogState(
    externalCalendarOpen,
    internalCalendarDialogOpen,
  );
  const setCalendarDialogOpen =
    externalSetCalendarOpen ?? setInternalCalendarDialogOpen;

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1.1)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

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
          gap: '1.5rem',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: 'var(--color-background)',
          borderRadius: '0.75rem',
          border: '1px solid var(--gray-6)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Block 1: Time */}
        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="time" />
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '60px', backgroundColor: 'var(--gray-6)' }} />

        {/* Block 2: Info */}
        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="info" />
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '60px', backgroundColor: 'var(--gray-6)' }} />

        {/* Block 3: Controls */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', alignItems: 'center' }}>
          {/* Chatbot Button */}
          <IconButton
            onClick={() => setChatbotDialogOpen(true)}
            variant="soft"
            size="2"
            title="Jarvis"
            style={BUTTON_STYLE}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <MessageCircle size={20} />
          </IconButton>

          {/* Email Button */}
          <IconButton
            onClick={() => setEmailDialogOpen(true)}
            variant="soft"
            size="2"
            title="Email"
            style={BUTTON_STYLE}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Mail size={20} />
          </IconButton>

          {/* Calendar Button */}
          <IconButton
            onClick={() => setCalendarDialogOpen(true)}
            variant="soft"
            size="2"
            title="Calendar"
            style={BUTTON_STYLE}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Calendar size={20} />
          </IconButton>

          {/* Search Button */}
          <IconButton
            onClick={() => setSearchDialogOpen(true)}
            variant="soft"
            size="2"
            title="Search"
            style={BUTTON_STYLE}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Search size={20} />
          </IconButton>

          {/* Theme Toggle Button */}
          <IconButton
            onClick={toggleTheme}
            variant="soft"
            size="2"
            title={appearance === 'light' ? 'Dark mode' : 'Light mode'}
            style={BUTTON_STYLE}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
      </div>

      {/* Dialogs */}
      <ChatbotDialog
        open={chatbotDialogOpen}
        onOpenChange={setChatbotDialogOpen}
        suggestions={getSuggestions()}
      />
      <EmailModalComponent
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
      <SearchDialogComponent
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
      />
      <CalendarDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
      />
    </>
  );
};
