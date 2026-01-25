import { NextRequest, NextResponse } from 'next/server';
import { vbExpressFetch } from '../../../lib/vb-express-fetch';
import { VB_EXPRESS_ENDPOINTS } from '../../constants/api-endpoints';

export async function GET(req: NextRequest) {
  const taskListId = req.nextUrl.searchParams.get('taskListId');
  const url = taskListId
    ? `${VB_EXPRESS_ENDPOINTS.TASKS}?taskListId=${taskListId}`
    : VB_EXPRESS_ENDPOINTS.TASKS;

  const response = await vbExpressFetch(url, {
    credentials: 'include',
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await vbExpressFetch(VB_EXPRESS_ENDPOINTS.TASKS, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const response = await vbExpressFetch(VB_EXPRESS_ENDPOINTS.TASKS, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(req: NextRequest) {
  const taskListId = req.nextUrl.searchParams.get('taskListId');
  const taskId = req.nextUrl.searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { error: 'taskId is required' },
      { status: 400 }
    );
  }

  const url = `${VB_EXPRESS_ENDPOINTS.TASKS}?taskListId=${taskListId}&taskId=${taskId}`;

  const response = await vbExpressFetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
