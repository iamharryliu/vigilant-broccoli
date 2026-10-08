import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { GcloudService } from '@vigilant-broccoli/devops-cli';

export async function POST() {
  try {
    await GcloudService.copyVaultTokenToClipboard();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error copying vault root token:', error);
    return Response.json(
      { success: false, error: 'Failed to copy vault root token' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
