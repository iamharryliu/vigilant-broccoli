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
    isPublic,
  }: {
    name: string;
    timeZone: string;
    shareWithEmail: string;
    isPublic: boolean;
  },
): Promise<string> => {
  const { data } = await calendar.calendars.insert({
    requestBody: { summary: name, timeZone },
  });

  const calendarId = data.id as string;

  // A public calendar is already world-readable, so the owner-share ACL
  // below is just for edit access — skip the invite email that Google
  // sends by default, since the calendar isn't private in that case.
  await calendar.acl.insert({
    calendarId,
    sendNotifications: !isPublic,
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
// calendarList.list is intermittently 404 for this service account —
// measured at 6 failures then 4 successes across 10 spaced attempts, with the
// calendars themselves reachable by id throughout. So a single 404 says
// nothing about whether calendars exist, and it is retried before giving up.
// Exhausting the retries reports unavailable rather than an empty list,
// because "no untracked calendars" and "could not check" mean very different
// things to someone deciding what to delete.
// minAccessRole scopes this to calendars the account owns, which is the set
// we actually care about.
const CALENDAR_LIST_MAX_ATTEMPTS = 5;
const CALENDAR_LIST_RETRY_DELAY_MS = 1500;

const listOwnedCalendarsWithRetry = async (calendar: calendar_v3.Calendar) => {
  for (let attempt = 1; attempt <= CALENDAR_LIST_MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await calendar.calendarList.list({
        maxResults: 250,
        minAccessRole: OWNER_ACL_ROLE,
      });
      return data;
    } catch (error) {
      if ((error as { code?: number }).code !== HTTP_NOT_FOUND) throw error;
      if (attempt === CALENDAR_LIST_MAX_ATTEMPTS) return null;
      await new Promise(resolve =>
        setTimeout(resolve, CALENDAR_LIST_RETRY_DELAY_MS * attempt),
      );
    }
  }
  return null;
};

export const listUntrackedCalendars = async (
  calendar: calendar_v3.Calendar,
  trackedGoogleCalendarIds: Set<string>,
): Promise<{
  calendars: UntrackedCalendar[];
  enumerationAvailable: boolean;
}> => {
  const list = await listOwnedCalendarsWithRetry(calendar);
  if (!list) return { calendars: [], enumerationAvailable: false };

  const untracked = (list.items || []).filter(
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
