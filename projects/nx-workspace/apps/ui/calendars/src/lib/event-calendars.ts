import { buildGoogleCalendarUrl } from './calendar-links';
import { EVENT_CALENDARS_TABLE, LOAD_STATUS } from './calendars.consts';
import { EventCalendarsResult } from './calendars.types';
import { supabaseAdmin } from './supabase-admin';

export const loadPublicEventCalendars =
  async (): Promise<EventCalendarsResult> => {
    try {
      const { data, error } = await supabaseAdmin
        .from(EVENT_CALENDARS_TABLE)
        .select('id, name, google_calendar_id')
        .eq('is_public', true)
        .order('created_at');

      if (error) return { status: LOAD_STATUS.ERROR };

      return {
        status: LOAD_STATUS.OK,
        calendars: data.map(row => ({
          id: row.id as string,
          name: row.name as string,
          url: buildGoogleCalendarUrl(row.google_calendar_id as string),
        })),
      };
    } catch {
      return { status: LOAD_STATUS.ERROR };
    }
  };
