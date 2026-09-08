import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../libs/api-auth';
import { supabaseAdmin } from '../../../../libs/supabase-admin';

export const runtime = 'nodejs';

const CALENDARS_TABLE = 'event_calendars';
const GOOGLE_CALENDAR_EMBED_URL = 'https://calendar.google.com/calendar/embed';

const buildGoogleCalendarUrl = (googleCalendarId: string) =>
  `${GOOGLE_CALENDAR_EMBED_URL}?src=${encodeURIComponent(googleCalendarId)}`;

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { data, error } = await supabaseAdmin
    .from(CALENDARS_TABLE)
    .select('id, name, google_calendar_id')
    .order('created_at');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const calendars = data.map(row => ({
    id: row.id as string,
    name: row.name as string,
    url: buildGoogleCalendarUrl(row.google_calendar_id as string),
  }));

  return NextResponse.json({ calendars });
}
