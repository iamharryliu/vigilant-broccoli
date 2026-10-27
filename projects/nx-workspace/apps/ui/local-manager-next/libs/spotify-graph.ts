import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
} from '@vigilant-broccoli/common-js';
import type {
  NoteGraph,
  NoteGraphLink,
  NoteGraphNode,
} from '@vigilant-broccoli/react-lib-higher-level';

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

// The playlist items endpoint calls the entry `item` (it can be a track or an
// episode); the older /tracks endpoint and its `track` field now 403 for every
// playlist.
interface SpotifyPlaylistEntry {
  item: {
    id: string | null;
    name?: string;
    artists?: { name: string }[];
  } | null;
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
// Spotify's Retry-After on a dev-mode app is either a momentary throttle
// (seconds) or an app-wide lockout (hours). A page load must not sit in the
// wait, and retrying inside a lockout only spends more requests, so a
// Retry-After above this fails immediately instead of sleeping and retrying.
const MAX_RETRY_AFTER_SECONDS = 5;

interface SpotifyApiError extends Error {
  status: number;
}

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
  if (response.status === RATE_LIMIT_STATUS) {
    const retryAfterSeconds =
      Number(response.headers.get('Retry-After')) ||
      DEFAULT_RETRY_AFTER_SECONDS;
    if (
      attempt < MAX_RATE_LIMIT_RETRIES &&
      retryAfterSeconds <= MAX_RETRY_AFTER_SECONDS
    ) {
      await delay(retryAfterSeconds * 1000);
      return spotifyFetch<T>(url, accessToken, attempt + 1);
    }
  }
  if (!response.ok) {
    throw Object.assign(
      new Error(`Spotify API request failed (${response.status}): ${url}`),
      { status: response.status },
    ) as SpotifyApiError;
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
): Promise<SpotifyPlaylistEntry[]> =>
  fetchAllPages<SpotifyPlaylistEntry>(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/items` +
      `?fields=items(item(id,name,artists(name))),next&limit=${TRACKS_PAGE_LIMIT}`,
    accessToken,
  );

// Parenthetical/bracketed tags and a trailing " - Remastered 2011" / " - Live" style
// suffix are what differ between releases of one recording (album, single, remaster,
// compilation), each with its own Spotify track id.
const TAG_PATTERN = /[([].*?[)\]]/g;
const DASH_SUFFIX_PATTERN = /\s-\s.*$/;
const NON_ALPHANUMERIC_PATTERN = /[^\p{L}\p{N}]+/gu;
const COMBINING_MARKS_PATTERN = /\p{M}/gu;

const normalizeSongPart = (value: string): string =>
  value
    .normalize('NFD')
    .replace(COMBINING_MARKS_PATTERN, '')
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_PATTERN, ' ')
    .trim();

// Two tracks count as the same song when title and primary artist match after
// stripping release tags, so a single and its album version still link two
// playlists. Falls back to the track id when either part is missing.
const songKey = (item: NonNullable<SpotifyPlaylistEntry['item']>): string => {
  const title = normalizeSongPart(
    (item.name ?? '').replace(TAG_PATTERN, '').replace(DASH_SUFFIX_PATTERN, ''),
  );
  const artist = normalizeSongPart(item.artists?.[0]?.name ?? '');
  return title && artist ? `${title}|${artist}` : (item.id as string);
};

const pairKey = (a: string, b: string): string =>
  a < b ? `${a}|${b}` : `${b}|${a}`;

const buildSharedSongLinks = (
  songKeysByPlaylist: Map<string, Set<string>>,
): NoteGraphLink[] => {
  const playlistsBySong = new Map<string, string[]>();
  for (const [playlistId, songKeys] of songKeysByPlaylist) {
    for (const key of songKeys) {
      const playlistIds = playlistsBySong.get(key);
      if (playlistIds) playlistIds.push(playlistId);
      else playlistsBySong.set(key, [playlistId]);
    }
  }

  const sharedCounts = new Map<string, number>();
  for (const playlistIds of playlistsBySong.values()) {
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

  const songKeysByPlaylist = new Map<string, Set<string>>();

  for (const playlist of playlists) {
    // A playlist whose items can't be read (Spotify-owned algorithmic ones may
    // be refused) is skipped rather than aborting the whole graph; it still
    // appears as a node. Logged because a skip looks identical to an empty
    // playlist, which once hid every playlist failing on a retired endpoint.
    // A rate limit is not a per-playlist problem: it aborts the build so an
    // incomplete graph is never returned and cached as if it were complete.
    const items = await fetchPlaylistTracks(playlist.id, accessToken).catch(
      (error: SpotifyApiError) => {
        if (error.status === RATE_LIMIT_STATUS) throw error;
        console.warn(
          `Skipping Spotify playlist ${playlist.id}: ${error.message}`,
        );
        return [] as SpotifyPlaylistEntry[];
      },
    );
    const songKeys = new Set<string>();
    for (const { item } of items) {
      if (item?.id) songKeys.add(songKey(item));
    }
    songKeysByPlaylist.set(playlist.id, songKeys);
  }

  const playlistDetails: Record<string, SpotifyPlaylistDetail> = {};
  const nodes: NoteGraphNode[] = playlists.map(playlist => {
    playlistDetails[playlist.id] = {
      id: playlist.id,
      name: playlist.name,
      // Some playlist types (algorithmic/generated ones, the same kind that
      // refused above) come back from /me/playlists with sparse
      // metadata — owner/tracks/external_urls aren't always present.
      owner: playlist.owner?.display_name ?? UNKNOWN_OWNER,
      trackCount: playlist.items?.total ?? 0,
      url: playlist.external_urls?.spotify ?? '',
    };

    return { id: playlist.id, name: playlist.name, group: PLAYLIST_GROUP };
  });

  return {
    nodes,
    links: buildSharedSongLinks(songKeysByPlaylist),
    playlists: playlistDetails,
  };
};
