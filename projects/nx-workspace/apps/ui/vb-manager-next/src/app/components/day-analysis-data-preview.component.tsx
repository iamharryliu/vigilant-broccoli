'use client';

import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { categorizeTasksByQuadrant, cleanCalendarEvents } from '../utils/day-analysis.utils';
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

    const personalTaskListId = '@default';
    const workTaskListId = 'cXJUTkpUQzZ6bTBpQjNybA';
    const malmoLat = 55.605;
    const malmoLon = 13.0038;

    const [
      personalTasksResponse,
      workTasksResponse,
      personalCalendarResponse,
      workCalendarResponse,
      weatherResponse
    ] = await Promise.all([
      fetch(`${API_ENDPOINTS.TASKS}?taskListId=${personalTaskListId}`),
      fetch(`${API_ENDPOINTS.TASKS}?taskListId=${workTaskListId}`),
      fetch(`${API_ENDPOINTS.CALENDAR_EVENTS}?calendarId=harryliu1995@gmail.com`),
      fetch(`${API_ENDPOINTS.CALENDAR_EVENTS}?calendarId=harry.liu@elva11.se`),
      fetch(`${API_ENDPOINTS.WEATHER}?lat=${malmoLat}&lon=${malmoLon}`),
    ]);

    const personalTasksData = await personalTasksResponse.json();
    const workTasksData = await workTasksResponse.json();
    const personalCalendarData = await personalCalendarResponse.json();
    const workCalendarData = await workCalendarResponse.json();
    const weatherData = await weatherResponse.json();

    if (!personalTasksResponse.ok && !workTasksResponse.ok) {
      setError('Failed to fetch tasks from both task lists');
      setLoading(false);
      return;
    }

    if (!personalCalendarResponse.ok && !workCalendarResponse.ok) {
      console.error('Calendar fetch error:', { personalCalendarData, workCalendarData });
      setError('Failed to fetch calendar events from both calendars');
      setLoading(false);
      return;
    }

    const allTodayEvents = [
      ...(personalCalendarData.todayEvents || []),
      ...(workCalendarData.todayEvents || []),
    ];

    const allUpcomingEvents = [
      ...(personalCalendarData.upcomingEvents || []),
      ...(workCalendarData.upcomingEvents || []),
    ];

    const cleanedTodayEvents = cleanCalendarEvents(allTodayEvents);
    const cleanedUpcomingEvents = cleanCalendarEvents(allUpcomingEvents);

    console.log('Calendar data received:', {
      personal: personalCalendarData,
      work: workCalendarData,
      totalToday: cleanedTodayEvents.length,
      totalUpcoming: cleanedUpcomingEvents.length,
    });

    const personalCategorizedTasks = categorizeTasksByQuadrant(personalTasksData.tasks || []);
    const workCategorizedTasks = categorizeTasksByQuadrant(workTasksData.tasks || []);

    const analysisData: DayAnalysisData = {
      context: {
        datetime: new Date().toISOString(),
        temperature: Math.round(weatherData.current?.main?.temp || 0),
        weatherDescription: weatherData.current?.weather?.[0]?.description || 'Unknown',
        location: 'Malmö',
      },
      tasks: {
        personal: personalCategorizedTasks,
        work: workCategorizedTasks,
      },
      calendar: {
        todayEvents: cleanedTodayEvents,
        upcomingEvents: cleanedUpcomingEvents,
      },
    };

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

    const prompt = `Please help me plan my day based on the following information:

${JSON.stringify(data, null, 2)}

Please analyze:
1. My calendar events and suggest how to prepare for them
2. My tasks organized by priority (urgent/important/delegate/eliminate) for both personal and work
3. Any overdue tasks that need immediate attention
4. The current weather and how it might affect my plans
5. Give me a structured plan with time blocks and priorities`;

    setPlanningPrompt(prompt);
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
            <Text size="5" weight="bold">Day Analysis Data Preview</Text>
            <Flex gap="2">
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
              <Button onClick={fetchData} size="2" variant="soft" disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </Flex>
          </Flex>

          {error && <Text size="2" color="red">{error}</Text>}

          {data && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </Flex>
      </Card>
      <ChatbotDialog
        open={chatbotOpen}
        onOpenChange={(open) => {
          setChatbotOpen(open);
          if (!open) setPlanningPrompt('');
        }}
        initialPrompt={planningPrompt}
        systemPrompt="You are a personal assistant helping with day planning and productivity. Be concise, actionable, and prioritize what matters most."
      />
    </>
  );
};
