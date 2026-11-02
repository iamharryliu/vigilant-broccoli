import { NextResponse } from 'next/server';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import type { RenderService } from '../../../constants/render';

const RENDER_SERVICES_URL = 'https://api.render.com/v1/services';
const PAGE_SIZE = 100;

interface RenderServiceEntry {
  service: Omit<RenderService, 'url'> & {
    serviceDetails?: { url?: string };
  };
  cursor: string;
}

export async function GET() {
  const apiKey = getEnvironmentVariable('RENDER_API_KEY');
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'RENDER_API_KEY is not configured' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  try {
    const services: RenderService[] = [];
    let cursor = '';
    do {
      const url = new URL(RENDER_SERVICES_URL);
      url.searchParams.set('limit', String(PAGE_SIZE));
      if (cursor) url.searchParams.set('cursor', cursor);
      const response = await fetch(url, {
        method: HTTP_METHOD.GET,
        headers: { [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${apiKey}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Render API: ${response.status}`);
      const entries: RenderServiceEntry[] = await response.json();
      services.push(
        ...entries.map(({ service }) => ({
          id: service.id,
          name: service.name,
          type: service.type,
          suspended: service.suspended,
          dashboardUrl: service.dashboardUrl,
          url: service.serviceDetails?.url ?? null,
        })),
      );
      const nextCursor = entries.at(-1)?.cursor ?? '';
      if (nextCursor === cursor) break;
      cursor = entries.length === PAGE_SIZE ? nextCursor : '';
    } while (cursor);

    services.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching Render services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Render services' },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }
}
