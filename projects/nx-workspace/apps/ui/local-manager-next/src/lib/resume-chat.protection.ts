import type {
  ResumeData,
  ResumeWorkExperience,
} from '@vigilant-broccoli/resume';
import type { SkillsNote } from './resume-chat.skills-note';

const WHITESPACE_PATTERN = /\s+/g;
const QUOTE_PATTERN = /["'“”‘’`]/g;
const MIN_EVIDENCE_CHARS = 3;
const KEY_SEPARATOR = '|';

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(QUOTE_PATTERN, '')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim();

const isQuotedInUserMessages = (
  quote: string,
  userMessages: string[],
): boolean => {
  const needle = normalize(quote);
  return (
    needle.length >= MIN_EVIDENCE_CHARS &&
    userMessages.some(message => normalize(message).includes(needle))
  );
};

const experienceKey = (entry: ResumeWorkExperience): string =>
  [entry.company, entry.role, entry.startDate, entry.endDate]
    .map(normalize)
    .join(KEY_SEPARATOR);

const identityKey = (resume: ResumeData): string =>
  [resume.basics.name, resume.basics.email, resume.basics.phone]
    .map(normalize)
    .join(KEY_SEPARATOR);

const linksKey = (resume: ResumeData): string =>
  resume.basics.links
    .map(link => [link.label, link.url].map(normalize).join(KEY_SEPARATOR))
    .join('\n');

const historyKeys = (resume: ResumeData): string[] =>
  [...resume.workExperience, ...resume.projectExperience]
    .map(experienceKey)
    .sort();

export interface ProtectionInput {
  current: ResumeData;
  candidate: ResumeData;
  userMessages: string[];
  identityChangeEvidence?: string;
  skillsNote?: SkillsNote;
}

/**
 * Header links never change, the title may only become one the skills note
 * lists, and identity, employers, roles and dates only change on an
 * instruction the user wrote.
 */
export const findProtectedFieldIssues = ({
  current,
  candidate,
  userMessages,
  identityChangeEvidence,
  skillsNote,
}: ProtectionInput): string[] => {
  const issues: string[] = [];
  const hasQuotedEvidence = !!(
    identityChangeEvidence &&
    isQuotedInUserMessages(identityChangeEvidence, userMessages)
  );

  if (linksKey(current) !== linksKey(candidate)) {
    issues.push(
      'The header links were changed. Links are never edited here: restore basics.links exactly as in the current resume.',
    );
  }

  const allowedTitles = (skillsNote?.titles ?? []).map(normalize);
  const titleChanged =
    normalize(current.basics.title) !== normalize(candidate.basics.title);
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
