import { getVbExpressApiKey } from '../../libs/vb-express';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export async function POST(request: Request) {
  const body = await request.text();

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.TASKS_PARSE_IMAGE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getVbExpressApiKey(),
      },
      body,
    },
  );

  const data = await res.json().catch(() => ({ error: 'Invalid response' }));
  return Response.json(data, { status: res.status });
}
