import type { JobMatchesBookmarkletPosting } from '@vigilant-broccoli/common-js';
import { SWEDISH_REQUIREMENT, type MatchBrief } from '../constants/matches';
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

export type SkillTerm = {
  name: string;
  aliases?: string[];
  // The name or aliases to match case-sensitively, for names that are common
  // words in lower case ("Go", "C").
  caseSensitive?: string[];
};

// Postings name skills in free text, so only terms listed here are detected;
// a skill missing from the list is never reported as a gap. Names that are
// common words ("R") are left out to avoid false hits, unless matched
// case-sensitively ("Go", "C").
export const SKILL_VOCABULARY: SkillTerm[] = [
  { name: 'TypeScript' },
  { name: 'JavaScript', aliases: ['ECMAScript'] },
  {
    name: 'React',
    aliases: ['React.js', 'ReactJS', 'Next.js', 'NextJS', 'Redux'],
  },
  { name: 'React Native' },
  {
    name: 'Mobile development',
    aliases: [
      'Android',
      'AOSP',
      'iOS',
      'Flutter',
      'Jetpack Compose',
      'SwiftUI',
      'mobile development',
      'mobile apps',
    ],
  },
  { name: 'Vue', aliases: ['Vue.js'] },
  { name: 'Angular' },
  { name: 'Svelte' },
  {
    name: 'Node.js',
    aliases: [
      'NodeJS',
      'NestJS',
      'Nest.js',
      'Express',
      'Express.js',
      'Fastify',
    ],
  },
  { name: 'GraphQL' },
  { name: 'REST API design', aliases: ['REST', 'RESTful', 'REST APIs'] },
  { name: 'gRPC' },
  {
    name: 'HTML and CSS',
    aliases: [
      'HTML',
      'CSS',
      'HTML5',
      'CSS3',
      'Tailwind CSS',
      'Tailwind',
      'Sass',
      'SCSS',
    ],
  },
  { name: 'Python' },
  { name: 'Django' },
  { name: 'Flask' },
  { name: 'FastAPI' },
  { name: 'Java' },
  { name: 'Spring', aliases: ['Spring Boot', 'Spring Framework'] },
  { name: 'Kotlin' },
  { name: 'Swift' },
  { name: 'C#', aliases: ['.NET', 'ASP.NET'] },
  { name: 'C', caseSensitive: ['C'] },
  { name: 'C++' },
  { name: 'Rust' },
  { name: 'Golang', aliases: ['Go'], caseSensitive: ['Go'] },
  { name: 'Ruby', aliases: ['Ruby on Rails', 'Rails'] },
  { name: 'PHP', aliases: ['Laravel'] },
  { name: 'Scala' },
  { name: 'Elixir' },
  { name: 'MongoDB' },
  { name: 'DynamoDB' },
  {
    name: 'SQL',
    aliases: ['SQL Server', 'PostgreSQL', 'Postgres', 'MySQL', 'SQLite'],
  },
  { name: 'Redis' },
  { name: 'Elasticsearch', aliases: ['OpenSearch'] },
  {
    name: 'Message queues',
    aliases: [
      'Kafka',
      'RabbitMQ',
      'Azure Service Bus',
      'Service Bus',
      'MQTT',
      'Mosquitto',
      'EMQX',
    ],
  },
  {
    name: 'Integration platforms',
    aliases: [
      'iPaaS',
      'Azure Integration Services',
      'Boomi',
      'Workato',
      'integration platform',
    ],
  },
  {
    name: 'Microsoft 365',
    aliases: ['SharePoint', 'Office 365', 'M365'],
  },
  { name: 'AWS', aliases: ['Amazon Web Services'] },
  { name: 'GCP', aliases: ['Google Cloud', 'Google Cloud Platform'] },
  { name: 'Azure' },
  {
    name: 'Dynamics 365 & Power Platform',
    aliases: [
      'Dynamics 365',
      'D365',
      'Dynamics 365 Finance & Operations',
      'Dynamics 365 Business Central',
      'Business Central',
      'Power Platform',
      'Power Apps',
      'Power Automate',
      'Dataverse',
    ],
  },
  { name: 'Docker' },
  { name: 'Kubernetes', aliases: ['K8s', 'Helm'] },
  {
    name: 'Infrastructure as Code',
    aliases: ['IaC', 'Terraform', 'Pulumi', 'Ansible', 'GitOps'],
  },
  {
    name: 'Site Reliability Engineering',
    aliases: [
      'Site Reliability',
      'SRE',
      'SLIs/SLOs',
      'SLI',
      'SLIs',
      'SLO',
      'SLOs',
      'service level objectives',
      'error budget',
    ],
  },
  { name: 'HashiCorp Vault' },
  {
    name: 'CI/CD',
    aliases: [
      'Azure DevOps',
      'CI CD',
      'continuous integration',
      'GitHub Actions',
      'GitLab CI',
      'Jenkins',
    ],
  },
  { name: 'Linux' },
  {
    name: 'Networking',
    aliases: ['TCP/IP', 'Wi-Fi', 'WiFi', 'Bluetooth', 'BLE', 'Ethernet'],
  },
  {
    name: 'Industrial automation',
    aliases: [
      'PLC',
      'PLCs',
      'PLC programming',
      'Structured Text',
      'ladder logic',
      'IEC 61131-3',
      'SCADA',
      'OPC UA',
      'TwinCAT',
      'CODESYS',
      'TIA Portal',
    ],
    // "HMI" also names a car's infotainment interface, so only the written
    // acronym counts.
    caseSensitive: ['HMI'],
  },
  { name: 'Bash', aliases: ['shell scripting'] },
  { name: 'PowerShell' },
  { name: 'ETL' },
  {
    name: 'Data pipelines',
    aliases: [
      'Apache Airflow',
      'Airflow',
      'dbt',
      'Dagster',
      'Prefect',
      'data pipeline',
    ],
  },
  { name: 'Data formats', aliases: ['JSON', 'XML'] },
  {
    name: 'Graph databases',
    aliases: ['graph database', 'Neo4j', 'Cypher', 'Gremlin', 'Amazon Neptune'],
  },
  { name: 'Databricks' },
  { name: 'Power BI' },
  { name: 'Figma' },
  {
    name: 'Object-Oriented Programming',
    aliases: ['OOP', 'object oriented programming'],
  },
  { name: 'AI Agents', aliases: ['AI agent', 'agentic AI'] },
  { name: 'Model Context Protocol', aliases: ['MCP', 'MCP servers'] },
  {
    name: 'AI-assisted development',
    aliases: [
      'AI-assisted',
      'AI assisted development',
      'AI coding agents',
      'AI development tools',
      'AI-driven development',
      'Claude Code',
      'Codex',
      'GitHub Copilot',
      'Copilot',
    ],
  },
  {
    name: 'Version control',
    aliases: [
      'Git',
      'GitHub',
      'GitLab',
      'Gerrit',
      'Bitbucket',
      'source control',
      'version control',
    ],
  },
  { name: 'DevOps' },
  { name: 'Observability', aliases: ['Prometheus', 'Grafana', 'Datadog'] },
  { name: 'Distributed systems', aliases: ['distributed system'] },
  {
    name: 'Multi-tenancy',
    aliases: ['multi-tenant', 'multitenant', 'multi tenant', 'multitenancy'],
  },
  {
    name: 'Event-driven architecture',
    aliases: ['event-driven', 'event driven', 'eventdriven arkitektur'],
  },
  {
    name: 'Unit testing',
    aliases: [
      'Jest',
      'Vitest',
      'unit tests',
      'integration testing',
      'Test-driven development',
      'TDD',
    ],
  },
  {
    name: 'End-to-end testing',
    aliases: [
      'Cypress',
      'Playwright',
      'Selenium',
      'E2E testing',
      'E2E tests',
      'test automation',
    ],
  },
  {
    name: 'Bundlers',
    aliases: ['Webpack', 'Vite', 'bundler'],
  },
  { name: 'Nx' },
  { name: 'Microservices', aliases: ['micro-services', 'microservice'] },
  { name: 'Serverless', aliases: ['Lambda'] },
  {
    name: 'Authentication',
    aliases: [
      'OAuth',
      'OIDC',
      'OpenID Connect',
      'SAML',
      'SSO',
      'single sign-on',
      'JWT',
      'Microsoft Entra ID',
      'Entra ID',
      'Azure AD',
      'Azure Active Directory',
      'Active Directory',
      'Okta',
      'Keycloak',
      'Auth0',
    ],
  },
  { name: 'WebSockets', aliases: ['WebSocket'] },
  { name: 'Machine Learning' },
  {
    name: 'Computer vision',
    aliases: ['3D computer vision', '3D CV', 'OpenCV', 'image recognition'],
  },
  { name: 'LLM', aliases: ['LLMs', 'generative AI', 'GenAI'] },
  { name: 'Vector databases', aliases: ['vector database', 'vector DB'] },
  {
    name: 'RAG',
    aliases: [
      'retrieval-augmented generation',
      'retrieval augmented generation',
    ],
  },
  { name: 'Agile', aliases: ['Scrum', 'Kanban'] },
];

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\/]/g;
// Letters, digits and `+`/`#` continue a term ("Java" is not in "JavaScript",
// "C" is not in "C++"), while `.` and `/` end it at a sentence or list.
const TERM_BEFORE = '(?<![A-Za-z0-9+#])';
const TERM_AFTER = '(?![A-Za-z0-9+#])';

// Capitalised common-word names still collide with ordinary phrases, so these
// labels also skip the contexts that are not the language. A guard applies to
// a label whether it is matched case-sensitively or not: "GitLab" skips
// "GitLab CI", which is CI/CD.
const CASE_SENSITIVE_GUARD: Record<
  string,
  { before?: string; after?: string }
> = {
  GitLab: { after: '(?![-\\s]?CI\\b)' },
  Go: { after: '(?![-\\s](?:to|ahead|live|getter|market|beyond)\\b)' },
  C: {
    before:
      '(?<!\\b(?:Vitamin|Plan|Series|Grade|Type|Class|Option|Tier|Phase|Part|Section|Appendix)\\s)',
    after: '(?![-\\s]?(?:level|suite)\\b)',
  },
};

const escapeLabel = (label: string) => label.replace(REGEX_SPECIALS, '\\$&');

const termPattern = (term: SkillTerm) => {
  const exact = term.caseSensitive ?? [];
  const loose = [term.name, ...(term.aliases ?? [])].filter(
    label => !exact.includes(label),
  );
  const patterns = [
    ...(loose.length
      ? [
          new RegExp(
            `${TERM_BEFORE}(?:${loose
              .map(label => {
                const guard = CASE_SENSITIVE_GUARD[label];
                return `${guard?.before ?? ''}${escapeLabel(label)}${guard?.after ?? ''}`;
              })
              .join('|')})${TERM_AFTER}`,
            'i',
          ),
        ]
      : []),
    ...exact.map(label => {
      const guard = CASE_SENSITIVE_GUARD[label];
      return new RegExp(
        `${TERM_BEFORE}${guard?.before ?? ''}${escapeLabel(label)}${TERM_AFTER}${guard?.after ?? ''}`,
      );
    }),
  ];
  return {
    test: (text: string) => patterns.some(pattern => pattern.test(text)),
  };
};

const VOCABULARY = SKILL_VOCABULARY.map(term => ({
  name: term.name,
  pattern: termPattern(term),
}));

const VOCABULARY_LABELS = new Set(
  SKILL_VOCABULARY.flatMap(term =>
    [term.name, ...(term.aliases ?? [])].map(label => label.toLowerCase()),
  ),
);

// Suggestions are stored, so one made before the vocabulary gained the term
// would otherwise stay in the panel.
export const isInVocabulary = (skill: { name: string; aliases: string[] }) =>
  [skill.name, ...skill.aliases].some(label =>
    VOCABULARY_LABELS.has(label.trim().toLowerCase()),
  );

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
  brief: MatchBrief | null;
  role: string;
  company: string;
  matched: string[];
  gaps: string[];
  // Spoken languages the description names.
  languages: string[];
  archived: boolean;
  applied: boolean;
  internship: boolean;
  graduate: boolean;
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
  posting: JobMatchesBookmarkletPosting & {
    capturedAt?: string;
    brief?: MatchBrief | null;
    archived?: boolean;
    applied?: boolean;
  },
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
    brief: posting.brief ?? null,
    role: role || posting.title,
    company,
    matched: matchedNames,
    gaps,
    archived: posting.archived ?? false,
    applied: posting.applied ?? false,
    internship: isInternship(posting.title),
    graduate: isGraduateRole(posting.title),
    languages: withBriefLanguages(detectLanguages(description), posting.brief),
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

export type MatchFilters = {
  level: LevelFilter;
  easyApplyOnly: boolean;
  // Empty means no language filtering.
  languages: string[];
  hideInternships: boolean;
  hideGraduate: boolean;
  // Archived postings are hidden unless this swaps the list to only them.
  archivedOnly: boolean;
  // Within the archived list, keep only postings the user applied for.
  appliedOnly: boolean;
};

// A posting passes when every spoken language it names is one of the user's,
// so "Swedish and English" is hidden for an English-only user; one naming none
// passes.
export const filterMatches = (
  matches: JobMatch[],
  {
    level,
    easyApplyOnly,
    languages,
    hideInternships,
    hideGraduate,
    archivedOnly,
    appliedOnly,
  }: MatchFilters,
) =>
  matches.filter(
    match =>
      match.archived === archivedOnly &&
      (!archivedOnly || !appliedOnly || match.applied) &&
      !(hideInternships && match.internship) &&
      !(hideGraduate && match.graduate) &&
      (level === LEVEL_FILTER_ALL || match.level === level) &&
      (!easyApplyOnly || match.easyApply === true) &&
      (!languages.length ||
        match.languages.every(language => languages.includes(language))),
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

// Suggested skills are not in the vocabulary until accepted, so their postings
// come from testing the description rather than from a match's gaps.
export const postingMentionsSkill = (
  posting: { title: string; text: string },
  term: SkillTerm,
) =>
  termPattern(term).test(
    parseJobDescription(extractJobPosting(posting.title, posting.text))
      .description,
  );

// Spoken languages a posting can name; matched case-sensitively so a lower-case
// "french" or "polish" in running text is not read as a requirement.
export const SPOKEN_LANGUAGES = [
  'Arabic',
  'Chinese',
  'Danish',
  'Dutch',
  'English',
  'Finnish',
  'French',
  'German',
  'Hindi',
  'Italian',
  'Japanese',
  'Korean',
  'Mandarin',
  'Norwegian',
  'Polish',
  'Portuguese',
  'Russian',
  'Spanish',
  'Swedish',
];

const detectLanguages = (description: string) =>
  SPOKEN_LANGUAGES.filter(language =>
    new RegExp(`\\b${language}\\b`).test(description),
  );

// A posting written in Swedish ("svenska") never contains the English word, so
// the brief's verdict also counts.
const withBriefLanguages = (languages: string[], brief?: MatchBrief | null) =>
  brief?.swedish === SWEDISH_REQUIREMENT.REQUIRED &&
  !languages.includes('Swedish')
    ? [...languages, 'Swedish']
    : languages;

// Read from the title only: descriptions of ordinary roles mention "interns" or
// "graduates" in passing ("mentor our interns").
const INTERNSHIP_TITLE =
  /\b(interns?|internship|praktik\w*|thesis|examensarbete|working student)\b/i;
const GRADUATE_TITLE =
  /\b(graduates?|new grad|trainee|early careers?|entry[- ]level)\b/i;

export const isInternship = (title: string) => INTERNSHIP_TITLE.test(title);
export const isGraduateRole = (title: string) => GRADUATE_TITLE.test(title);

// Whether a career-file skill row covers the term, by the same rule matches use.
export const ownsSkill = (term: SkillTerm, ownedSkills: string[]) => {
  const pattern = termPattern(term);
  return ownedSkills.some(skill => pattern.test(skill));
};

// Career-file skills no predefined term covers.
export const ownedSkillsOutsideVocabulary = (ownedSkills: string[]) => {
  const patterns = SKILL_VOCABULARY.map(termPattern);
  return ownedSkills.filter(
    skill => !patterns.some(pattern => pattern.test(skill)),
  );
};
