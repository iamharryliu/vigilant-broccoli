import { google, calendar_v3 } from 'googleapis';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { UntrackedCalendar } from '../app/constants/event-calendars';

// Calendars here are owned by the google_calendar_manager service account
// (Terraform-managed, see infrastructure/terraform/main.tf) rather than by the
// signed-in user, so the event scraper — which authenticates as that same
// service account — can always write to any calendar this app creates.
// The credential is base64-encoded JSON, matching how Terraform emits
// google_service_account_key.private_key.
const CALENDAR_SA_CREDENTIALS_ENV = 'GOOGLE_CALENDAR_SA_CREDENTIALS';
const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar'];

const PUBLIC_ACL_SCOPE_TYPE = 'default';
const PUBLIC_ACL_ROLE = 'reader';
const OWNER_ACL_ROLE = 'owner';
const USER_ACL_SCOPE_TYPE = 'user';
const HTTP_NOT_FOUND = 404;
const EVENTS_COUNT_MAX_RESULTS = 2500;

export const getCalendarAdminClient = (): calendar_v3.Calendar => {
  const credentials = JSON.parse(
    Buffer.from(
      getEnvironmentVariable(CALENDAR_SA_CREDENTIALS_ENV).trim(),
      'base64',
    ).toString('utf-8'),
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: CALENDAR_SCOPES,
  });

  return google.calendar({ version: 'v3', auth });
};

export const createGoogleCalendar = async (
  calendar: calendar_v3.Calendar,
  {
    name,
    timeZone,
    shareWithEmail,
  }: {
    name: string;
    timeZone: string;
    shareWithEmail: string;
  },
): Promise<string> => {
  const { data } = await calendar.calendars.insert({
    requestBody: { summary: name, timeZone },
  });

  const calendarId = data.id as string;

  await calendar.acl.insert({
    calendarId,
    requestBody: {
      role: OWNER_ACL_ROLE,
      scope: { type: USER_ACL_SCOPE_TYPE, value: shareWithEmail },
    },
  });

  return calendarId;
};

export const renameGoogleCalendar = (
  calendar: calendar_v3.Calendar,
  calendarId: string,
  name: string,
) => calendar.calendars.patch({ calendarId, requestBody: { summary: name } });

// Public visibility is an ACL rule granting every Google user read access;
// removing that rule makes the calendar private again.
export const setGoogleCalendarPublic = async (
  calendar: calendar_v3.Calendar,
  calendarId: string,
  isPublic: boolean,
) => {
  if (isPublic) {
    await calendar.acl.insert({
      calendarId,
      requestBody: {
        role: PUBLIC_ACL_ROLE,
        scope: { type: PUBLIC_ACL_SCOPE_TYPE },
      },
    });
    return;
  }

  await calendar.acl
    .delete({ calendarId, ruleId: PUBLIC_ACL_SCOPE_TYPE })
    .catch(error => {
      if (error.code !== HTTP_NOT_FOUND) throw error;
    });
};

export const deleteGoogleCalendar = (
  calendar: calendar_v3.Calendar,
  calendarId: string,
) =>
  calendar.calendars.delete({ calendarId }).catch(error => {
    if (error.code !== HTTP_NOT_FOUND) throw error;
  });

// Calendars the service account owns that vb-manager-next has no row for —
// e.g. left behind by a deleted row, or created before this page existed.
//
// calendarList is a per-account *subscription* list, and for a service account
// (which has no primary calendar) Google can return 404 for it outright — seen
// in practice, and it stays 404 even after a successful calendarList.insert.
// Individual calendars keep working fine; only enumeration is lost. That is
// reported as unavailable rather than as an empty list, since "no orphans" and
// "cannot tell" mean very different things to someone cleaning up.
export const listUntrackedCalendars = async (
  calendar: calendar_v3.Calendar,
  trackedGoogleCalendarIds: Set<string>,
): Promise<{
  calendars: UntrackedCalendar[];
  enumerationAvailable: boolean;
}> => {
  const list = await calendar.calendarList
    .list({ maxResults: 250 })
    .catch((error: { code?: number }) => {
      if (error.code === HTTP_NOT_FOUND) return null;
      throw error;
    });

  if (!list) return { calendars: [], enumerationAvailable: false };

  const untracked = (list.data.items || []).filter(
    item => item.id && !item.primary && !trackedGoogleCalendarIds.has(item.id),
  );

  const calendars = await Promise.all(
    untracked.map(async item => {
      const events = await calendar.events
        .list({
          calendarId: item.id as string,
          maxResults: EVENTS_COUNT_MAX_RESULTS,
          singleEvents: true,
        })
        .catch(() => ({ data: { items: [] } }));
      return {
        googleCalendarId: item.id as string,
        name: item.summary ?? '(untitled)',
        eventCount: (events.data.items || []).length,
      };
    }),
  );

  return { calendars, enumerationAvailable: true };
};
