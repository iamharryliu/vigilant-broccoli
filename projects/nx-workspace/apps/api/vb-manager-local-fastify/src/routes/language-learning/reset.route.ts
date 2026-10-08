import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../libs/server-auth';
import { resetUserData } from './db';

export async function DELETE(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  await resetUserData(userEmail);
  return Response.json({ success: true });
}
