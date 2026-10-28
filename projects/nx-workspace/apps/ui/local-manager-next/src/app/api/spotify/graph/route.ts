import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import {
  getSpotifyAccessTokenForUser,
  isSpotifyNotConnectedError,
} from '../../../../../libs/spotify-token';
import {
  buildSpotifyPlaylistGraph,
  type SpotifyPlaylistGraph,
} from '../../../../../libs/spotify-graph';
import { createTtlCache } from '../../../utils/ttl-cache.utils';

export const runtime = 'nodejs';

const GRAPH_CACHE_TTL_MS = 30 * 60 * 1000;
const FORCE_QUERY_PARAM = 'force';

// One TTL cache per signed-in user; the route runs in a single long-lived
// PM2 process, so this survives across requests the way ttl-cache.utils.ts
// is used elsewhere in this app. The fetcher resolves the access token on
// every cache miss (rather than closing over one) so a token refreshed
// since the cache was created is always used.
const graphCacheByUser = new Map<
  string,
  (force?: boolean) => Promise<SpotifyPlaylistGraph>
>();

const getGraphCache = (userEmail: string) => {
  const existing = graphCacheByUser.get(userEmail);
  if (existing) return existing;
  const cache = createTtlCache(GRAPH_CACHE_TTL_MS, async () => {
    const accessToken = await getSpotifyAccessTokenForUser(userEmail);
    return buildSpotifyPlaylistGraph(accessToken);
  });
  graphCacheByUser.set(userEmail, cache);
  return cache;
};

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const force = request.nextUrl.searchParams.get(FORCE_QUERY_PARAM) === 'true';

  try {
    const graph = await getGraphCache(userEmail)(force);
    return NextResponse.json({ connected: true, ...graph });
  } catch (error) {
    if (isSpotifyNotConnectedError(error)) {
      return NextResponse.json({ connected: false });
    }
    throw error;
  }
}
