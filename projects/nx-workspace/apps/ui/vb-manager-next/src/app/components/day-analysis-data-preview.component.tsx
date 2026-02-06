'use client';

import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  categorizeTasksByQuadrant,
  cleanCalendarEvents,
} from '../utils/day-analysis.utils';
import { ChatbotDialog } from './chatbot-dialog.component';

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

export const DayAnalysisDataPreviewComponent = () => {
  const { status } = useSession();
  const [data, setData] = useState<DayAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [planningPrompt, setPlanningPrompt] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const sources = await fetchAllDataSources();

    if (
      !sources.personalTasks.response.ok &&
      !sources.workTasks.response.ok
    ) {
      setError('Failed to fetch tasks from both task lists');
      setLoading(false);
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
      setError('Failed to fetch calendar events from both calendars');
      setLoading(false);
      return;
    }

    const calendarEvents = mergeCalendarEvents(
      sources.personalCalendar.data,
      sources.workCalendar.data,
    );

    console.log('Calendar data received:', {
      personal: sources.personalCalendar.data,
      work: sources.workCalendar.data,
      totalToday: calendarEvents.todayEvents.length,
      totalUpcoming: calendarEvents.upcomingEvents.length,
    });

    const analysisData = buildAnalysisData(
      sources.personalTasks.data,
      sources.workTasks.data,
      calendarEvents,
      sources.weather,
    );

    setData(analysisData);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!data) return;

    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlanDay = () => {
    if (!data) return;
    setPlanningPrompt(generatePlanningPrompt(data));
    setChatbotOpen(true);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <>
      <Card className="w-full">
        <Flex direction="column" gap="3" p="4">
          <Flex justify="between" align="center">
            {data && (
              <>
                <Button onClick={handlePlanDay} size="2" variant="solid">
                  Plan My Day
                </Button>
                <Button onClick={handleCopy} size="2" variant="soft">
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </>
            )}
          </Flex>

          {error && (
            <Text size="2" color="red">
              {error}
            </Text>
          )}
        </Flex>
      </Card>
      <ChatbotDialog
        open={chatbotOpen}
        onOpenChange={open => {
          setChatbotOpen(open);
          if (!open) setPlanningPrompt('');
        }}
        initialPrompt={planningPrompt}
        systemPrompt="You are a personal assistant helping with day planning and productivity. Be concise, actionable, and prioritize what matters most."
      />
    </>
  );
};
