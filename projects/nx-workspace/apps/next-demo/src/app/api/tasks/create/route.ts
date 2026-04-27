import { google } from 'googleapis';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  items: z.array(z.string()).min(1),
  googleToken: z.string().min(1),
  taskListId: z.string().min(1),
});

type TaskResult = {
  title: string;
  success: boolean;
  taskId?: string | null;
  error?: string;
};

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

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const { items, googleToken, taskListId } = parsed.data;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: googleToken });
  const tasksClient = google.tasks({ version: 'v1', auth: oauth2Client });

  const results: TaskResult[] = [];

  for (const title of items) {
    try {
      const res = await tasksClient.tasks.insert({
        tasklist: taskListId,
        requestBody: { title },
      });
      results.push({ title, success: true, taskId: res.data.id });
    } catch (err: unknown) {
      console.error('Task creation error:', err);
      const gaxiosError = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      const status = gaxiosError.response?.status;
      const message = gaxiosError.message || 'Unknown error';

      if (results.length === 0 && status === 401) {
        return Response.json(
          { error: 'google_token_expired' },
          { status: HTTP_STATUS_CODES.UNAUTHORIZED },
        );
      }
      results.push({
        title,
        success: false,
        error: `${status || ''} ${message}`.trim(),
      });
    }
  }

  return Response.json({ results });
}
