import { getVbExpressApiKey } from '../../libs/vb-express';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

interface ParseRequest {
  text?: string;
  images?: { data: string; mimeType: string }[];
  timeZone?: string;
}

export async function POST(request: Request) {
  const { text, images, timeZone } = (await request.json()) as ParseRequest;

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.CALENDAR_PARSE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getVbExpressApiKey(),
      },
      body: JSON.stringify({
        text,
        images: (images ?? []).map(img => ({
          name: 'image',
          base64: img.data,
          mimeType: img.mimeType,
        })),
        timeZone,
      }),
    },
  );

  const data = await res.json().catch(() => ({ error: 'Invalid response' }));
  return Response.json(data, { status: res.status });
}
