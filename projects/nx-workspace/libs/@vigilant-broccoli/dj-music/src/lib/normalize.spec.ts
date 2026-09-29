import { describe, expect, it } from 'vitest';
import {
  extractVersionKeywords,
  normalizeForMatch,
  removeNoiseTags,
  splitArtistTitle,
  splitFeaturedArtists,
  stripDiacritics,
  tokenize,
} from './normalize';

describe('stripDiacritics', () => {
  it('folds accented characters to their base letters', () => {
    expect(stripDiacritics('Café del Är')).toBe('Cafe del Ar');
  });

  it('leaves unaccented text untouched', () => {
    expect(stripDiacritics('Neon Harbour')).toBe('Neon Harbour');
  });
});

describe('removeNoiseTags', () => {
  it.each([
    ['Neon Harbour (Official Video)', 'Neon Harbour'],
    ['Neon Harbour [HD]', 'Neon Harbour'],
    ['Neon Harbour (Official Audio)', 'Neon Harbour'],
    ['Neon Harbour (2011 Remaster)', 'Neon Harbour'],
    ['Neon Harbour (Remastered 2011)', 'Neon Harbour'],
    ['Neon Harbour ()', 'Neon Harbour'],
  ])('strips upload furniture from %s', (input, expected) => {
    expect(removeNoiseTags(input)).toBe(expected);
  });

  it.each([
    'Neon Harbour (Extended Mix)',
    'Neon Harbour (Radio Edit)',
    'Neon Harbour (Acoustic)',
    'Neon Harbour (Violet Static Remix)',
  ])('keeps the version marker in %s', input => {
    expect(removeNoiseTags(input)).toBe(input);
  });

  it('strips several noise tags from one title', () => {
    expect(removeNoiseTags('Neon Harbour (Official Video) [4K]')).toBe(
      'Neon Harbour',
    );
  });
});

describe('splitFeaturedArtists', () => {
  it('extracts a bracketed credit and splits on multiple separators', () => {
    expect(
      splitFeaturedArtists('Neon Harbour (feat. Violet Static & Kaito Rivers)'),
    ).toEqual({
      title: 'Neon Harbour',
      featured: ['Violet Static', 'Kaito Rivers'],
    });
  });

  it('extracts a trailing unbracketed credit', () => {
    expect(splitFeaturedArtists('Neon Harbour feat. Violet Static')).toEqual({
      title: 'Neon Harbour',
      featured: ['Violet Static'],
    });
  });

  it('handles the ft. abbreviation', () => {
    expect(splitFeaturedArtists('Neon Harbour [ft. Violet Static]')).toEqual({
      title: 'Neon Harbour',
      featured: ['Violet Static'],
    });
  });

  it('returns the title unchanged when there is no credit', () => {
    expect(splitFeaturedArtists('Neon Harbour')).toEqual({
      title: 'Neon Harbour',
      featured: [],
    });
  });
});

describe('normalizeForMatch', () => {
  it('lowercases, folds accents and drops punctuation', () => {
    expect(normalizeForMatch('Café  del Mar!')).toBe('cafe del mar');
  });

  it('expands ampersands so they match the spelled-out form', () => {
    expect(normalizeForMatch('Violet & Static')).toBe('violet and static');
  });

  it('removes noise tags and featured credits together', () => {
    expect(
      normalizeForMatch('Neon Harbour (feat. Kaito Rivers) [Official Video]'),
    ).toBe('neon harbour');
  });
});

describe('tokenize', () => {
  it('splits a normalized title into words', () => {
    expect(tokenize('Neon Harbour (Official Video)')).toEqual([
      'neon',
      'harbour',
    ]);
  });

  it('returns an empty array for punctuation-only input', () => {
    expect(tokenize('!!!')).toEqual([]);
  });
});

describe('splitArtistTitle', () => {
  it('splits on a hyphen separator', () => {
    expect(splitArtistTitle('Violet Static - Neon Harbour')).toEqual({
      artist: 'Violet Static',
      title: 'Neon Harbour',
    });
  });

  it('splits on an en dash', () => {
    expect(splitArtistTitle('Violet Static – Neon Harbour')).toEqual({
      artist: 'Violet Static',
      title: 'Neon Harbour',
    });
  });

  it('keeps later separators inside the title', () => {
    expect(splitArtistTitle('Violet Static - Neon Harbour - Reprise')).toEqual({
      artist: 'Violet Static',
      title: 'Neon Harbour - Reprise',
    });
  });

  it('reports no artist when there is no separator', () => {
    expect(splitArtistTitle('Neon Harbour')).toEqual({ title: 'Neon Harbour' });
  });

  it('does not split a hyphenated word', () => {
    expect(splitArtistTitle('Neon-Harbour')).toEqual({ title: 'Neon-Harbour' });
  });
});

describe('extractVersionKeywords', () => {
  it('finds a bracketed marker', () => {
    expect([...extractVersionKeywords('Neon Harbour (Live)')]).toEqual([
      'live',
    ]);
  });

  it('finds a multi-word marker', () => {
    expect([...extractVersionKeywords('Neon Harbour (Sped Up)')]).toEqual([
      'sped up',
    ]);
  });

  it('matches whole words only', () => {
    expect(extractVersionKeywords('Stay Alive').size).toBe(0);
    expect(extractVersionKeywords('Olive Grove').size).toBe(0);
  });

  it('finds several markers at once', () => {
    expect([...extractVersionKeywords('Neon Harbour (Live Acoustic)')]).toEqual(
      ['live', 'acoustic'],
    );
  });

  it('returns an empty set for a plain title', () => {
    expect(extractVersionKeywords('Neon Harbour').size).toBe(0);
  });
});
