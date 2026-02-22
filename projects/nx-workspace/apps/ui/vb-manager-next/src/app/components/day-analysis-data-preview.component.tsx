'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  categorizeTasksByQuadrant,
  cleanCalendarEvents,
} from '../utils/day-analysis.utils';

interface CleanTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'none';
  category: string;
  hasDeadline: boolean;
  isOverdue: boolean;
  daysOverdue?: number;
}

interface CleanCalendarEvent {
  summary: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  meetingLink?: string;
  attendees?: string[];
  isAllDay: boolean;
}

interface CategorizedTasks {
  urgent: CleanTask[];
  important: CleanTask[];
  delegate: CleanTask[];
  eliminate: CleanTask[];
  overdue: CleanTask[];
}

interface DayAnalysisData {
  context: {
    datetime: string;
    temperature: number;
    weatherDescription: string;
    location: string;
  };
  tasks: {
    personal: CategorizedTasks;
    work: CategorizedTasks;
  };
  calendar: {
    todayEvents: CleanCalendarEvent[];
    upcomingEvents: CleanCalendarEvent[];
  };
}

const PERSONAL_TASK_LIST_ID = '@default';
const WORK_TASK_LIST_ID = 'cXJUTkpUQzZ6bTBpQjNybA';
const PERSONAL_CALENDAR_ID = 'harryliu1995@gmail.com';
const WORK_CALENDAR_ID = 'harry.liu@elva11.se';
const MALMO_COORDINATES = { lat: 55.605, lon: 13.0038 };
const LOCATION_NAME = 'Malmö';

const fetchAllDataSources = async () => {
  const [
    personalTasksResponse,
    workTasksResponse,
    personalCalendarResponse,
    workCalendarResponse,
    weatherResponse,
  ] = await Promise.all([
    fetch(`${API_ENDPOINTS.TASKS}?taskListId=${PERSONAL_TASK_LIST_ID}`),
    fetch(`${API_ENDPOINTS.TASKS}?taskListId=${WORK_TASK_LIST_ID}`),
    fetch(`${API_ENDPOINTS.CALENDAR_EVENTS}?calendarId=${PERSONAL_CALENDAR_ID}`),
    fetch(`${API_ENDPOINTS.CALENDAR_EVENTS}?calendarId=${WORK_CALENDAR_ID}`),
    fetch(
      `${API_ENDPOINTS.WEATHER}?lat=${MALMO_COORDINATES.lat}&lon=${MALMO_COORDINATES.lon}`,
    ),
  ]);

  const [
    personalTasksData,
    workTasksData,
    personalCalendarData,
    workCalendarData,
    weatherData,
  ] = await Promise.all([
    personalTasksResponse.json(),
    workTasksResponse.json(),
    personalCalendarResponse.json(),
    workCalendarResponse.json(),
    weatherResponse.json(),
  ]);

  return {
    personalTasks: { response: personalTasksResponse, data: personalTasksData },
    workTasks: { response: workTasksResponse, data: workTasksData },
    personalCalendar: {
      response: personalCalendarResponse,
      data: personalCalendarData,
    },
    workCalendar: { response: workCalendarResponse, data: workCalendarData },
    weather: weatherData,
  };
};

const mergeCalendarEvents = (personalData: any, workData: any) => {
  const allTodayEvents = [
    ...(personalData.todayEvents || []),
    ...(workData.todayEvents || []),
  ];

  const allUpcomingEvents = [
    ...(personalData.upcomingEvents || []),
    ...(workData.upcomingEvents || []),
  ];

  return {
    todayEvents: cleanCalendarEvents(allTodayEvents),
    upcomingEvents: cleanCalendarEvents(allUpcomingEvents),
  };
};

const buildAnalysisData = (
  personalTasksData: any,
  workTasksData: any,
  calendarEvents: { todayEvents: any[]; upcomingEvents: any[] },
  weatherData: any,
): DayAnalysisData => ({
  context: {
    datetime: new Date().toISOString(),
    temperature: Math.round(weatherData.current?.main?.temp || 0),
    weatherDescription:
      weatherData.current?.weather?.[0]?.description || 'Unknown',
    location: LOCATION_NAME,
  },
  tasks: {
    personal: categorizeTasksByQuadrant(personalTasksData.tasks || []),
    work: categorizeTasksByQuadrant(workTasksData.tasks || []),
  },
  calendar: calendarEvents,
});

const generatePlanningPrompt = (data: DayAnalysisData): string =>
  `Please help me plan my day based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events and suggest how to prepare for them
2. My tasks organized by priority (urgent/important/delegate/eliminate) for both personal and work
3. Any overdue tasks that need immediate attention
4. The current weather and how it might affect my plans
5. Give me a structured plan with time blocks and priorities`;

const generateWeekPlanningPrompt = (data: DayAnalysisData): string =>
  `Please help me plan my work week based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events for this week and suggest how to prepare for major meetings
2. My priority tasks for the week - what needs to be done by Friday
3. Any overdue tasks that need immediate attention this week
4. Realistic time blocks for deep work and focus sessions
5. Give me a strategic plan for Monday-Friday with daily focus areas`;

const isWeekPlanningVisible = (): boolean => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 3;
};

export const DayAnalysisDataPreviewComponent = () => {
  const { status } = useSession();
  const [data, setData] = useState<DayAnalysisData | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const fetchData = async () => {
    const sources = await fetchAllDataSources();

    if (
      !sources.personalTasks.response.ok &&
      !sources.workTasks.response.ok
    ) {
      return;
    }

    if (
      !sources.personalCalendar.response.ok &&
      !sources.workCalendar.response.ok
    ) {
      console.error('Calendar fetch error:', {
        personalCalendar: sources.personalCalendar.data,
        workCalendar: sources.workCalendar.data,
      });
      return;
    }

    const calendarEvents = mergeCalendarEvents(
      sources.personalCalendar.data,
      sources.workCalendar.data,
    );

    const analysisData = buildAnalysisData(
      sources.personalTasks.data,
      sources.workTasks.data,
      calendarEvents,
      sources.weather,
    );

    setData(analysisData);
  };

  const getSuggestions = () => {
    if (!data) return [];
    const suggestions = [
      {
        title: '📅 Plan My Day',
        prompt: generatePlanningPrompt(data),
      },
    ];
    if (isWeekPlanningVisible()) {
      suggestions.push({
        title: '📊 Plan My Work Week',
        prompt: generateWeekPlanningPrompt(data),
      });
    }
    return suggestions;
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  if (status !== 'authenticated') {
    return null;
  }

  return null;
}

export const useDayAnalysisSuggestions = () => {
  const { status } = useSession();
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    const sources = await fetchAllDataSources();

    if (
      !sources.personalTasks.response.ok &&
      !sources.workTasks.response.ok
    ) {
      return;
    }

    if (
      !sources.personalCalendar.response.ok &&
      !sources.workCalendar.response.ok
    ) {
      return;
    }

    const calendarEvents = mergeCalendarEvents(
      sources.personalCalendar.data,
      sources.workCalendar.data,
    );

    const analysisData = buildAnalysisData(
      sources.personalTasks.data,
      sources.workTasks.data,
      calendarEvents,
      sources.weather,
    );

    setData(analysisData);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  return data;
};
