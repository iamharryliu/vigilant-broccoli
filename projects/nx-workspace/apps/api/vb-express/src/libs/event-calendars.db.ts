import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getEnvironmentVariable,
  getSupabaseUrl,
} from '@vigilant-broccoli/common-node';

const EVENT_CALENDARS_TABLE = 'event_calendars';
const PUBLIC_COLUMNS = 'id, name, google_calendar_id';
const GOOGLE_CALENDAR_EMBED_URL = 'https://calendar.google.com/calendar/embed';

export type PublicEventCalendar = { id: string; name: string; url: string };

type EventCalendarRow = {
  id: string;
  name: string;
  google_calendar_id: string;
};

let client: SupabaseClient | null = null;

const getClient = (): SupabaseClient => {
  if (client) return client;
  const secretKey = getEnvironmentVariable('SUPABASE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('Supabase credentials are not configured');
  }
  client = createClient(getSupabaseUrl(), secretKey, {
    auth: { persistSession: false },
  });
  return client;
};

export const buildGoogleCalendarUrl = (googleCalendarId: string) =>
  `${GOOGLE_CALENDAR_EMBED_URL}?src=${encodeURIComponent(googleCalendarId)}`;

export const listPublicEventCalendars = async (): Promise<
  PublicEventCalendar[]
> => {
  const { data, error } = await getClient()
    .from(EVENT_CALENDARS_TABLE)
    .select(PUBLIC_COLUMNS)
    .eq('is_public', true)
    .order('created_at')
    .returns<EventCalendarRow[]>();
  if (error) throw error;
  return data.map(({ id, name, google_calendar_id }) => ({
    id,
    name,
    url: buildGoogleCalendarUrl(google_calendar_id),
  }));
};
