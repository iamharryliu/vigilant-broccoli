import { calculateWorkExperience } from '@vigilant-broccoli/resume';
import type {
  ResumeData,
  ResumeWorkExperience,
} from '@vigilant-broccoli/resume';
import type { ConfirmedFact, TailoringContext } from './resume-chat.schema';
import type { SkillsNote } from './resume-chat.skills-note';

const WHITESPACE_PATTERN = /\s+/g;
const QUOTE_PATTERN = /["'“”‘’`]/g;
const MIN_EVIDENCE_CHARS = 3;
const SLASH_PATTERN = /\s*\/\s*/g;
const JS_SUFFIX_PATTERN = /\.js\b/g;
const PARENTHESIS_PATTERN = /\(([^)]*)\)/g;
const REGEX_SPECIAL_PATTERN = /[.*+?^${}()|[\]\\]/g;
const NUMBER_PATTERN = /(?<![A-Za-z0-9])\d[\d,.]*(?![A-Za-z0-9])\+?%?/g;
const NUMBER_TRAILING_PATTERN = /[+%.,]+$/;
const YEARS_CLAIM_PATTERN = /(nearly\s+)?(\d+)\+?\s+years?\b/gi;
const MONTHS_PER_YEAR = 12;
const SKILL_PART_SEPARATOR = '/';
const SKILL_LIST_SEPARATOR = ',';

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(QUOTE_PATTERN, '')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim();

export const isQuotedInUserMessages = (
  quote: string,
  userMessages: string[],
): boolean => {
  const needle = normalize(quote);
  return (
    needle.length >= MIN_EVIDENCE_CHARS &&
    userMessages.some(message => normalize(message).includes(needle))
  );
};

export interface SanitizedContext {
  context: TailoringContext;
  ignoredFacts: string[];
}

/**
 * A confirmed fact must quote something the user actually wrote, and a skill the
 * user denied can never stay confirmed, so a model-authored ledger cannot
 * launder its own suggestions into evidence.
 */
export const sanitizeTailoringContext = (
  context: TailoringContext,
  userMessages: string[],
): SanitizedContext => {
  const denied = context.deniedSkills.map(normalize).filter(Boolean);
  const ignoredFacts: string[] = [];
  const confirmedFacts = context.confirmedFacts.filter(fact => {
    const claim = normalize(fact.claim);
    const supported =
      isQuotedInUserMessages(fact.evidence, userMessages) &&
      !denied.some(skill => claim.includes(skill));
    if (!supported) ignoredFacts.push(fact.claim);
    return supported;
  });
  return { context: { ...context, confirmedFacts }, ignoredFacts };
};

/** Whole-word match, so `java` is not found in `javascript` nor `go` in `mongodb`. */
const containsTerm = (text: string, term: string): boolean =>
  new RegExp(
    `(?<![a-z0-9])${term.replace(REGEX_SPECIAL_PATTERN, '\\$&')}(?![a-z0-9])`,
  ).test(text);

const normalizeSkill = (skill: string): string =>
  normalize(skill)
    .replace(SLASH_PATTERN, SKILL_PART_SEPARATOR)
    .replace(JS_SUFFIX_PATTERN, '');

/** `Accessibility (WCAG, ARIA)` -> accessibility, wcag, aria; `Jest/Vitest` -> jest, vitest. */
const skillParts = (skill: string): string[] => {
  const normalized = normalizeSkill(skill);
  const inParentheses = Array.from(
    normalized.matchAll(PARENTHESIS_PATTERN),
  ).flatMap(match => match[1].split(SKILL_LIST_SEPARATOR));
  return [
    ...normalized.replace(PARENTHESIS_PATTERN, '').split(SKILL_PART_SEPARATOR),
    ...inParentheses,
  ]
    .map(part => part.trim())
    .filter(Boolean);
};

const isSupportedByFacts = (term: string, facts: ConfirmedFact[]): boolean =>
  facts.some(fact =>
    containsTerm(normalize(`${fact.claim} ${fact.evidence}`), term),
  );

/** Only content that describes work counts as evidence, not names, companies or dates. */
const evidenceText = (resume: ResumeData): string =>
  [
    resume.summary ?? '',
    ...[...resume.workExperience, ...resume.projectExperience].flatMap(
      entry => entry.bullets,
    ),
    ...resume.skills.technical,
  ].join(' ');

const numericCores = (text: string): string[] =>
  Array.from(text.matchAll(NUMBER_PATTERN), match =>
    match[0].replace(NUMBER_TRAILING_PATTERN, ''),
  );

/** Prose that can carry a claim: the summary and bullets, not names or dates. */
const claimText = (resume: ResumeData): string =>
  [
    resume.summary ?? '',
    ...[...resume.workExperience, ...resume.projectExperience].flatMap(
      entry => entry.bullets,
    ),
  ].join('\n');

const experienceKey = (entry: ResumeWorkExperience): string =>
  [entry.company, entry.role, entry.startDate, entry.endDate]
    .map(normalize)
    .join('|');

const identityKey = (resume: ResumeData): string =>
  [resume.basics.name, resume.basics.email, resume.basics.phone]
    .map(normalize)
    .join('|');

const linksKey = (resume: ResumeData): string =>
  resume.basics.links
    .map(link => [link.label, link.url].map(normalize).join('|'))
    .join('\n');

const historyKeys = (resume: ResumeData): string[] =>
  [...resume.workExperience, ...resume.projectExperience]
    .map(experienceKey)
    .sort();

export interface GroundingInput {
  current: ResumeData;
  candidate: ResumeData;
  context: TailoringContext;
  userMessages: string[];
  identityChangeEvidence?: string;
  skillsNote?: SkillsNote;
}

/**
 * Deterministic guards on what the model may add: new skills need support in the
 * current resume, the skills note or a confirmed fact; header links never
 * change; the title may only become one the skills note lists; and identity,
 * employers and dates only change on a quoted instruction.
 */
export const findGroundingIssues = ({
  current,
  candidate,
  context,
  userMessages,
  identityChangeEvidence,
  skillsNote,
}: GroundingInput): string[] => {
  const issues: string[] = [];
  const currentText = normalize(evidenceText(current));

  const skillEntries = [
    ...(skillsNote?.skills ?? []),
    ...current.skills.technical,
  ].map(normalizeSkill);
  const isTermSupported = (term: string): boolean =>
    skillEntries.some(entry => containsTerm(entry, term)) ||
    containsTerm(currentText, term) ||
    isSupportedByFacts(term, context.confirmedFacts);
  const unsupportedSkills = candidate.skills.technical.filter(
    skill =>
      !isTermSupported(normalizeSkill(skill)) &&
      !skillParts(skill).every(isTermSupported),
  );
  if (unsupportedSkills.length > 0) {
    issues.push(
      `Skills not in the current resume, the skills note or confirmed by the user: ${unsupportedSkills.join(', ')}. Remove them, or ask the user whether they have genuinely worked with them.`,
    );
  }

  const allowedNumbers = new Set(
    numericCores(
      [
        JSON.stringify(current),
        skillsNote?.skillsText ?? '',
        ...userMessages,
        ...context.confirmedFacts.map(fact => `${fact.claim} ${fact.evidence}`),
      ].join('\n'),
    ),
  );
  const inventedNumbers = Array.from(
    new Set(numericCores(claimText(candidate))),
  ).filter(figure => !allowedNumbers.has(figure));
  if (inventedNumbers.length > 0) {
    issues.push(
      `Figures not found in the current resume, the skills note or what the user said: ${inventedNumbers.join(', ')}. Never invent numbers; restore the original wording or remove them.`,
    );
  }

  const { totalMonths, fullYears } = calculateWorkExperience(candidate);
  const overstatedYears = Array.from(
    claimText(candidate).matchAll(YEARS_CLAIM_PATTERN),
  ).filter(([, nearly, years]) => {
    const limit = nearly ? Math.ceil(totalMonths / MONTHS_PER_YEAR) : fullYears;
    return Number(years) > limit;
  });
  if (overstatedYears.length > 0) {
    issues.push(
      `Experience claimed (${overstatedYears.map(match => match[0]).join(', ')}) exceeds what the work dates support (${fullYears} full years; "nearly ${Math.ceil(totalMonths / MONTHS_PER_YEAR)}" is the most allowed). Never round up.`,
    );
  }

  if (linksKey(current) !== linksKey(candidate)) {
    issues.push(
      'The header links were changed. Links are never edited here: restore basics.links exactly as in the current resume.',
    );
  }

  const allowedTitles = (skillsNote?.titles ?? []).map(normalize);
  const titleChanged =
    normalize(current.basics.title) !== normalize(candidate.basics.title);
  const hasQuotedEvidence = !!(
    identityChangeEvidence &&
    isQuotedInUserMessages(identityChangeEvidence, userMessages)
  );
  const titleAllowed =
    allowedTitles.length > 0
      ? allowedTitles.includes(normalize(candidate.basics.title))
      : hasQuotedEvidence;
  if (titleChanged && !titleAllowed) {
    issues.push(
      allowedTitles.length > 0
        ? `The title may only be one of: ${(skillsNote?.titles ?? []).join(', ')}. Use one of them, or restore "${current.basics.title}".`
        : `The title differs from the current resume ("${current.basics.title}") and no user instruction was quoted for it. Restore it.`,
    );
  }

  const identityChanged =
    identityKey(current) !== identityKey(candidate) ||
    historyKeys(current).join('\n') !== historyKeys(candidate).join('\n');
  if (identityChanged && !hasQuotedEvidence) {
    issues.push(
      'Name, contact details, employers, job roles or dates differ from the current resume, and no user instruction was quoted for it. Restore every employer, role and date exactly, keeping all employment history.',
    );
  }

  return issues;
};
