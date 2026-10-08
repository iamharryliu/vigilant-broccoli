import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export async function GET(_req: Request) {
  try {
    const sshKeyPath = join(homedir(), '.ssh', 'id_rsa.pub');
    const sshKey = await readFile(sshKeyPath, 'utf-8');

    return Response.json({
      success: true,
      key: sshKey.trim(),
    });
  } catch (_error) {
    return Response.json(
      {
        success: false,
        error: 'Failed to read SSH key. Make sure ~/.ssh/id_rsa.pub exists.',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
