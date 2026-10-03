import { describe, expect, it } from 'vitest';
import {
  artistScore,
  buildSearchQueries,
  durationScore,
  isOfficialUpload,
  rankCandidates,
  resolveMatchOptions,
  scoreCandidate,
  selectBestMatch,
  titleScore,
  versionPenalty,
} from './match';
import type { MusicTrack, SourceCandidate } from './track.types';

const options = resolveMatchOptions();

const track: MusicTrack = {
  id: 'track-1',
  title: 'Neon Harbour',
  artists: ['Violet Static'],
  album: 'Harbour Lights',
  durationMs: 210_000,
};

const candidate = (overrides: Partial<SourceCandidate>): SourceCandidate => ({
  id: 'candidate-1',
  title: 'Violet Static - Neon Harbour',
  uploader: 'Violet Static - Topic',
  durationMs: 211_000,
  url: 'https://example.invalid/candidate-1',
  ...overrides,
});

describe('durationScore', () => {
  it('gives full credit inside the tolerance window', () => {
    expect(durationScore(210_000, 213_000, options)).toBe(1);
    expect(durationScore(210_000, 203_000, options)).toBe(1);
  });

  it('gives no credit at or beyond the hard limit', () => {
    expect(durationScore(210_000, 255_000, options)).toBe(0);
    expect(durationScore(210_000, 400_000, options)).toBe(0);
  });

  it('decays linearly between tolerance and hard limit', () => {
    // 26s out: exactly halfway across the 7s..45s decay window.
    expect(durationScore(210_000, 236_000, options)).toBeCloseTo(0.5);
  });

  it('is symmetric around the target', () => {
    expect(durationScore(210_000, 230_000, options)).toBeCloseTo(
      durationScore(210_000, 190_000, options),
    );
  });
});

describe('titleScore', () => {
  it('scores an `Artist - Title` upload on its title half', () => {
    expect(titleScore(track, candidate({}))).toBe(1);
  });

  it('scores a bare title upload', () => {
    expect(titleScore(track, candidate({ title: 'Neon Harbour' }))).toBe(1);
  });

  it('ignores upload furniture', () => {
    expect(
      titleScore(
        track,
        candidate({ title: 'Violet Static - Neon Harbour (Official Video)' }),
      ),
    ).toBe(1);
  });

  it('scores an unrelated title near zero', () => {
    expect(
      titleScore(track, candidate({ title: 'Completely Different Song' })),
    ).toBeLessThan(0.3);
  });
});

describe('artistScore', () => {
  it('scores 1 when the artist appears in the upload title', () => {
    expect(
      artistScore(track, candidate({ uploader: 'Some Reupload Channel' })),
    ).toBe(1);
  });

  it('scores 1 when the artist only appears in the channel name', () => {
    expect(
      artistScore(track, candidate({ title: 'Neon Harbour' })),
    ).toBeCloseTo(1);
  });

  it('scores an unrelated artist low', () => {
    expect(
      artistScore(
        track,
        candidate({ title: 'Neon Harbour', uploader: 'Random Uploader' }),
      ),
    ).toBeLessThan(0.4);
  });

  it('weights the primary artist above the features', () => {
    const collaboration: MusicTrack = {
      ...track,
      artists: ['Violet Static', 'Kaito Rivers'],
    };
    const primaryOnly = artistScore(
      collaboration,
      candidate({ title: 'Violet Static - Neon Harbour' }),
    );
    const both = artistScore(
      collaboration,
      candidate({ title: 'Violet Static, Kaito Rivers - Neon Harbour' }),
    );
    expect(both).toBeGreaterThan(primaryOnly);
    expect(primaryOnly).toBeGreaterThanOrEqual(0.8);
  });
});

describe('versionPenalty', () => {
  it('is zero when both sides agree', () => {
    expect(versionPenalty(track, candidate({}), options)).toBe(0);
  });

  it('penalises a live upload for a studio target', () => {
    expect(
      versionPenalty(
        track,
        candidate({ title: 'Violet Static - Neon Harbour (Live)' }),
        options,
      ),
    ).toBeCloseTo(options.versionMismatchPenalty);
  });

  it('penalises a studio upload for a live target', () => {
    const liveTrack: MusicTrack = { ...track, title: 'Neon Harbour (Live)' };
    expect(versionPenalty(liveTrack, candidate({}), options)).toBeCloseTo(
      options.versionMismatchPenalty,
    );
  });

  it('does not penalise a matching marker on both sides', () => {
    const liveTrack: MusicTrack = { ...track, title: 'Neon Harbour (Live)' };
    expect(
      versionPenalty(
        liveTrack,
        candidate({ title: 'Violet Static - Neon Harbour (Live)' }),
        options,
      ),
    ).toBe(0);
  });

  it('caps the penalty for a pile of mismatched markers', () => {
    expect(
      versionPenalty(
        track,
        candidate({
          title: 'Neon Harbour (Live Acoustic Instrumental Karaoke Remix)',
        }),
        options,
      ),
    ).toBe(options.maxVersionMismatchPenalty);
  });
});

describe('isOfficialUpload', () => {
  it.each(['Violet Static - Topic', 'VioletStaticVEVO'])(
    'recognises %s as a rights-holder channel',
    uploader => {
      expect(isOfficialUpload(candidate({ uploader }))).toBe(true);
    },
  );

  it('does not recognise an arbitrary channel', () => {
    expect(isOfficialUpload(candidate({ uploader: 'Random Uploader' }))).toBe(
      false,
    );
  });

  it('handles a missing uploader', () => {
    expect(isOfficialUpload(candidate({ uploader: undefined }))).toBe(false);
  });
});

describe('scoreCandidate', () => {
  it('disqualifies a candidate outside the duration hard limit', () => {
    const result = scoreCandidate(track, candidate({ durationMs: 600_000 }));
    expect(result.score).toBe(0);
    expect(result.rejectedReason).toBe('duration-out-of-range');
  });

  it('scores an exact official match at the top of the range', () => {
    expect(scoreCandidate(track, candidate({})).score).toBe(1);
  });

  it('never exceeds 1 even with the official-channel bonus', () => {
    expect(
      scoreCandidate(track, candidate({ durationMs: 210_000 })).score,
    ).toBeLessThanOrEqual(1);
  });

  it('reports the component breakdown', () => {
    const { breakdown } = scoreCandidate(
      track,
      candidate({ title: 'Violet Static - Neon Harbour (Live)' }),
    );
    expect(breakdown.duration).toBe(1);
    expect(breakdown.artist).toBe(1);
    expect(breakdown.versionPenalty).toBeCloseTo(
      options.versionMismatchPenalty,
    );
    expect(breakdown.officialBonus).toBeCloseTo(options.officialChannelBonus);
  });

  it('honours weight overrides', () => {
    const titleOnly = scoreCandidate(
      track,
      candidate({ title: 'Completely Different Song' }),
      { weights: { title: 1, artist: 0, duration: 0 } },
    );
    expect(titleOnly.score).toBeLessThan(0.3);
  });
});

describe('rankCandidates', () => {
  it('prefers the studio cut over the live cut', () => {
    const ranked = rankCandidates(track, [
      candidate({ id: 'live', title: 'Violet Static - Neon Harbour (Live)' }),
      candidate({ id: 'studio' }),
    ]);
    expect(ranked[0]?.candidate.id).toBe('studio');
  });

  it('breaks ties on the closest duration', () => {
    const ranked = rankCandidates(track, [
      candidate({ id: 'further', durationMs: 214_000 }),
      candidate({ id: 'closer', durationMs: 210_000 }),
    ]);
    expect(ranked[0]?.candidate.id).toBe('closer');
  });

  it('keeps disqualified candidates in the list, scored zero', () => {
    const ranked = rankCandidates(track, [candidate({ durationMs: 600_000 })]);
    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.rejectedReason).toBe('duration-out-of-range');
  });
});

describe('selectBestMatch', () => {
  it('returns the best qualifying candidate', () => {
    const best = selectBestMatch(track, [
      candidate({ id: 'live', title: 'Violet Static - Neon Harbour (Live)' }),
      candidate({ id: 'studio' }),
    ]);
    expect(best?.candidate.id).toBe('studio');
  });

  it('returns null when nothing clears the minimum score', () => {
    expect(
      selectBestMatch(track, [
        candidate({
          title: 'Completely Different Song',
          uploader: 'Random Uploader',
        }),
      ]),
    ).toBeNull();
  });

  it('returns null for an empty candidate list', () => {
    expect(selectBestMatch(track, [])).toBeNull();
  });

  it('never returns a duration-disqualified candidate', () => {
    expect(
      selectBestMatch(track, [candidate({ durationMs: 600_000 })]),
    ).toBeNull();
  });

  it('honours a raised minimum score', () => {
    const live = candidate({ title: 'Violet Static - Neon Harbour (Live)' });
    expect(selectBestMatch(track, [live])).not.toBeNull();
    expect(selectBestMatch(track, [live], { minimumScore: 0.95 })).toBeNull();
  });
});

describe('buildSearchQueries', () => {
  it('deduplicates the single-artist case', () => {
    expect(buildSearchQueries(track)).toEqual(['Violet Static - Neon Harbour']);
  });

  it('offers a featured-artist-free fallback', () => {
    expect(
      buildSearchQueries({
        ...track,
        title: 'Neon Harbour (feat. Kaito Rivers)',
      }),
    ).toEqual([
      'Violet Static - Neon Harbour (feat. Kaito Rivers)',
      'Violet Static - Neon Harbour',
    ]);
  });

  it('offers a primary-artist-only fallback for collaborations', () => {
    expect(
      buildSearchQueries({
        ...track,
        artists: ['Violet Static', 'Kaito Rivers'],
      }),
    ).toEqual([
      'Violet Static, Kaito Rivers - Neon Harbour',
      'Violet Static - Neon Harbour',
    ]);
  });
});
