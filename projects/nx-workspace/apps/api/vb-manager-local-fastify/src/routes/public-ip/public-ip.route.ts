import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function GET(_req: Request) {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();

    return Response.json({
      success: true,
      ip: data.ip,
    });
  } catch (_error) {
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch public IP address',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
