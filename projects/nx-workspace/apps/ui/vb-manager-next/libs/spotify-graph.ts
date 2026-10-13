import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
} from '@vigilant-broccoli/common-js';
import type {
  NoteGraph,
  NoteGraphLink,
  NoteGraphNode,
} from '@vigilant-broccoli/react-lib';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const PLAYLISTS_PAGE_LIMIT = 50;
const TRACKS_PAGE_LIMIT = 100;
// GraphView requires a group per node; one shared group renders them uniformly.
const PLAYLIST_GROUP = 'Playlist';
const UNKNOWN_OWNER = 'Unknown';

interface SpotifyPlaylistItem {
  id: string;
  name: string;
  // Track count lives under `items`, not `tracks`, on the /me/playlists
  // listing response — `tracks` is not a field this endpoint returns.
  // Optional chaining below stays defensive against sparse metadata on
  // algorithmic/generated playlist types regardless.
  owner?: { display_name: string };
  items?: { total: number };
  external_urls?: { spotify: string };
}

interface SpotifyPage<T> {
  items: T[];
  next: string | null;
}

interface SpotifyTrackItem {
  track: { id: string | null } | null;
}

export interface SpotifyPlaylistDetail {
  id: string;
  name: string;
  owner: string;
  trackCount: number;
  url: string;
}

export interface SpotifyPlaylistGraph extends NoteGraph {
  playlists: Record<string, SpotifyPlaylistDetail>;
}

const RATE_LIMIT_STATUS = 429;
const MAX_RATE_LIMIT_RETRIES = 2;
const DEFAULT_RETRY_AFTER_SECONDS = 1;
// Spotify's Retry-After on a dev-mode app can be minutes, not seconds, once
// its rolling window is actually blown (as opposed to a light, momentary
// throttle) — a request this app makes synchronously for a page load must
// not sit in that wait. Cap it; a still-limited call fails fast instead of
// hanging, and callers that tolerate a failed fetch (per-playlist tracks)
// just skip that one playlist rather than blocking the whole page.
const MAX_RETRY_AFTER_SECONDS = 5;

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const spotifyFetch = async <T>(
  url: string,
  accessToken: string,
  attempt = 0,
): Promise<T> => {
  const response = await fetch(url, {
    headers: { [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${accessToken}` },
  });
  if (
    response.status === RATE_LIMIT_STATUS &&
    attempt < MAX_RATE_LIMIT_RETRIES
  ) {
    const retryAfterSeconds = Math.min(
      Number(response.headers.get('Retry-After')) ||
        DEFAULT_RETRY_AFTER_SECONDS,
      MAX_RETRY_AFTER_SECONDS,
    );
    await delay(retryAfterSeconds * 1000);
    return spotifyFetch<T>(url, accessToken, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`Spotify API request failed (${response.status}): ${url}`);
  }
  return response.json();
};

const fetchAllPages = async <T>(
  firstUrl: string,
  accessToken: string,
): Promise<T[]> => {
  const items: T[] = [];
  let url: string | null = firstUrl;
  while (url) {
    const page: SpotifyPage<T> = await spotifyFetch(url, accessToken);
    items.push(...page.items);
    url = page.next;
  }
  return items;
};

const fetchAllPlaylists = (
  accessToken: string,
): Promise<SpotifyPlaylistItem[]> =>
  fetchAllPages<SpotifyPlaylistItem>(
    `${SPOTIFY_API_BASE}/me/playlists?limit=${PLAYLISTS_PAGE_LIMIT}`,
    accessToken,
  );

const fetchPlaylistTracks = (
  playlistId: string,
  accessToken: string,
): Promise<SpotifyTrackItem[]> =>
  fetchAllPages<SpotifyTrackItem>(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks` +
      `?fields=items(track(id)),next&limit=${TRACKS_PAGE_LIMIT}`,
    accessToken,
  );

const pairKey = (a: string, b: string): string =>
  a < b ? `${a}|${b}` : `${b}|${a}`;

const buildSharedTrackLinks = (
  trackIdsByPlaylist: Map<string, Set<string>>,
): NoteGraphLink[] => {
  const playlistsByTrack = new Map<string, string[]>();
  for (const [playlistId, trackIds] of trackIdsByPlaylist) {
    for (const trackId of trackIds) {
      const playlistIds = playlistsByTrack.get(trackId);
      if (playlistIds) playlistIds.push(playlistId);
      else playlistsByTrack.set(trackId, [playlistId]);
    }
  }

  const sharedCounts = new Map<string, number>();
  for (const playlistIds of playlistsByTrack.values()) {
    for (let i = 0; i < playlistIds.length; i++) {
      for (let j = i + 1; j < playlistIds.length; j++) {
        const key = pairKey(playlistIds[i], playlistIds[j]);
        sharedCounts.set(key, (sharedCounts.get(key) ?? 0) + 1);
      }
    }
  }

  return [...sharedCounts.entries()].map(([key, value]) => {
    const [source, target] = key.split('|');
    return { source, target, value };
  });
};

export const buildSpotifyPlaylistGraph = async (
  accessToken: string,
): Promise<SpotifyPlaylistGraph> => {
  // /me/playlists can include a null entry for a followed playlist that's
  // since become unavailable (deleted by its owner, etc.) — drop those.
  const playlists = (await fetchAllPlaylists(accessToken)).filter(Boolean);

  const trackIdsByPlaylist = new Map<string, Set<string>>();

  for (const playlist of playlists) {
    // Spotify-owned algorithmic playlists (Discover Weekly, Daily Mix,
    // Release Radar, ...) show up in /me/playlists but routinely 403 on
    // their own /tracks endpoint — a per-user API restriction, not an error
    // in this app. Skip that playlist's tracks rather than aborting the whole
    // graph; it still appears as a node.
    const items = await fetchPlaylistTracks(playlist.id, accessToken).catch(
      () => [] as SpotifyTrackItem[],
    );
    const trackIds = new Set<string>();
    for (const { track } of items) {
      if (track?.id) trackIds.add(track.id);
    }
    trackIdsByPlaylist.set(playlist.id, trackIds);
  }

  const playlistDetails: Record<string, SpotifyPlaylistDetail> = {};
  const nodes: NoteGraphNode[] = playlists.map(playlist => {
    playlistDetails[playlist.id] = {
      id: playlist.id,
      name: playlist.name,
      // Some playlist types (algorithmic/generated ones, the same kind that
      // 403 on /tracks above) come back from /me/playlists with sparse
      // metadata — owner/tracks/external_urls aren't always present.
      owner: playlist.owner?.display_name ?? UNKNOWN_OWNER,
      trackCount: playlist.items?.total ?? 0,
      url: playlist.external_urls?.spotify ?? '',
    };

    return { id: playlist.id, name: playlist.name, group: PLAYLIST_GROUP };
  });

  return {
    nodes,
    links: buildSharedTrackLinks(trackIdsByPlaylist),
    playlists: playlistDetails,
  };
};
