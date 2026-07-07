import { NextResponse } from 'next/server';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const CONTENT_TYPE_JSON = 'application/json';

export const getVbExpressApiKey = () =>
  getEnvironmentVariable('VB_EXPRESS_API_KEY');

export const proxyToExpress = async (endpoint: string, body: unknown) => {
  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': CONTENT_TYPE_JSON,
        'x-api-key': getVbExpressApiKey(),
      },
      body: JSON.stringify(body),
    },
  );

  const contentType = res.headers.get('content-type') ?? '';
  if (!res.ok || !contentType.includes(CONTENT_TYPE_JSON)) {
    return NextResponse.json(
      { error: `Upstream error: ${res.status} ${res.statusText}` },
      { status: res.status || 502 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
};
