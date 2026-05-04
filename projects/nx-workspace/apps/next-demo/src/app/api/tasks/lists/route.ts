import { google } from 'googleapis';
import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const {
    data: { user },
  } = await createServerClient(accessToken).auth.getUser();
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const body = await request.json();
  const googleToken = body.googleToken;
  if (!googleToken) {
    return Response.json(
      { error: 'googleToken is required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: googleToken });
  const tasksClient = google.tasks({ version: 'v1', auth: oauth2Client });

  const response = await tasksClient.tasklists.list({ maxResults: 100 });
  const lists = (response.data.items || []).map(l => ({
    id: l.id,
    title: l.title,
  }));

  return Response.json({ lists });
}
