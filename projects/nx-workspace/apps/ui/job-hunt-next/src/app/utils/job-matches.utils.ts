import type { JobMatchesBookmarkletPosting } from '@vigilant-broccoli/common-js';
import { extractJobPosting, parseJobDescription } from './job-posting.utils';

export const MATCH_LEVEL = {
  STRONG: 'strong',
  OKAY: 'okay',
  WEAK: 'weak',
  UNKNOWN: 'unknown',
} as const;

export type MatchLevel = (typeof MATCH_LEVEL)[keyof typeof MATCH_LEVEL];

// Share of the skills a posting names that the career file also lists.
const STRONG_MATCH_RATIO = 0.7;
const OKAY_MATCH_RATIO = 0.45;

const SKILLS_HEADING = '## Skills';
const SECTION_PREFIX = '## ';
const TABLE_ROW_PREFIX = '|';
const TABLE_HEADER_ROWS = 2;

export type SkillTerm = { name: string; aliases?: string[] };

// Postings name skills in free text, so only terms listed here are detected;
// a skill missing from the list is never reported as a gap. Names that are
// common words ("Go", "R") are left out to avoid false hits.
export const SKILL_VOCABULARY: SkillTerm[] = [
  { name: 'TypeScript' },
  { name: 'JavaScript', aliases: ['ECMAScript'] },
  { name: 'React', aliases: ['React.js', 'ReactJS'] },
  { name: 'React Native' },
  { name: 'Next.js', aliases: ['NextJS'] },
  { name: 'Vue', aliases: ['Vue.js'] },
  { name: 'Angular' },
  { name: 'Svelte' },
  { name: 'Redux' },
  { name: 'Node.js', aliases: ['NodeJS'] },
  { name: 'NestJS', aliases: ['Nest.js'] },
  { name: 'Express', aliases: ['Express.js'] },
  { name: 'Fastify' },
  { name: 'GraphQL' },
  { name: 'REST API design', aliases: ['REST', 'RESTful', 'REST APIs'] },
  { name: 'gRPC' },
  { name: 'HTML and CSS', aliases: ['HTML', 'CSS', 'HTML5', 'CSS3'] },
  { name: 'Tailwind CSS', aliases: ['Tailwind'] },
  { name: 'Sass', aliases: ['SCSS'] },
  { name: 'Python' },
  { name: 'Django' },
  { name: 'Flask' },
  { name: 'FastAPI' },
  { name: 'Java' },
  { name: 'Spring Boot' },
  { name: 'Kotlin' },
  { name: 'Swift' },
  { name: 'C#', aliases: ['.NET', 'ASP.NET'] },
  { name: 'C++' },
  { name: 'Rust' },
  { name: 'Golang' },
  { name: 'Ruby', aliases: ['Ruby on Rails', 'Rails'] },
  { name: 'PHP', aliases: ['Laravel'] },
  { name: 'Scala' },
  { name: 'Elixir' },
  { name: 'PostgreSQL', aliases: ['Postgres'] },
  { name: 'MySQL' },
  { name: 'MongoDB' },
  { name: 'DynamoDB' },
  { name: 'SQL', aliases: ['SQL Server'] },
  { name: 'SQLite' },
  { name: 'Redis' },
  { name: 'Elasticsearch', aliases: ['OpenSearch'] },
  { name: 'Kafka' },
  { name: 'RabbitMQ' },
  { name: 'AWS', aliases: ['Amazon Web Services'] },
  { name: 'GCP', aliases: ['Google Cloud', 'Google Cloud Platform'] },
  { name: 'Azure' },
  { name: 'Docker' },
  { name: 'Kubernetes', aliases: ['K8s'] },
  { name: 'Terraform' },
  { name: 'Ansible' },
  { name: 'Helm' },
  { name: 'CI/CD', aliases: ['CI CD', 'continuous integration'] },
  { name: 'GitHub Actions' },
  { name: 'Jenkins' },
  { name: 'Linux' },
  { name: 'Git' },
  { name: 'Jest' },
  { name: 'Vitest' },
  { name: 'Cypress' },
  { name: 'Playwright' },
  { name: 'Selenium' },
  { name: 'Webpack' },
  { name: 'Vite' },
  { name: 'Nx' },
  { name: 'Microservices', aliases: ['micro-services', 'microservice'] },
  { name: 'Serverless', aliases: ['Lambda'] },
  { name: 'Prometheus' },
  { name: 'Grafana' },
  { name: 'Datadog' },
  { name: 'OAuth', aliases: ['OIDC', 'OpenID Connect'] },
  { name: 'WebSockets', aliases: ['WebSocket'] },
  { name: 'Machine Learning' },
  { name: 'LLM', aliases: ['LLMs', 'generative AI', 'GenAI'] },
  { name: 'Agile', aliases: ['Scrum'] },
];

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\/]/g;
// Letters, digits and `+`/`#` continue a term ("Java" is not in "JavaScript",
// "C" is not in "C++"), while `.` and `/` end it at a sentence or list.
const TERM_BEFORE = '(?<![A-Za-z0-9+#])';
const TERM_AFTER = '(?![A-Za-z0-9+#])';

const termPattern = (term: SkillTerm) =>
  new RegExp(
    `${TERM_BEFORE}(?:${[term.name, ...(term.aliases ?? [])]
      .map(label => label.replace(REGEX_SPECIALS, '\\$&'))
      .join('|')})${TERM_AFTER}`,
    'i',
  );

const VOCABULARY = SKILL_VOCABULARY.map(term => ({
  name: term.name,
  pattern: termPattern(term),
}));

// The first table column of the career file's Skills section.
export const parseOwnedSkills = (careerMarkdown: string): string[] => {
  const lines = careerMarkdown.split('\n');
  const start = lines.findIndex(line => line.trim() === SKILLS_HEADING);
  if (start < 0) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => line.startsWith(SECTION_PREFIX));
  return (end < 0 ? rest : rest.slice(0, end))
    .filter(line => line.trim().startsWith(TABLE_ROW_PREFIX))
    .slice(TABLE_HEADER_ROWS)
    .map(line => line.trim().split(TABLE_ROW_PREFIX)[1]?.trim() ?? '')
    .filter(Boolean);
};

export type JobMatch = {
  url: string;
  // Estimated from LinkedIn's relative age and the capture time; null when the
  // page showed no age.
  postedAt: number | null;
  // Unset for postings captured before Easy Apply was recorded.
  easyApply?: boolean;
  role: string;
  company: string;
  matched: string[];
  gaps: string[];
  ratio: number;
  level: MatchLevel;
};

const POSTED_AGE = /(\d+)\s+(minute|hour|day|week|month)s?\s+ago/i;
const UNIT_MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
} as const;

const estimatePostedAt = (posted?: string, capturedAt?: string) => {
  const age = posted?.match(POSTED_AGE);
  const captured = capturedAt ? Date.parse(capturedAt) : NaN;
  if (!age || Number.isNaN(captured)) return null;
  return (
    captured -
    Number(age[1]) * UNIT_MS[age[2].toLowerCase() as keyof typeof UNIT_MS]
  );
};

const levelFor = (ratio: number, detected: number): MatchLevel => {
  if (!detected) return MATCH_LEVEL.UNKNOWN;
  if (ratio >= STRONG_MATCH_RATIO) return MATCH_LEVEL.STRONG;
  if (ratio >= OKAY_MATCH_RATIO) return MATCH_LEVEL.OKAY;
  return MATCH_LEVEL.WEAK;
};

// Scores one captured search result against the skills the user has recorded.
// `customTerms` are skills the user added from suggestions. A career skill
// covers a vocabulary term when its text contains the term or an alias of it; owned skills outside the vocabulary still count when the
// posting names them verbatim.
export const matchPosting = (
  posting: JobMatchesBookmarkletPosting & { capturedAt?: string },
  ownedSkills: string[],
  customTerms: SkillTerm[] = [],
): JobMatch => {
  const vocabulary = [
    ...VOCABULARY,
    ...customTerms.map(term => ({
      name: term.name,
      pattern: termPattern(term),
    })),
  ];
  const text = extractJobPosting(posting.title, posting.text);
  const { role, company, description } = parseJobDescription(text);

  const detected = vocabulary.filter(term => term.pattern.test(description));
  // Career rows often bundle or qualify tools ("TypeScript / JavaScript",
  // "AWS (EC2, S3, IAM)", "CI/CD pipelines"), so a row covers every term it
  // names rather than only a row named exactly like the term.
  const matched = detected.filter(term =>
    ownedSkills.some(skill => term.pattern.test(skill)),
  );
  const extraMatched = ownedSkills.filter(
    skill =>
      !vocabulary.some(term => term.pattern.test(skill)) &&
      termPattern({ name: skill }).test(description),
  );
  const matchedNames = [...matched.map(term => term.name), ...extraMatched];
  const gaps = detected
    .filter(term => !matched.includes(term))
    .map(term => term.name);
  const total = matchedNames.length + gaps.length;
  const ratio = total ? matchedNames.length / total : 0;

  return {
    url: posting.url,
    postedAt: estimatePostedAt(posting.posted, posting.capturedAt),
    easyApply: posting.easyApply,
    role: role || posting.title,
    company,
    matched: matchedNames,
    gaps,
    ratio,
    level: levelFor(ratio, total),
  };
};

const LEVEL_ORDER = [
  MATCH_LEVEL.STRONG,
  MATCH_LEVEL.OKAY,
  MATCH_LEVEL.WEAK,
  MATCH_LEVEL.UNKNOWN,
];

export const SORT_OPTION = {
  BEST_MATCH: 'best-match',
  FEWEST_GAPS: 'fewest-gaps',
  MOST_MATCHED: 'most-matched',
  NEWEST: 'newest',
  POSTED: 'posted',
} as const;

export type SortOption = (typeof SORT_OPTION)[keyof typeof SORT_OPTION];

const bestMatch = (a: JobMatch, b: JobMatch) =>
  LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) ||
  b.ratio - a.ratio ||
  b.matched.length - a.matched.length;

// `matches` arrives in capture order, which `NEWEST` reverses and every other
// option keeps for ties, since the sort is stable.
export const LEVEL_FILTER_ALL = 'all';

export type LevelFilter = typeof LEVEL_FILTER_ALL | MatchLevel;

export type MatchFilters = { level: LevelFilter; easyApplyOnly: boolean };

export const filterMatches = (
  matches: JobMatch[],
  { level, easyApplyOnly }: MatchFilters,
) =>
  matches.filter(
    match =>
      (level === LEVEL_FILTER_ALL || match.level === level) &&
      (!easyApplyOnly || match.easyApply === true),
  );

export const sortMatches = (matches: JobMatch[], option: SortOption) => {
  const sorted = [...matches];
  switch (option) {
    case SORT_OPTION.NEWEST:
      return sorted.reverse();
    case SORT_OPTION.POSTED:
      // Postings without an age go last.
      return sorted.sort(
        (a, b) =>
          (b.postedAt ?? -Infinity) - (a.postedAt ?? -Infinity) ||
          bestMatch(a, b),
      );
    case SORT_OPTION.FEWEST_GAPS:
      return sorted.sort(
        (a, b) => a.gaps.length - b.gaps.length || bestMatch(a, b),
      );
    case SORT_OPTION.MOST_MATCHED:
      return sorted.sort(
        (a, b) => b.matched.length - a.matched.length || bestMatch(a, b),
      );
    default:
      return sorted.sort(bestMatch);
  }
};

// Gaps that recur across postings, most common first: the skills worth
// learning to widen the pool.
export const countGaps = (matches: JobMatch[]) => {
  const counts = new Map<string, number>();
  matches
    .flatMap(match => match.gaps)
    .forEach(gap => counts.set(gap, (counts.get(gap) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};
