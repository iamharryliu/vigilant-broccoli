import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../libs/server-auth';
import {
  getSpotifyAccessTokenForUser,
  isSpotifyNotConnectedError,
} from '../../libs/spotify-token';
import {
  buildSpotifyPlaylistGraph,
  type SpotifyPlaylistGraph,
} from '../../libs/spotify-graph';
import { createTtlCache } from '../../libs/ttl-cache.utils';

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

export async function GET(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const force =
    new URL(request.url).searchParams.get(FORCE_QUERY_PARAM) === 'true';

  try {
    const graph = await getGraphCache(userEmail)(force);
    return Response.json({ connected: true, ...graph });
  } catch (error) {
    if (isSpotifyNotConnectedError(error)) {
      return Response.json({ connected: false });
    }
    throw error;
  }
}
