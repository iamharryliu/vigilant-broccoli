'use client';

import { useState, useRef } from 'react';
import { Select } from '@radix-ui/themes';
import { ChatbotDialog } from './chatbot-dialog.component';
import { EmailModalComponent } from './email-modal.component';
import { SearchDialogComponent } from './search-dialog.component';
import { CalendarDialog } from './calendar-dialog.component';
import { NotepadDialog } from './notepad-dialog.component';
import { WeatherDialog } from './weather-dialog.component';
import { PomodoroDialog } from './pomodoro-dialog.component';
import { usePomodoro } from '../hooks/usePomodoro';
import { useAppMode } from '../app-mode-context';
import { useDayAnalysisSuggestions } from './day-analysis-data-preview.component';
import { ClockComponent } from './clock.component';
import { useDrag } from '../hooks/useDrag';
import { useWeather, getWeatherIcon } from '../hooks/useWeather';
import { Skeleton } from './skeleton.component';

interface ChatSuggestion {
  title: string;
  prompt?: string;
  onClick?: () => Promise<{ prompt: string } | void>;
}

interface FloatingIslandProps {
  searchDialogOpen?: boolean;
  setSearchDialogOpen?: (open: boolean) => void;
  chatbotDialogOpen?: boolean;
  setChatbotDialogOpen?: (open: boolean) => void;
  emailDialogOpen?: boolean;
  setEmailDialogOpen?: (open: boolean) => void;
  calendarDialogOpen?: boolean;
  setCalendarDialogOpen?: (open: boolean) => void;
  notepadDialogOpen?: boolean;
  setNotepadDialogOpen?: (open: boolean) => void;
  weatherDialogOpen?: boolean;
  setWeatherDialogOpen?: (open: boolean) => void;
  pomodoroDialogOpen?: boolean;
  setPomodoroDialogOpen?: (open: boolean) => void;
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

const getDialogState = (
  externalOpen: boolean | undefined,
  internalOpen: boolean,
): boolean => externalOpen ?? internalOpen;

// eslint-disable-next-line complexity
export const FloatingIslandComponent = ({
  searchDialogOpen: externalSearchOpen,
  setSearchDialogOpen: externalSetSearchOpen,
  chatbotDialogOpen: externalChatbotOpen,
  setChatbotDialogOpen: externalSetChatbotOpen,
  emailDialogOpen: externalEmailOpen,
  setEmailDialogOpen: externalSetEmailOpen,
  calendarDialogOpen: externalCalendarOpen,
  setCalendarDialogOpen: externalSetCalendarOpen,
  notepadDialogOpen: externalNotepadOpen,
  setNotepadDialogOpen: externalSetNotepadOpen,
  weatherDialogOpen: externalWeatherOpen,
  setWeatherDialogOpen: externalSetWeatherOpen,
  pomodoroDialogOpen: externalPomodoroOpen,
  setPomodoroDialogOpen: externalSetPomodoroOpen,
}: FloatingIslandProps = {}) => {
  const { appMode, setAppMode } = useAppMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const { position, isDragging, handlePointerDown } = useDrag(containerRef);
  const [internalChatbotDialogOpen, setInternalChatbotDialogOpen] =
    useState(false);
  const [internalEmailDialogOpen, setInternalEmailDialogOpen] = useState(false);
  const [internalSearchDialogOpen, setInternalSearchDialogOpen] =
    useState(false);
  const [internalCalendarDialogOpen, setInternalCalendarDialogOpen] =
    useState(false);
  const [internalNotepadDialogOpen, setInternalNotepadDialogOpen] =
    useState(false);
  const [internalWeatherDialogOpen, setInternalWeatherDialogOpen] =
    useState(false);
  const [internalPomodoroDialogOpen, setInternalPomodoroDialogOpen] =
    useState(false);
  const pomodoro = usePomodoro();
  const { weatherData, loading: weatherLoading } = useWeather();
  const dayData = useDayAnalysisSuggestions();

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
      let isDone = false;

      while (!isDone) {
        const { done, value } = await reader.read();
        isDone = done;
        if (isDone) break;
        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
      }

      return text;
    } catch (err) {
      // Error fetching outfit recommendation
      return null;
    }
  };

  const getSuggestions = (): ChatSuggestion[] => {
    if (!dayData) return [];
    const suggestions: ChatSuggestion[] = [
      {
        title: '📅 Plan My Day',
        prompt: generatePlanningPrompt(dayData),
      },
    ];

    suggestions.push({
      title: '👔 Get Outfit Recommendation',
      onClick: async () => {
        const recommendation = await fetchOutfitRecommendation();
        if (recommendation) {
          return {
            prompt: generateOutfitRecommendationPrompt(recommendation),
          };
        }
      },
    });

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
  const notepadDialogOpen = getDialogState(
    externalNotepadOpen,
    internalNotepadDialogOpen,
  );
  const setNotepadDialogOpen =
    externalSetNotepadOpen ?? setInternalNotepadDialogOpen;
  const weatherDialogOpen = getDialogState(
    externalWeatherOpen,
    internalWeatherDialogOpen,
  );
  const setWeatherDialogOpen =
    externalSetWeatherOpen ?? setInternalWeatherDialogOpen;
  const pomodoroDialogOpen = getDialogState(
    externalPomodoroOpen,
    internalPomodoroDialogOpen,
  );
  const setPomodoroDialogOpen =
    externalSetPomodoroOpen ?? setInternalPomodoroDialogOpen;

  return (
    <>
      {/* Floating Card Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'row',
          gap: '1.5rem',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor:
            'color-mix(in srgb, var(--color-background) 50%, transparent)',
          borderRadius: '0.75rem',
          border: '1px solid var(--gray-6)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
          touchAction: 'none',
          visibility: position.x < 0 ? 'hidden' : 'visible',
        }}
      >
        {/* Block 1: Time */}
        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="time" />
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '60px',
            backgroundColor: 'var(--gray-6)',
          }}
        />

        {/* Block 2: Info */}
        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="info" />
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '60px',
            backgroundColor: 'var(--gray-6)',
          }}
        />

        {/* Block 3: Weather */}
        <div
          onClick={() => !weatherLoading && setWeatherDialogOpen(true)}
          style={{
            width: '5rem',
            cursor: weatherLoading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!weatherLoading) e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
          }}
          title="Weather"
        >
          {weatherLoading || !weatherData[0] ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
              }}
            >
              <Skeleton className="h-6 w-6 rounded-full" />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  flex: 1,
                }}
              >
                <Skeleton className="h-3.5 w-10" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            </div>
          ) : (
            <>
              <span style={{ fontSize: '1.5rem' }}>
                {getWeatherIcon(weatherData[0].now.icon)}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {weatherData[0].now.temp}&deg;C
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-9)' }}>
                  {weatherData[0].city}
                </span>
              </div>
            </>
          )}
        </div>
        <div
          style={{
            width: '1px',
            height: '60px',
            backgroundColor: 'var(--gray-6)',
          }}
        />

        {/* Block 4: Mode Select */}
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
      <NotepadDialog
        open={notepadDialogOpen}
        onOpenChange={setNotepadDialogOpen}
      />
      <WeatherDialog
        open={weatherDialogOpen}
        onOpenChange={setWeatherDialogOpen}
      />
      <PomodoroDialog
        open={pomodoroDialogOpen}
        onOpenChange={setPomodoroDialogOpen}
        pomodoro={pomodoro}
      />
    </>
  );
};
