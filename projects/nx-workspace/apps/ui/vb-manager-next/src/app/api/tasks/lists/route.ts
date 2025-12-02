import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch task lists from Google' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      taskLists: data.items || [],
    });
  } catch (error) {
    console.error('Error fetching task lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
