import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getGoogleAccessTokenForRequest } from '../../../../../libs/google-token';
import {
  listTaskLists,
  isExpiredError,
} from '@vigilant-broccoli/google-workspace';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const accessToken = await getGoogleAccessTokenForRequest(req);
    const taskLists = await listTaskLists(accessToken);
    return NextResponse.json({ taskLists });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch task lists from Google' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(request: NextRequest) {
  let accessToken: string;
  try {
    accessToken = await getGoogleAccessTokenForRequest(request);
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { title } = await request.json();
  const res = await fetch(
    'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to create task list' },
      { status: res.status },
    );
  }

  return NextResponse.json({ taskList: await res.json() });
}

export async function DELETE(request: NextRequest) {
  let accessToken: string;
  try {
    accessToken = await getGoogleAccessTokenForRequest(request);
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const taskListId = new URL(request.url).searchParams.get('taskListId');
  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${taskListId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to delete task list' },
      { status: res.status },
    );
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  let accessToken: string;
  try {
    accessToken = await getGoogleAccessTokenForRequest(request);
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const taskListId = new URL(request.url).searchParams.get('taskListId');
  const { title } = await request.json();
  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${taskListId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to rename task list' },
      { status: res.status },
    );
  }

  return NextResponse.json({ taskList: await res.json() });
}
