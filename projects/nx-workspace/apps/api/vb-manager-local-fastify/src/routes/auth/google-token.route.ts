import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../libs/server-auth';
import { storeGoogleRefreshToken } from '../../libs/google-token';

export async function POST(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { refreshToken } = await request.json();
  if (!refreshToken) {
    return Response.json(
      { error: 'Missing refreshToken' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  await storeGoogleRefreshToken(userEmail, refreshToken);
  return Response.json({ success: true });
}
