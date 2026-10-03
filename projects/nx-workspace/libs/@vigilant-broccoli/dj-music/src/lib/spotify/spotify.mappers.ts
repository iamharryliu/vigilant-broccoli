import { SKIPPED_ITEM_REASON, SPOTIFY_REF_TYPE } from './spotify.consts';
import type {
  PlaylistTracksResult,
  SkippedPlaylistItem,
  SpotifyAlbumObject,
  SpotifyImage,
  SpotifyPlaylistItem,
  SpotifyPlaylistObject,
  SpotifyPlaylistSummary,
  SpotifyTrackObject,
} from './spotify.types';
import type { MusicTrack } from '../track.types';

const YEAR_PATTERN = /^(\d{4})/;

/** `release_date` is `YYYY`, `YYYY-MM` or `YYYY-MM-DD` depending on precision. */
export const parseReleaseYear = (
  releaseDate: string | undefined,
): number | undefined => {
  const match = releaseDate?.match(YEAR_PATTERN);
  return match?.[1] ? Number(match[1]) : undefined;
};

/** Largest image wins; Spotify orders them largest-first but does not promise to. */
export const selectCoverImage = (
  images: readonly SpotifyImage[] | undefined,
): string | undefined => {
  if (!images?.length) {
    return undefined;
  }
  const best = [...images].sort((left, right) => {
    return (right.width ?? 0) - (left.width ?? 0);
  })[0];
  return best?.url;
};

const albumArtist = (
  album: SpotifyAlbumObject | undefined,
): string | undefined => album?.artists?.[0]?.name;

export const toMusicTrack = (track: SpotifyTrackObject): MusicTrack => ({
  id: track.id ?? '',
  title: track.name,
  artists: (track.artists ?? []).map(artist => artist.name),
  album: track.album?.name,
  albumArtist: albumArtist(track.album),
  durationMs: track.duration_ms,
  trackNumber: track.track_number,
  discNumber: track.disc_number,
  releaseYear: parseReleaseYear(track.album?.release_date),
  isrc: track.external_ids?.isrc,
  coverUrl: selectCoverImage(track.album?.images),
});

/**
 * A playlist row is unusable when the track was removed (`null`), is a podcast
 * episode, or is a local file with no Spotify id — all three appear in ordinary
 * playlists and none can be resolved to a downloadable track.
 */
const classifySkip = (
  item: SpotifyPlaylistItem,
): SkippedPlaylistItem | null => {
  const { track } = item;
  if (!track) {
    return { reason: SKIPPED_ITEM_REASON.MISSING };
  }
  if (track.is_local || !track.id) {
    return { reason: SKIPPED_ITEM_REASON.LOCAL, title: track.name };
  }
  if (track.type && track.type !== SPOTIFY_REF_TYPE.TRACK) {
    return { reason: SKIPPED_ITEM_REASON.NOT_A_TRACK, title: track.name };
  }
  return null;
};

export const toPlaylistTracks = (
  items: readonly SpotifyPlaylistItem[],
): PlaylistTracksResult => {
  const tracks: MusicTrack[] = [];
  const skipped: SkippedPlaylistItem[] = [];

  for (const item of items) {
    const skip = classifySkip(item);
    if (skip) {
      skipped.push(skip);
      continue;
    }
    if (item.track) {
      tracks.push(toMusicTrack(item.track));
    }
  }

  return { tracks, skipped };
};

export const toPlaylistSummary = (
  playlist: SpotifyPlaylistObject,
): SpotifyPlaylistSummary => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description ?? '',
  url:
    playlist.external_urls?.spotify ??
    `https://open.spotify.com/playlist/${playlist.id}`,
  trackCount: playlist.tracks?.total ?? 0,
});
