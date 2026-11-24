import type { NoteGraph } from '@vigilant-broccoli/docs-explorer';
import { SKILL_VOCABULARY, type JobMatch } from './job-matches.utils';

export const GROUP_NODE_PREFIX = 'group:';
export const SKILL_LINK_KIND = {
  CO_OCCURS: 'co-occurs',
} as const;

const OTHER_GROUP = 'Other';

// Two skills get a link once this many postings name both; fewer would turn
// the graph into a hairball.
export const DEFAULT_MIN_SHARED_POSTINGS = 3;
export const MIN_SHARED_POSTINGS_RANGE = { min: 1, max: 10 } as const;

export type SkillGraphOptions = {
  showPairings: boolean;
  minSharedPostings: number;
};

// A vocabulary term missing here lands in "Other" rather than vanishing.
const SKILL_GROUPS: Record<string, string[]> = {
  AI: ['AI-assisted development'],
  'LLM frameworks': [
    'AI Agents',
    'LangChain',
    'LangGraph',
    'LLM',
    'Model Context Protocol',
    'RAG',
  ],
  'Machine learning': [
    'Computer vision',
    'Machine Learning',
    'PyTorch',
    'TensorFlow',
  ],
  Architecture: [
    'Distributed systems',
    'Event-driven architecture',
    'Microservices',
    'Multi-tenancy',
    'Serverless',
  ],
  'Backend and APIs': [
    'Django',
    'FastAPI',
    'Flask',
    'GraphQL',
    'gRPC',
    'Node.js',
    'Authentication',
    'REST API design',
    'Spring',
    'WebSockets',
  ],
  'Business platforms': [
    'Dynamics 365 & Power Platform',
    'Integration platforms',
    'Microsoft 365',
    'NetSuite',
    'Salesforce',
    'WordPress',
  ],
  'Cloud and infrastructure': [
    'AWS',
    'Azure',
    'Bash',
    'Docker',
    'GCP',
    'HashiCorp Vault',
    'Infrastructure as Code',
    'Kubernetes',
    'Linux',
    'Networking',
    'PowerShell',
  ],
  Data: [
    'Data formats',
    'Data pipelines',
    'Databricks',
    'DynamoDB',
    'Elasticsearch',
    'ETL',
    'Graph databases',
    'Message queues',
    'MongoDB',
    'Power BI',
    'Redis',
    'SQL',
    'Vector databases',
  ],
  'Delivery and reliability': [
    'CI/CD',
    'DevOps',
    'Observability',
    'Site Reliability Engineering',
    'Version control',
  ],
  'Engineering practices': [
    'Agile',
    'Bundlers',
    'End-to-end testing',
    'Gradle',
    'Nx',
    'Object-Oriented Programming',
    'Unit testing',
  ],
  'Game development': ['Unity', 'Unreal Engine'],
  Frontend: ['Angular', 'Figma', 'HTML and CSS', 'React', 'Svelte', 'Vue'],
  'Industrial and embedded': ['Industrial automation'],
  Mobile: ['Mobile development', 'React Native'],
  Languages: [
    'C',
    'C#',
    'C++',
    'Elixir',
    'Golang',
    'Java',
    'JavaScript',
    'Kotlin',
    'MATLAB',
    'PHP',
    'Python',
    'Ruby',
    'Rust',
    'Scala',
    'Swift',
    'TypeScript',
  ],
};

const GROUP_BY_SKILL = new Map(
  Object.entries(SKILL_GROUPS).flatMap(([group, skills]) =>
    skills.map(skill => [skill, group] as const),
  ),
);

export const OTHER_SKILL_GROUP = OTHER_GROUP;

export const groupOfSkill = (skill: string) =>
  GROUP_BY_SKILL.get(skill) ?? OTHER_GROUP;

const pairKey = (a: string, b: string) => (a < b ? `${a}\0${b}` : `${b}\0${a}`);

// Every predefined skill hangs off its group; skills named together in the
// stored postings are also linked, so frequently paired skills pull together.
export const buildSkillGraph = (
  matches: JobMatch[],
  { showPairings, minSharedPostings }: SkillGraphOptions,
): NoteGraph => {
  const skillNames = new Set(SKILL_VOCABULARY.map(term => term.name));
  const groupOf = (skill: string) => GROUP_BY_SKILL.get(skill) ?? OTHER_GROUP;
  const groups = new Set(SKILL_VOCABULARY.map(term => groupOf(term.name)));

  const pairCounts = new Map<string, number>();
  matches.forEach(match => {
    const named = [...new Set([...match.matched, ...match.gaps])]
      .filter(skill => skillNames.has(skill))
      .sort();
    named.forEach((skill, index) =>
      named
        .slice(index + 1)
        .forEach(other =>
          pairCounts.set(
            pairKey(skill, other),
            (pairCounts.get(pairKey(skill, other)) ?? 0) + 1,
          ),
        ),
    );
  });

  return {
    nodes: [
      ...[...groups].map(group => ({
        id: `${GROUP_NODE_PREFIX}${group}`,
        name: group,
        group,
      })),
      ...SKILL_VOCABULARY.map(term => ({
        id: term.name,
        name: term.name,
        group: groupOf(term.name),
      })),
    ],
    links: [
      ...SKILL_VOCABULARY.map(term => ({
        source: `${GROUP_NODE_PREFIX}${groupOf(term.name)}`,
        target: term.name,
      })),
      ...(showPairings ? [...pairCounts] : [])
        .filter(([, count]) => count >= minSharedPostings)
        .map(([key, count]) => {
          const [source, target] = key.split('\0');
          return {
            source,
            target,
            value: count,
            kind: SKILL_LINK_KIND.CO_OCCURS,
          };
        }),
    ],
  };
};
