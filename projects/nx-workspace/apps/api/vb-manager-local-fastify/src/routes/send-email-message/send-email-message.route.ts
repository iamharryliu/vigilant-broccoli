import {
  EMAIL_SERVICE_ENDPOINT,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export async function POST(request: Request) {
  const { from, to, subject, text, html } = await request.json();

  if (!to || !subject) {
    return Response.json(
      { error: 'to and subject are required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const response = await fetch(
    `${getEnvironmentVariable('EMAIL_SERVICE_URL')}/${EMAIL_SERVICE_ENDPOINT.SEND_EMAIL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('SHARED_APP_TOKEN'),
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
