import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { account } = await request.json();

    if (!account) {
      return NextResponse.json(
        { error: 'account is required' },
        { status: 400 },
      );
    }

    await execAsync(`gcloud config set account ${account}`);

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Error setting gcloud account:', error);
    return NextResponse.json(
      { error: 'Failed to set gcloud account' },
      { status: 500 },
    );
  }
}
