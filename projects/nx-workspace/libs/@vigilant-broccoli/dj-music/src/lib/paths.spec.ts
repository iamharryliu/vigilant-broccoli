import { describe, expect, it } from 'vitest';
import { DEFAULT_PATH_SEGMENT_MAX_LENGTH } from './dj-music.consts';
import { formatTrackPath, sanitizePathSegment } from './paths';
import type { MusicTrack } from './track.types';

const track: MusicTrack = {
  id: 'track-1',
  title: 'Neon Harbour',
  artists: ['Violet Static'],
  album: 'Harbour Lights',
  albumArtist: 'Violet Static',
  durationMs: 210_000,
  trackNumber: 5,
  releaseYear: 2019,
};

describe('sanitizePathSegment', () => {
  it.each([
    ['Violet/Static', 'Violet Static'],
    ['Violet\\Static', 'Violet Static'],
    ['Violet: Static', 'Violet Static'],
    ['What? Now!', 'What Now!'],
    ['"Quoted"', 'Quoted'],
    ['a<b>c|d*e', 'a b c d e'],
  ])('replaces filesystem-unsafe characters in %s', (input, expected) => {
    expect(sanitizePathSegment(input)).toBe(expected);
  });

  it('strips trailing dots and spaces', () => {
    expect(sanitizePathSegment('Neon Harbour...')).toBe('Neon Harbour');
    expect(sanitizePathSegment('Neon Harbour   ')).toBe('Neon Harbour');
  });

  it('keeps dots inside the name', () => {
    expect(sanitizePathSegment('Feat. Violet')).toBe('Feat. Violet');
  });

  it('escapes Windows reserved device names', () => {
    expect(sanitizePathSegment('con')).toBe('_con');
    expect(sanitizePathSegment('COM1')).toBe('_COM1');
  });

  it('does not escape a name that merely starts with a reserved word', () => {
    expect(sanitizePathSegment('Console')).toBe('Console');
  });

  it('falls back when nothing usable is left', () => {
    expect(sanitizePathSegment('   ')).toBe('untitled');
    expect(sanitizePathSegment('///')).toBe('untitled');
  });

  it('caps the length', () => {
    expect(sanitizePathSegment('a'.repeat(300))).toHaveLength(
      DEFAULT_PATH_SEGMENT_MAX_LENGTH,
    );
  });

  it('honours a custom length cap', () => {
    expect(sanitizePathSegment('Neon Harbour', 4)).toBe('Neon');
  });
});

describe('formatTrackPath', () => {
  it('renders the default template', () => {
    expect(formatTrackPath({ track, playlist: 'Night Drive' })).toBe(
      'Night Drive/Violet Static - Neon Harbour',
    );
  });

  it('appends an extension', () => {
    expect(
      formatTrackPath({ track, playlist: 'Night Drive', extension: 'mp3' }),
    ).toBe('Night Drive/Violet Static - Neon Harbour.mp3');
  });

  it('accepts an extension with a leading dot', () => {
    expect(
      formatTrackPath({ track, playlist: 'Night Drive', extension: '.mp3' }),
    ).toBe('Night Drive/Violet Static - Neon Harbour.mp3');
  });

  it('collapses the segment of an unset placeholder', () => {
    expect(formatTrackPath({ track })).toBe('Violet Static - Neon Harbour');
  });

  it('pads the track number', () => {
    expect(formatTrackPath({ track }, '{track-number} - {title}')).toBe(
      '05 - Neon Harbour',
    );
  });

  it('supports album, album-artist and year placeholders', () => {
    expect(
      formatTrackPath({ track }, '{album-artist}/{album} ({year})/{title}'),
    ).toBe('Violet Static/Harbour Lights (2019)/Neon Harbour');
  });

  it('joins all artists for the artists placeholder', () => {
    expect(
      formatTrackPath(
        { track: { ...track, artists: ['Violet Static', 'Kaito Rivers'] } },
        '{artists} - {title}',
      ),
    ).toBe('Violet Static, Kaito Rivers - Neon Harbour');
  });

  it('does not let a slash in a value create a directory level', () => {
    expect(
      formatTrackPath({ track: { ...track, title: 'Rock/Roll' } }, '{title}'),
    ).toBe('Rock Roll');
  });

  it('drops an unknown placeholder', () => {
    expect(formatTrackPath({ track }, '{nonsense}/{title}')).toBe(
      'Neon Harbour',
    );
  });
});
