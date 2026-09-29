import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  createClientCredentialsTokenProvider,
  createRefreshTokenProvider,
  createSpotifyClient,
  parseSpotifyRef,
  SPOTIFY_REF_TYPE,
  SpotifyApiError,
  type FetchLike,
  type MusicTrack,
} from '@vigilant-broccoli/dj-music';

/**
 * Exercises the Spotify layer against the live Web API. Assertions are on shape
 * and invariants rather than specific tracks, so catalogue or playlist changes
 * can never turn this red.
 *
 * Two legs. The client-credentials leg needs only the app keys. The playlist
 * leg needs a user refresh token, because Spotify answers app-only requests to
 * `/playlists/{id}` with 429 QUOTA_EXCEEDED (and a multi-hour `Retry-After`)
 * for apps in development mode — playlists are simply not reachable that way.
 */

const DEFAULT_TEST_PLAYLIST_ID = '0nz3cRJG7ZdCzdWQmIPp56';
/** Syntactically valid base62 id that cannot resolve — drives the 404 path. */
const NONEXISTENT_TRACK_ID = '0000000000000000000000';
/** Generic enough that the catalogue will always have matches. */
const SEARCH_QUERY = 'jazz';

const MIN_PLAUSIBLE_DURATION_MS = 1_000;
const MAX_PLAUSIBLE_DURATION_MS = 3_600_000;
const MIN_PLAUSIBLE_YEAR = 1900;
const MAX_PLAUSIBLE_YEAR = new Date().getFullYear() + 1;
const SPOTIFY_ID_LENGTH = 22;
/** Enough rows to exercise the mapper; small enough to stay a fast canary. */
const SAMPLE_SIZE = 20;
const SKIP_EXIT_CODE = 0;

const PASS_MARK = '✓';
const FAIL_MARK = '✗';

let pass = 0;
let fail = 0;

const check = (label: string, result: boolean): void => {
  console.log(`${result ? PASS_MARK : FAIL_MARK} ${label}`);
  if (result) {
    pass += 1;
  } else {
    fail += 1;
  }
};

const isPlausibleDuration = (value: number): boolean =>
  Number.isFinite(value) &&
  value >= MIN_PLAUSIBLE_DURATION_MS &&
  value <= MAX_PLAUSIBLE_DURATION_MS;

const assertTrackShape = (
  label: string,
  tracks: readonly MusicTrack[],
): void => {
  check(
    `${label}: every track has an id, title and artist`,
    tracks.every(
      track =>
        track.id.length > 0 &&
        track.title.length > 0 &&
        track.artists.length > 0,
    ),
  );
  check(
    `${label}: every track has a plausible duration`,
    tracks.every(track => isPlausibleDuration(track.durationMs)),
  );
  check(
    `${label}: release years are plausible where present`,
    tracks.every(
      track =>
        track.releaseYear === undefined ||
        (track.releaseYear >= MIN_PLAUSIBLE_YEAR &&
          track.releaseYear <= MAX_PLAUSIBLE_YEAR),
    ),
  );
  check(
    `${label}: cover art urls are https where present`,
    tracks.every(
      track =>
        track.coverUrl === undefined || track.coverUrl.startsWith('https://'),
    ),
  );
};

const assertUrlParsing = (): void => {
  const id = DEFAULT_TEST_PLAYLIST_ID;
  check(
    'parses a share URL',
    parseSpotifyRef(`https://open.spotify.com/playlist/${id}`)?.id === id,
  );
  check(
    'parses a share URL carrying a ?si= tracking param',
    parseSpotifyRef(`https://open.spotify.com/playlist/${id}?si=abc123`)?.id ===
      id,
  );
  check(
    'parses a locale-prefixed URL',
    parseSpotifyRef(`https://open.spotify.com/intl-ja/playlist/${id}`)?.type ===
      SPOTIFY_REF_TYPE.PLAYLIST,
  );
  check(
    'parses a spotify: URI',
    parseSpotifyRef(`spotify:playlist:${id}`)?.id === id,
  );
  check(
    'rejects an unrelated URL',
    parseSpotifyRef('https://example.com') === null,
  );
};

const run = async (): Promise<void> => {
  const clientId = getEnvironmentVariable('SPOTIFY_CLIENT_ID');
  const clientSecret = getEnvironmentVariable('SPOTIFY_CLIENT_SECRET');
  const refreshToken = getEnvironmentVariable('SPOTIFY_REFRESH_TOKEN');
  const playlistId =
    getEnvironmentVariable('SPOTIFY_TEST_PLAYLIST_ID') ||
    DEFAULT_TEST_PLAYLIST_ID;

  console.log('=== spotify e2e tests ===');
  console.log('');

  assertUrlParsing();

  if (!clientId || !clientSecret) {
    console.log('');
    console.log(
      `${PASS_MARK} live API checks [skipped: SPOTIFY_CLIENT_ID/SECRET not set]`,
    );
    console.log(`=== Results: ${pass} passed, ${fail} failed ===`);
    process.exit(fail > 0 ? 1 : SKIP_EXIT_CODE);
  }

  const fetchImpl: FetchLike = (url, init) => fetch(url, init);
  const credentials = { clientId, clientSecret };

  console.log('');
  console.log('--- client-credentials leg ---');

  const getToken = createClientCredentialsTokenProvider(credentials, {
    fetch: fetchImpl,
  });
  const token = await getToken();
  check('client-credentials token acquired', token.length > 0);
  check('token is cached across calls', (await getToken()) === token);

  const client = createSpotifyClient({ fetch: fetchImpl, getToken });

  const found = await client.searchTracks(SEARCH_QUERY);
  check(`search returned results for "${SEARCH_QUERY}"`, found.length > 0);
  assertTrackShape('search', found);

  const [first] = found;
  if (first) {
    const track = await client.getTrack(first.id);
    check('getTrack round-trips the id', track.id === first.id);
    check('getTrack returns the same title', track.title === first.title);
    check(
      'track id has the documented length',
      track.id.length === SPOTIFY_ID_LENGTH,
    );
  }

  const notFound = await client
    .getTrack(NONEXISTENT_TRACK_ID)
    .then(() => null)
    .catch((error: unknown) => error);
  check(
    'a missing track raises SpotifyApiError(404)',
    notFound instanceof SpotifyApiError &&
      notFound.status === HTTP_STATUS_CODES.INVALID_PATH,
  );

  console.log('');
  console.log('--- playlist leg (user auth) ---');

  if (!refreshToken) {
    console.log(
      `${PASS_MARK} playlist checks [skipped: SPOTIFY_REFRESH_TOKEN not set]`,
    );
  } else {
    const userClient = createSpotifyClient({
      fetch: fetchImpl,
      getToken: createRefreshTokenProvider(credentials, refreshToken, {
        fetch: fetchImpl,
      }),
    });

    const playlist = await userClient.getPlaylist(playlistId);
    check('playlist resolves with a name', playlist.name.length > 0);
    check('playlist id round-trips', playlist.id === playlistId);
    check(
      'playlist url is a spotify link',
      playlist.url.startsWith('https://open.spotify.com/'),
    );

    // One small page only: this is a liveness check, not a library sync.
    const { tracks, skipped, total, hasNext } =
      await userClient.getPlaylistTracksPage(playlistId, {
        limit: SAMPLE_SIZE,
      });
    console.log(
      `  (sampled ${tracks.length} tracks, ${skipped.length} skipped, of ${total} total)`,
    );

    check('playlist reports a total', total >= 0);
    check(
      'sample is bounded by the requested limit',
      tracks.length + skipped.length <= SAMPLE_SIZE,
    );
    check(
      'next cursor is present when more items remain',
      total <= SAMPLE_SIZE ? !hasNext : hasNext,
    );
    check('playlist yielded at least one track', tracks.length > 0);
    assertTrackShape('playlist', tracks);
  }

  console.log('');
  console.log(`=== Results: ${pass} passed, ${fail} failed ===`);

  if (fail > 0) {
    process.exit(1);
  }
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
