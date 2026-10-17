import { getVbExpressApiKey } from '../../libs/vb-express';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function POST(request: Request) {
  const { body, from, to } = await request.json();

  if (!body || !from || !to) {
    return Response.json(
      { error: 'body, from, and to are required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const response = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/api/messaging/send-text-message`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getVbExpressApiKey(),
      },
      body: JSON.stringify({
        body,
        from,
        to,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return Response.json(data, { status: response.status });
  }

  return Response.json(data);
}
