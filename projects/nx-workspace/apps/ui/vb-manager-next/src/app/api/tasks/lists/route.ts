import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const GOOGLE_TASKS_LISTS_URL =
  'https://tasks.googleapis.com/tasks/v1/users/@me/lists';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(GOOGLE_TASKS_LISTS_URL, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Tasks API error:', errorText);
    return NextResponse.json(
      { error: 'Failed to fetch task lists from Google' },
      { status: response.status },
    );
  }

  const data = await response.json();

  return NextResponse.json({
    taskLists: data.items || [],
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title } = await request.json();

  const response = await fetch(GOOGLE_TASKS_LISTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Tasks API error:', errorText);
    return NextResponse.json(
      { error: 'Failed to create task list' },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json({ taskList: data });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskListId = searchParams.get('taskListId');

  const response = await fetch(`${GOOGLE_TASKS_LISTS_URL}/${taskListId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Tasks API error:', errorText);
    return NextResponse.json(
      { error: 'Failed to delete task list' },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskListId = searchParams.get('taskListId');
  const { title } = await request.json();

  const response = await fetch(`${GOOGLE_TASKS_LISTS_URL}/${taskListId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Tasks API error:', errorText);
    return NextResponse.json(
      { error: 'Failed to rename task list' },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json({ taskList: data });
}
