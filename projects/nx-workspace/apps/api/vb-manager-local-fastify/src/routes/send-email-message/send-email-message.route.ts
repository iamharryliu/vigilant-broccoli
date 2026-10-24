import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { getVbExpressApiKey } from '../../libs/vb-express';

export async function POST(request: Request) {
  const { from, to, subject, text, html } = await request.json();

  if (!to || !subject) {
    return Response.json(
      { error: 'to and subject are required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const response = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/api/messaging/send-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getVbExpressApiKey(),
      },
      body: JSON.stringify({ from, to, subject, text, html }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return Response.json(data, { status: response.status });
  }

  return Response.json(data);
}
