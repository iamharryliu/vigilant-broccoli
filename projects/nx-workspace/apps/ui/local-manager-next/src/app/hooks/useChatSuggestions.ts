'use client';

import { useAuthStatus } from '../../../libs/auth';
import { fetchDayAnalysisData } from '../utils/day-analysis-data';
import type { ChatSuggestion } from '../components/chatbot-panel.component';

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
2. My unfinished tasks organized by priority (urgent/important/delegate/eliminate) for both personal and work; include unclassified tasks and suggest priorities for them
3. Any overdue tasks that need immediate attention
4. The current weather and how it might affect my plans
5. Give me a structured plan with time blocks and priorities`;

const generateWeekPlanningPrompt = (data: Record<string, unknown>): string =>
  `Please help me plan my work week based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events for this week and suggest how to prepare for major meetings
2. My unfinished priority tasks for the week - what needs to be done by Friday; include unclassified tasks and suggest priorities for them
3. Any overdue tasks that need immediate attention this week
4. Realistic time blocks for deep work and focus sessions
5. Give me a strategic plan for Monday-Friday with daily focus areas`;

export const useChatSuggestions = (): ChatSuggestion[] => {
  const status = useAuthStatus();
  if (status !== 'authenticated') return [];

  const suggestions: ChatSuggestion[] = [
    {
      title: '📅 Plan My Day',
      onClick: async signal => ({
        prompt: generatePlanningPrompt(await fetchDayAnalysisData(signal)),
      }),
    },
  ];

  if (isWeekPlanningVisible()) {
    suggestions.push({
      title: '📊 Plan My Work Week',
      onClick: async signal => ({
        prompt: generateWeekPlanningPrompt(await fetchDayAnalysisData(signal)),
      }),
    });
  }

  return suggestions;
};
