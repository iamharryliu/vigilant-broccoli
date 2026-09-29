import { createDocsSnapshotSource } from './docs-snapshot-source';

// Score bands the scorer promises. Duplicated here on purpose: these are the
// contract callers sort by, so a test that imported them could never catch a
// band being widened by accident.
const CONTIGUOUS_MAX = 0.2;
const SUBSEQUENCE_MAX = 0.4;
const FUZZY_MAX = 0.6;

// `github-actions.md` is deliberately listed before `github.md`: the tie-break
// tests below are only meaningful if scan order would otherwise put the wrong
// file first. Reordering these two makes those tests pass for the wrong reason.
const FILES = [
  {
    name: 'github-actions.md',
    path: 'tech/github-actions.md',
    content: 'Workflow syntax.',
  },
  { name: 'github.md', path: 'tech/github.md', content: 'Cloning a repo.' },
  {
    name: 'myproject.md',
    path: 'tech/myproject.md',
    content: 'Scratch space.',
  },
  { name: 'terraform.md', path: 'tech/terraform.md', content: 'Plan, apply.' },
  { name: 'outdoor.md', path: 'hobbies/outdoor.md', content: 'Trail notes.' },
  {
    name: 'changelog.md',
    path: 'notes/changelog.md',
    content: 'Released the kraken on Tuesday.',
  },
];

const STRUCTURE = [
  {
    type: 'directory',
    name: 'tech',
    path: 'tech',
    children: FILES.filter(f => f.path.startsWith('tech/')).map(f => ({
      type: 'file',
      name: f.name,
      path: f.path,
    })),
  },
  {
    type: 'directory',
    name: 'hobbies',
    path: 'hobbies',
    children: [
      { type: 'file', name: 'outdoor.md', path: 'hobbies/outdoor.md' },
    ],
  },
  {
    type: 'directory',
    name: 'notes',
    path: 'notes',
    children: [
      { type: 'file', name: 'changelog.md', path: 'notes/changelog.md' },
    ],
  },
];

const RESPONSES: Record<string, unknown> = {
  'structure.json': STRUCTURE,
  'search-index.json': FILES,
};

const stubFetch = () => {
  globalThis.fetch = (async (url: string) => {
    const body = RESPONSES[String(url)];
    if (!body) return { ok: false } as Response;
    return { ok: true, json: async () => body } as Response;
  }) as typeof fetch;
};

// Each source gets its own caches, so a test can never see another's state.
const search = async (query: string) => {
  stubFetch();
  return createDocsSnapshotSource().searchDocs(query);
};

const filenames = async (query: string) =>
  (await search(query)).filter(r => r.matchType === 'filename');

const paths = async (query: string) =>
  (await filenames(query)).map(r => r.path);

describe('searchDocs filename scoring', () => {
  it('ranks an exact filename match first, in the contiguous band', async () => {
    const [top] = await filenames('github');
    expect(top.path).toBe('tech/github.md');
    expect(top.score).toBeLessThan(CONTIGUOUS_MAX);
  });

  it('survives every single-character typo class', async () => {
    const typos = {
      omission: 'githb',
      transposition: 'gtihub',
      substitution: 'gothub',
      insertion: 'githhub',
    };
    for (const [, query] of Object.entries(typos)) {
      const [top] = await filenames(query);
      expect(top?.path).toBe('tech/github.md');
    }
  });

  it('orders the tiers by band so a weaker match cannot outrank a stronger one', async () => {
    const [exact] = await filenames('github');
    const [gapped] = await filenames('githb');
    const [fuzzy] = await filenames('gtihub');
    expect(exact.score).toBeLessThan(CONTIGUOUS_MAX);
    expect(gapped.score).toBeGreaterThanOrEqual(CONTIGUOUS_MAX);
    expect(gapped.score).toBeLessThan(SUBSEQUENCE_MAX);
    expect(fuzzy.score).toBeGreaterThanOrEqual(SUBSEQUENCE_MAX);
    expect(fuzzy.score).toBeLessThanOrEqual(FUZZY_MAX);
  });

  it('breaks ties on coverage rather than leaving them to array order', async () => {
    // Both files match these identically on gap and offset; only the shorter
    // name covers more of the query.
    expect(await paths('githb')).toEqual([
      'tech/github.md',
      'tech/github-actions.md',
    ]);
    expect(await paths('gtihub')).toEqual([
      'tech/github.md',
      'tech/github-actions.md',
    ]);
  });

  it('rejects a subsequence too scattered to be intentional', async () => {
    // `tfm` is an in-order subsequence of `terraform.md`, but spread across
    // nine characters. Accepting it would make every short query match almost
    // everything; `githb` above is the tight gapped match that must still pass.
    expect(await paths('tfm')).toEqual([]);
  });

  it('returns results sorted by ascending score', async () => {
    const scores = (await filenames('github')).map(r => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it('matches nothing for an empty query', async () => {
    expect(await filenames('')).toEqual([]);
  });

  it('matches nothing for a query with no shared characters', async () => {
    expect(await filenames('zzzz')).toEqual([]);
  });
});

describe('searchDocs fuzzy tier gates', () => {
  it('requires the query to open a word in the target', async () => {
    // Same transposition against the same file; only the first character of
    // the query differs in whether it starts a word.
    expect(await paths('myprojcet')).toEqual(['tech/myproject.md']);
    expect(await paths('yprojcet')).toEqual([]);
  });

  it('requires a minimum query length', async () => {
    // Both are `gith` transposed; only the longer one is allowed to be fuzzy.
    expect(await paths('gtih')).toEqual([]);
    expect(await paths('gtihu')).toContain('tech/github.md');
  });

  it('spends at most one edit on a short query', async () => {
    // `gothbu` is two edits from `github` (substitution + transposition) and
    // shares no ordered subsequence with it, so only the budget can reject it.
    // This is the precision guarantee: fuse.js allowed two errors on a
    // six-character pattern, which is what let unrelated files through.
    expect(await paths('gothbu')).toEqual([]);
    expect(await paths('gothub')).toContain('tech/github.md');
  });

  it('does not let a short common word reach an unrelated file', async () => {
    // `todo` is one transposition from `tdoo` inside `outdoor.md` — the noise
    // the length and word-boundary gates exist to prevent.
    expect(await paths('todo')).toEqual([]);
  });
});

describe('searchDocs content matching', () => {
  it('falls back to content with an excerpt', async () => {
    const [match] = await search('kraken');
    expect(match.path).toBe('notes/changelog.md');
    expect(match.matchType).toBe('content');
    expect(match.excerpt).toContain('kraken');
  });

  it('does not repeat a filename match as a content match', async () => {
    const results = await search('github');
    const forFile = results.filter(r => r.path === 'tech/github.md');
    expect(forFile).toHaveLength(1);
    expect(forFile[0].matchType).toBe('filename');
  });

  it('orders filename matches ahead of content matches', async () => {
    const results = await search('terraform');
    expect(results[0].matchType).toBe('filename');
  });
});
