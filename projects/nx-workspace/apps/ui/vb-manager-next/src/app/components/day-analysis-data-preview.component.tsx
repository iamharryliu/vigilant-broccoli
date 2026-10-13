'use client';

import { useEffect, useState } from 'react';
import { GOOGLE_CALENDAR } from '@vigilant-broccoli/common-browser';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch, useAuthStatus } from '../../../libs/auth';
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
const PERSONAL_CALENDAR_ID = GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL;
const MALMO_COORDINATES = { lat: 55.605, lon: 13.0038 };
const LOCATION_NAME = 'Malmö';

const fetchAllDataSources = async () => {
  const [
    personalTasksResponse,
    workTasksResponse,
    personalCalendarResponse,
    weatherResponse,
  ] = await Promise.all([
    authFetch(`${API_ENDPOINTS.TASKS}?taskListId=${PERSONAL_TASK_LIST_ID}`),
    authFetch(`${API_ENDPOINTS.TASKS}?taskListId=${WORK_TASK_LIST_ID}`),
    authFetch(
      `${API_ENDPOINTS.CALENDAR_EVENTS}?calendarId=${PERSONAL_CALENDAR_ID}`,
    ),
    authFetch(
      `${API_ENDPOINTS.WEATHER}?lat=${MALMO_COORDINATES.lat}&lon=${MALMO_COORDINATES.lon}`,
    ),
  ]);

  const [personalTasksData, workTasksData, personalCalendarData, weatherData] =
    await Promise.all([
      personalTasksResponse.json(),
      workTasksResponse.json(),
      personalCalendarResponse.json(),
      weatherResponse.json(),
    ]);

  return {
    personalTasks: { response: personalTasksResponse, data: personalTasksData },
    workTasks: { response: workTasksResponse, data: workTasksData },
    personalCalendar: {
      response: personalCalendarResponse,
      data: personalCalendarData,
    },
    weather: weatherData,
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

export const useDayAnalysisSuggestions = () => {
  const status = useAuthStatus();
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    const sources = await fetchAllDataSources();

    if (!sources.personalTasks.response.ok && !sources.workTasks.response.ok) {
      return;
    }

    if (!sources.personalCalendar.response.ok) {
      return;
    }

    const calendarEvents = {
      todayEvents: cleanCalendarEvents(
        sources.personalCalendar.data.todayEvents || [],
      ),
      upcomingEvents: cleanCalendarEvents(
        sources.personalCalendar.data.upcomingEvents || [],
      ),
    };

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
