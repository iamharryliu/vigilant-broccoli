import { google } from 'googleapis';

const auth = new google.auth.JWT({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

const CALENDAR_ID =
  'fe795432c09ac3f2a9d7807ddf568dda7ffdcb5c3ed7dd078ca6a693a65c77b7@group.calendar.google.com';

async function listCalendarEvents() {
  await auth.authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }

  console.log('Upcoming events:');
  for (const event of events) {
    const start = event.start?.dateTime || event.start?.date;
    console.log(`${start} - ${event.summary}`);
  }
}

listCalendarEvents();
