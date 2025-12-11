import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { command, appName } = await request.json();

    const shellCommand = appName
      ? `open -a '${appName}'`
      : command;

    if (!shellCommand || typeof shellCommand !== 'string') {
      return NextResponse.json(
        { error: 'Invalid command or appName provided' },
        { status: 400 }
      );
    }

    const { stdout, stderr } = await execAsync(shellCommand);

    return NextResponse.json({
      message: 'Command executed successfully',
      status: 'success',
      stdout,
      stderr
    });
  } catch (error) {
    console.error('Error executing shell command:', error);
    return NextResponse.json(
      { error: 'Failed to execute shell command', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
