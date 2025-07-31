import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: body.summary,
    description: body.description,
    start: {
      dateTime: body.start,
      timeZone: 'Europe/Stockholm',
    },
    end: {
      dateTime: body.end,
      timeZone: 'Europe/Stockholm',
    },
  };

  const response = await calendar.events.insert({
    calendarId:
      'db7c7ac3e2974525118f92496c039466e6c33a92593c73b20a5f667f31267277@group.calendar.google.com',
    requestBody: event,
  });

  return NextResponse.json({ success: true, eventId: response.data });
}
