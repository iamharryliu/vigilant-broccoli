import type { ResumeData } from '@vigilant-broccoli/resume';
import type { SkillsNote } from './resume-chat.skills-note';

const BOLD_PATTERN = /\*\*(.+?)\*\*/g;
const BOLD_MARKER = /\*\*/g;
const WHITESPACE_PATTERN = /\s+/g;
// A figure is checked with the word it counts ("15 applications"), so a number
// that exists elsewhere in the sources cannot be attached to a different noun.
// A letter before or after (S3, EC2, 5xx) makes it a name, not a figure.
const FIGURE_PATTERN =
  /(?<![A-Za-z\d])(\d+(?:[.,]\d+)?)[+%]?(?![A-Za-z\d])(?:\s+([A-Za-z]+))?/g;
const NUMBER_PATTERN = /(?<![A-Za-z\d])\d+(?:[.,]\d+)?(?![A-Za-z\d])/g;
const SENTENCE_END = '. ';
const MAX_FACTS_SHOWN = 8;

const normalize = (text: string): string =>
  text.toLowerCase().replace(BOLD_MARKER, '').replace(WHITESPACE_PATTERN, ' ');

const experiences = (resume: ResumeData) => [
  ...resume.workExperience,
  ...resume.projectExperience,
];

// The first summary sentence is the server-written role-and-years opener.
const claimText = (resume: ResumeData): string =>
  [
    (resume.summary ?? '').split(SENTENCE_END).slice(1).join(SENTENCE_END),
    ...experiences(resume).flatMap(entry => entry.bullets),
  ].join('\n');

const figureKeys = (text: string): string[] =>
  [...normalize(text).matchAll(FIGURE_PATTERN)].map(([, number, noun]) =>
    noun ? `${number} ${noun}` : number,
  );

/** Every figure in the draft must already exist in the resume, career note or user messages. */
export const findFigureIssues = (
  current: ResumeData,
  candidate: ResumeData,
  userMessages: string[],
  skillsNote?: SkillsNote,
): string[] => {
  const knownText = [
    JSON.stringify(current),
    JSON.stringify(skillsNote ?? {}),
    ...userMessages,
  ].join('\n');
  const known = new Set([
    ...figureKeys(knownText),
    ...(normalize(knownText).match(NUMBER_PATTERN) ?? []),
  ]);
  // The resume outranks the career note: a noun it already counts keeps its figure.
  const resumeKeys = new Set(figureKeys(JSON.stringify(current)));
  const resumeNouns = new Set(
    [...resumeKeys].map(key => key.split(' ')[1]).filter(Boolean),
  );
  const invented = [...new Set(figureKeys(claimText(candidate)))].filter(
    key =>
      !known.has(key) ||
      (resumeNouns.has(key.split(' ')[1]) && !resumeKeys.has(key)),
  );
  return invented.length > 0
    ? [
        `The draft contains figures that appear in no source: ${invented.join(', ')}. Figures may never be added or changed; restore each to the value in the current resume or career note, or remove it.`,
      ]
    : [];
};

/** Bold phrases of the current resume that the draft no longer contains. */
export const findDroppedFacts = (
  current: ResumeData,
  candidate: ResumeData,
): string[] => {
  const kept = normalize(
    [
      candidate.summary ?? '',
      ...experiences(candidate).flatMap(e => e.bullets),
    ].join('\n'),
  );
  return experiences(current).flatMap(entry =>
    entry.bullets
      .flatMap(bullet => [...bullet.matchAll(BOLD_PATTERN)].map(m => m[1]))
      .filter(phrase => !kept.includes(normalize(phrase)))
      .map(phrase => `${entry.company}: ${phrase}`),
  );
};

export const describeDroppedFacts = (dropped: string[]): string =>
  `Bold facts from the current resume are missing: ${dropped.slice(0, MAX_FACTS_SHOWN).join('; ')}. Keep each phrase, condensing other wording instead.`;
