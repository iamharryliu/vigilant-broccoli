import { calculateWorkExperience } from '@vigilant-broccoli/resume';
import type { ResumeData } from '@vigilant-broccoli/resume';
import type { TailoringContext } from './resume-chat.schema';
import type { SkillsNote } from './resume-chat.skills-note';

const BOLD_MARKER = '**';
const PROTECTED_SPAN_PATTERN =
  /(\*\*[^*]+\*\*(?: [A-Za-z]+)? \([^)]*\)|\*\*[^*]+\*\*)/;
const GENERIC_TERMS = new Set([
  'platform',
  'architecture',
  'development',
  'testing',
  'web',
  'services',
]);
const REGEX_SPECIAL_PATTERN = /[.*+?^${}()|[\]\\]/g;
const PARENTHESIS_PATTERN = /\(([^)]*)\)/g;
const ALTERNATIVE_SEPARATORS = /[/,]/;
const MIN_KEYWORD_CHARS = 2;

const lower = (text: string): string => text.toLowerCase();

const containsWord = (text: string, term: string): boolean =>
  new RegExp(
    `(?<![a-z0-9])${term.replace(REGEX_SPECIAL_PATTERN, '\\$&')}(?![a-z0-9])`,
    'i',
  ).test(text);

/** `Accessibility (WCAG, ARIA)` -> accessibility, wcag, aria; `Jest/Vitest` -> jest, vitest. */
const skillTerms = (skill: string): string[] => {
  const inParentheses = Array.from(skill.matchAll(PARENTHESIS_PATTERN)).flatMap(
    match => match[1].split(ALTERNATIVE_SEPARATORS),
  );
  return [
    ...skill.replace(PARENTHESIS_PATTERN, '').split(ALTERNATIVE_SEPARATORS),
    ...inParentheses,
  ]
    .map(term => term.trim())
    .filter(term => term.length >= MIN_KEYWORD_CHARS);
};

const isHighlightable = (term: string): boolean =>
  !GENERIC_TERMS.has(lower(term));

const targetText = (context: TailoringContext): string =>
  lower(
    [
      ...context.requirements,
      context.target,
      ...context.recruiterInstructions,
    ].join('\n'),
  );

const mentionIndex = (target: string, skill: string): number => {
  const indexes = skillTerms(skill)
    .map(term => lower(term))
    .filter(term => containsWord(target, term))
    .map(term =>
      target.search(
        new RegExp(
          `(?<![a-z0-9])${term.replace(REGEX_SPECIAL_PATTERN, '\\$&')}(?![a-z0-9])`,
        ),
      ),
    );
  return indexes.length > 0 ? Math.min(...indexes) : Infinity;
};

/**
 * Skills the target mentions come first, in the order it mentions them (the
 * ledger lists requirements most important first, required before nice-to-have);
 * the rest keep their existing order.
 */
export const orderSkillsByImportance = (
  resume: ResumeData,
  context: TailoringContext,
): ResumeData => {
  const target = targetText(context);
  const ranked = resume.skills.technical.map((skill, position) => ({
    skill,
    position,
    rank: mentionIndex(target, skill),
  }));
  ranked.sort((a, b) =>
    a.rank === b.rank ? a.position - b.position : a.rank < b.rank ? -1 : 1,
  );
  return {
    ...resume,
    skills: { ...resume.skills, technical: ranked.map(item => item.skill) },
  };
};

/**
 * A confirmed skill is a keyword when the target mentions any of its terms; the
 * entry's other terms are related keywords (a posting asking for WCAG also
 * highlights ARIA). Only skills the user holds are ever emphasised.
 */
export const findHighlightKeywords = (
  resume: ResumeData,
  context: TailoringContext,
  skillsNote?: SkillsNote,
): string[] => {
  const target = targetText(context);
  const keywords = [...(skillsNote?.skills ?? []), ...resume.skills.technical]
    .map(skillTerms)
    .filter(terms => terms.some(term => containsWord(target, term)))
    .flat()
    .filter(isHighlightable);
  return Array.from(new Set(keywords.map(lower))).sort(
    (a, b) => b.length - a.length,
  );
};

const highlightText = (text: string, pattern: RegExp): string =>
  text
    .split(PROTECTED_SPAN_PATTERN)
    .map(part =>
      part.startsWith(BOLD_MARKER)
        ? part
        : part.replace(
            pattern,
            match => `${BOLD_MARKER}${match}${BOLD_MARKER}`,
          ),
    )
    .join('');

export const highlightResumeKeywords = (
  resume: ResumeData,
  keywords: string[],
): ResumeData => {
  if (keywords.length === 0) return resume;
  const pattern = new RegExp(
    `(?<![A-Za-z0-9-])(?:${keywords
      .map(keyword => keyword.replace(REGEX_SPECIAL_PATTERN, '\\$&'))
      .join('|')})(?![A-Za-z0-9])`,
    'gi',
  );
  const highlight = (text: string): string => highlightText(text, pattern);
  return {
    ...resume,
    summary: resume.summary ? highlight(resume.summary) : resume.summary,
    workExperience: resume.workExperience.map(entry => ({
      ...entry,
      bullets: entry.bullets.map(highlight),
    })),
    projectExperience: resume.projectExperience.map(entry => ({
      ...entry,
      bullets: entry.bullets.map(highlight),
    })),
  };
};

const LEAD_WORD_WEIGHT = 3;

const ROLE_KEYWORDS: Record<string, string[]> = {
  backend: [
    'back-end',
    'server-side',
    'api',
    'apis',
    'microservice',
    'microservices',
    'distributed',
    'java',
    'spring',
    'spring boot',
    'database',
    'databases',
    'sql',
    'mysql',
    'postgres',
    'rabbitmq',
    'kafka',
    'node',
    'express',
    'fastify',
  ],
  frontend: [
    'front-end',
    'ui',
    'ux',
    'react',
    'angular',
    'vue',
    'css',
    'html',
    'javascript',
    'typescript',
    'accessibility',
    'design system',
    'web',
  ],
  devops: [
    'infrastructure',
    'kubernetes',
    'docker',
    'terraform',
    'ci/cd',
    'pipeline',
    'pipelines',
    'sre',
    'cloud',
    'aws',
    'gcp',
    'deployment',
    'observability',
    'platform engineer',
  ],
  fullstack: ['full-stack', 'full stack', 'end-to-end'],
};

const wordCount = (text: string, word: string): number =>
  (
    text.match(
      new RegExp(
        `(?<![a-z0-9])${word.replace(REGEX_SPECIAL_PATTERN, '\\$&')}(?![a-z0-9])`,
        'g',
      ),
    ) ?? []
  ).length;

const roleScore = (target: string, title: string): number => {
  const lead = lower(title.split(' ')[0]);
  return (
    wordCount(target, lead) * LEAD_WORD_WEIGHT +
    (ROLE_KEYWORDS[lead] ?? []).reduce(
      (total, keyword) => total + wordCount(target, keyword),
      0,
    )
  );
};

/**
 * The model tends to leave `basics.title` alone, so when it has not changed the
 * title, switch to the allowed title closest to the target: its lead word
 * ("Backend", "DevOps", ...) counts most, then the discipline's typical
 * technologies. Titles stay limited to the skills note's Roles.
 */
export const alignTitleWithTarget = (
  resume: ResumeData,
  currentTitle: string,
  context: TailoringContext,
  skillsNote?: SkillsNote,
): ResumeData => {
  if (lower(resume.basics.title) !== lower(currentTitle)) return resume;
  const target = targetText(context);
  const best = (skillsNote?.titles ?? [])
    .map(title => ({ title, score: roleScore(target, title) }))
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score > 0
    ? { ...resume, basics: { ...resume.basics, title: best.title } }
    : resume;
};

const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/;
const YEARS_MENTION = /\byears?\b/i;
const NEARLY_THRESHOLD_MONTHS = 6;

/**
 * The summary always opens with a fixed "ROLE with N years in software
 * development" sentence built from the title and the work dates; the model only
 * writes the related follow-up, and a leading sentence of its own that makes a
 * years claim is dropped.
 */
export const withRoleSummaryOpener = (resume: ResumeData): ResumeData => {
  const { fullYears, remainderMonths } = calculateWorkExperience(resume);
  const years =
    remainderMonths >= NEARLY_THRESHOLD_MONTHS
      ? `nearly ${fullYears + 1}`
      : `${fullYears}+`;
  const followUp = (resume.summary ?? '')
    .trim()
    .split(SENTENCE_BOUNDARY)
    .filter((sentence, index) => !(index === 0 && YEARS_MENTION.test(sentence)))
    .join(' ');
  return {
    ...resume,
    summary: [
      `${resume.basics.title} with ${years} years of experience in software development.`,
      followUp,
    ]
      .filter(Boolean)
      .join(' '),
  };
};

const displaySkill = (skill: string): string =>
  skill.replace(PARENTHESIS_PATTERN, '').replace(/\s+/g, ' ').trim();

const overlapsSkill = (existing: string[], skill: string): boolean =>
  skillTerms(skill).some(term =>
    existing.some(other =>
      skillTerms(other).some(
        otherTerm =>
          containsWord(lower(otherTerm), lower(term)) ||
          containsWord(lower(term), lower(otherTerm)),
      ),
    ),
  );

/**
 * Skills worth keeping on the line beyond what the model chose: confirmed skills
 * the target mentions (in mention order), then the skills already on the
 * current resume. The caller keeps as many as still fit on one line.
 */
export const findExtraSkills = (
  current: ResumeData,
  candidate: ResumeData,
  context: TailoringContext,
  skillsNote?: SkillsNote,
): string[] => {
  const target = targetText(context);
  const mentioned = (skillsNote?.skills ?? [])
    .map(skill => ({ skill, index: mentionIndex(target, skill) }))
    .filter(item => item.index !== Infinity)
    .sort((a, b) => a.index - b.index)
    .map(item => displaySkill(item.skill));
  return [...mentioned, ...current.skills.technical].reduce<string[]>(
    (extras, skill) =>
      overlapsSkill([...candidate.skills.technical, ...extras], skill)
        ? extras
        : [...extras, skill],
    [],
  );
};
