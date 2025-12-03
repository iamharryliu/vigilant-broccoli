import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Open RekordBox application on macOS
    const command = 'open -a "rekordbox"';

    await execAsync(command);

    return NextResponse.json({
      message: 'RekordBox opened successfully',
      status: 'success'
    });
  } catch (error) {
    console.error('Error opening RekordBox:', error);
    return NextResponse.json(
      { error: 'Failed to open RekordBox. Make sure it is installed.' },
      { status: 500 }
    );
  }
}
