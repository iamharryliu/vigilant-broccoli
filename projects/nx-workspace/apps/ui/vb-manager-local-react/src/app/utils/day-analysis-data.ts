import {
  WEATHER_CONDITION_LABEL,
  type WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { PERSONAL_GOOGLE_CALENDAR } from '@vigilant-broccoli/personal-common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../libs/auth';
import {
  categorizeTasksByQuadrant,
  cleanCalendarEvents,
} from './day-analysis.utils';

const PERSONAL_TASK_LIST_ID = '@default';
const WORK_TASK_LIST_ID = 'cXJUTkpUQzZ6bTBpQjNybA';
const PERSONAL_CALENDAR_ID = PERSONAL_GOOGLE_CALENDAR.PERSONAL;
const MALMO_COORDINATES = { lat: 55.605, lon: 13.0038 };
const LOCATION_NAME = 'Malmö';

export const PLANNING_DATA_ERROR =
  'Failed to refresh planning data. Please check your Google connection and try again.';

type TasksResponse = { tasks: Parameters<typeof categorizeTasksByQuadrant>[0] };
type CalendarResponse = {
  todayEvents: Parameters<typeof cleanCalendarEvents>[0];
  upcomingEvents: Parameters<typeof cleanCalendarEvents>[0];
};
type WeatherResponse = { weather: WeatherSnapshot };

export const fetchDayAnalysisData = async (signal: AbortSignal) => {
  const options = { cache: 'no-store' as const, signal };
  const [
    personalTasksResponse,
    workTasksResponse,
    calendarResponse,
    weatherResponse,
  ] = await Promise.all([
    authFetch(
      `${API_ENDPOINTS.TASKS}?taskListId=${PERSONAL_TASK_LIST_ID}`,
      options,
    ),
    authFetch(
      `${API_ENDPOINTS.TASKS}?taskListId=${WORK_TASK_LIST_ID}`,
      options,
    ),
    authFetch(
      `${API_ENDPOINTS.CALENDAR_EVENTS}?calendarId=${PERSONAL_CALENDAR_ID}`,
      options,
    ),
    authFetch(
      `${API_ENDPOINTS.WEATHER}?lat=${MALMO_COORDINATES.lat}&lon=${MALMO_COORDINATES.lon}`,
      options,
    ),
  ]);

  if (
    [
      personalTasksResponse,
      workTasksResponse,
      calendarResponse,
      weatherResponse,
    ].some(response => !response.ok)
  ) {
    throw new Error(PLANNING_DATA_ERROR);
  }

  const [personalTasks, workTasks, calendar, weather] = await Promise.all([
    personalTasksResponse.json() as Promise<TasksResponse>,
    workTasksResponse.json() as Promise<TasksResponse>,
    calendarResponse.json() as Promise<CalendarResponse>,
    weatherResponse.json() as Promise<WeatherResponse>,
  ]);

  return {
    context: {
      datetime: new Date().toISOString(),
      temperature: Math.round(weather.weather.current.temperatureC),
      weatherDescription:
        WEATHER_CONDITION_LABEL[weather.weather.current.condition],
      location: LOCATION_NAME,
    },
    tasks: {
      personal: categorizeTasksByQuadrant(personalTasks.tasks || []),
      work: categorizeTasksByQuadrant(workTasks.tasks || []),
    },
    calendar: {
      todayEvents: cleanCalendarEvents(calendar.todayEvents || []),
      upcomingEvents: cleanCalendarEvents(calendar.upcomingEvents || []),
    },
  };
};
