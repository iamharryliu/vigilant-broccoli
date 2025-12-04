import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export async function GET(_req: NextRequest) {
  try {
    const sshKeyPath = join(homedir(), '.ssh', 'id_rsa.pub');
    const sshKey = await readFile(sshKeyPath, 'utf-8');

    return NextResponse.json({
      success: true,
      key: sshKey.trim()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read SSH key. Make sure ~/.ssh/id_rsa.pub exists.'
      },
      { status: 500 }
    );
  }
}
