import { GcloudService } from '@vigilant-broccoli/devops-cli';
import { createTtlCache } from '../../libs/ttl-cache.utils';

const REAUTH_CACHE_TTL_MS = 5 * 60 * 1000;

const getCachedReauthStatus = createTtlCache(
  REAUTH_CACHE_TTL_MS,
  GcloudService.getReauthStatus,
);

export async function GET(request: Request) {
  const forceFresh = new URL(request.url).searchParams.get('fresh') === '1';
  return Response.json(await getCachedReauthStatus(forceFresh));
}
