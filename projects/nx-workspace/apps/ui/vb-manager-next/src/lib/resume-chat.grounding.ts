import type {
  ResumeData,
  ResumeWorkExperience,
} from '@vigilant-broccoli/resume';
import type { ConfirmedFact, TailoringContext } from './resume-chat.schema';

const WHITESPACE_PATTERN = /\s+/g;
const QUOTE_PATTERN = /["'“”‘’`]/g;
const URL_PROTOCOL_PATTERN = /^https?:\/\/(www\.)?/i;
const TRAILING_SLASH_PATTERN = /\/+$/;
const MIN_EVIDENCE_CHARS = 3;

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

const isSupportedByFacts = (term: string, facts: ConfirmedFact[]): boolean =>
  facts.some(fact =>
    normalize(`${fact.claim} ${fact.evidence}`).includes(term),
  );

const experienceKey = (entry: ResumeWorkExperience): string =>
  [entry.company, entry.role, entry.startDate, entry.endDate]
    .map(normalize)
    .join('|');

const identityKey = (resume: ResumeData): string =>
  [
    resume.basics.name,
    resume.basics.title,
    resume.basics.email,
    resume.basics.phone,
  ]
    .map(normalize)
    .join('|');

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
}

/**
 * Deterministic guards on what the model may add: new skills need support in the
 * current resume or a confirmed fact, new links need a URL the user supplied,
 * and identity, employers, titles and dates only change on a quoted instruction.
 */
export const findGroundingIssues = ({
  current,
  candidate,
  context,
  userMessages,
  identityChangeEvidence,
}: GroundingInput): string[] => {
  const issues: string[] = [];
  const currentText = normalize(JSON.stringify(current));

  const currentSkills = new Set(current.skills.technical.map(normalize));
  const unsupportedSkills = candidate.skills.technical.filter(skill => {
    const term = normalize(skill);
    return (
      !currentSkills.has(term) &&
      !currentText.includes(term) &&
      !isSupportedByFacts(term, context.confirmedFacts)
    );
  });
  if (unsupportedSkills.length > 0) {
    issues.push(
      `Skills not in the current resume or confirmed by the user: ${unsupportedSkills.join(', ')}. Remove them, or ask the user whether they have genuinely worked with them.`,
    );
  }

  const currentUrls = new Set(
    current.basics.links.map(link => normalize(link.url)),
  );
  const userText = normalize(userMessages.join(' '));
  const unsupportedLinks = candidate.basics.links.filter(link => {
    if (currentUrls.has(normalize(link.url))) return false;
    const bareUrl = normalize(link.url)
      .replace(URL_PROTOCOL_PATTERN, '')
      .replace(TRAILING_SLASH_PATTERN, '');
    return !userText.includes(bareUrl);
  });
  if (unsupportedLinks.length > 0) {
    issues.push(
      `Links the user never provided: ${unsupportedLinks.map(link => link.url).join(', ')}. Only add links the user typed or pasted.`,
    );
  }

  const identityChanged =
    identityKey(current) !== identityKey(candidate) ||
    historyKeys(current).join('\n') !== historyKeys(candidate).join('\n');
  if (
    identityChanged &&
    !(
      identityChangeEvidence &&
      isQuotedInUserMessages(identityChangeEvidence, userMessages)
    )
  ) {
    issues.push(
      'Name, contact details, employers, job titles or dates differ from the current resume, and no user instruction was quoted for it. Restore every employer, role and date exactly, keeping all employment history.',
    );
  }

  return issues;
};
