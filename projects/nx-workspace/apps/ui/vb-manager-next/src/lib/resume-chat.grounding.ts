import { calculateWorkExperience } from '@vigilant-broccoli/resume';
import type {
  ResumeData,
  ResumeWorkExperience,
} from '@vigilant-broccoli/resume';
import type { ConfirmedFact, TailoringContext } from './resume-chat.schema';
import type { SkillsNote, SkillUsage } from './resume-chat.skills-note';
import { extractQuantities, isQuantityGrounded } from './resume-chat.metrics';

const WHITESPACE_PATTERN = /\s+/g;
const QUOTE_PATTERN = /["'“”‘’`]/g;
const MIN_EVIDENCE_CHARS = 3;
const SLASH_PATTERN = /\s*\/\s*/g;
const JS_SUFFIX_PATTERN = /\.js\b/g;
const PARENTHESIS_PATTERN = /\(([^)]*)\)/g;
const REGEX_SPECIAL_PATTERN = /[.*+?^${}()|[\]\\]/g;
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

/** Prose that can carry a claim: the summary and bullets, not names or dates. */
const claimText = (resume: ResumeData): string =>
  [
    resume.summary ?? '',
    ...[...resume.workExperience, ...resume.projectExperience].flatMap(
      entry => entry.bullets,
    ),
  ].join('\n');

const OPEN_SOURCE_LABEL = 'open source';

/** Entries keyed the way the skills note names them: the company, or `Open Source` for projects. */
const labelledEntries = (
  resume: ResumeData,
): (readonly [string, ResumeWorkExperience])[] => [
  ...resume.workExperience.map(
    entry => [normalize(entry.company), entry] as const,
  ),
  ...resume.projectExperience.map(entry => [OPEN_SOURCE_LABEL, entry] as const),
];

const OPEN_SOURCE_DISPLAY = 'Open Source';

const displayLabel = (resume: ResumeData, label: string): string =>
  resume.workExperience.find(entry => normalize(entry.company) === label)
    ?.company ?? OPEN_SOURCE_DISPLAY;

const bulletsByLabel = (resume: ResumeData): Map<string, string[]> =>
  labelledEntries(resume).reduce(
    (byLabel, [label, entry]) =>
      byLabel.set(label, [...(byLabel.get(label) ?? []), ...entry.bullets]),
    new Map<string, string[]>(),
  );

/**
 * A new bullet may only mention a skill the target asks for in a place the
 * skills note lists it under ("Used In"), so Spring Boot lines can be added to
 * Capco but never to an employer where it was not used.
 */
const findMisplacedSkillBullets = (
  current: ResumeData,
  candidate: ResumeData,
  requirementsText: string,
  skillUsage: SkillUsage[],
): string[] => {
  const before = bulletsByLabel(current);
  const wanted = skillUsage.filter(({ skill }) =>
    skillParts(skill).some(part => containsTerm(requirementsText, part)),
  );
  return Array.from(bulletsByLabel(candidate)).flatMap(([label, bullets]) => {
    const existing = new Set((before.get(label) ?? []).map(normalize));
    return bullets
      .filter(bullet => !existing.has(normalize(bullet)))
      .flatMap(bullet =>
        wanted
          .filter(
            ({ skill, usedIn }) =>
              !usedIn.map(normalize).includes(label) &&
              skillParts(skill).some(part =>
                containsTerm(normalize(bullet), part),
              ),
          )
          .map(
            ({ skill, usedIn }) =>
              `A new bullet under "${displayLabel(candidate, label)}" mentions ${skill}, but the skills note lists it only under: ${usedIn.join(', ') || 'nowhere'}. Move it to one of those or remove it.`,
          ),
      );
  });
};

const withoutYearsClaims = (text: string): string =>
  text.replace(YEARS_CLAIM_PATTERN, ' ');

const entrySourceText = (
  current: ResumeData,
  label: string,
  skillsNote?: SkillsNote,
): string[] => [
  ...labelledEntries(current)
    .filter(([entryLabel]) => entryLabel === label)
    .flatMap(([, entry]) => [...entry.bullets, entry.startDate, entry.endDate]),
  ...(skillsNote?.experience ?? [])
    .filter(entry => normalize(entry.company) === label)
    .flatMap(entry => [entry.context, entry.dates]),
  ...(skillsNote?.skillUsage ?? [])
    .filter(({ usedIn }) => usedIn.map(normalize).includes(label))
    .map(({ note }) => note),
];

/**
 * Every figure in a bullet must come from that same entry's current bullets,
 * its career-note records or the user's own words, so a metric is neither
 * invented nor moved to another employer; the summary may use any of them.
 * Years claims are bounded separately by the work dates.
 */
const findUngroundedFigures = (
  current: ResumeData,
  candidate: ResumeData,
  context: TailoringContext,
  skillsNote?: SkillsNote,
): string[] => {
  const userWords = context.confirmedFacts.map(fact => fact.evidence);
  const allSources = [
    claimText(current),
    ...labelledEntries(current).flatMap(([, entry]) => [
      entry.startDate,
      entry.endDate,
    ]),
    skillsNote?.skillsText ?? '',
    ...(skillsNote?.experience ?? []).map(
      entry => `${entry.context} ${entry.dates}`,
    ),
  ];
  const ungrounded = (text: string, sources: string[]): string[] => {
    const sourceQuantities = extractQuantities(
      [...sources, ...userWords].join('\n'),
    );
    return Array.from(
      new Set(
        extractQuantities(withoutYearsClaims(text))
          .filter(quantity => !isQuantityGrounded(quantity, sourceQuantities))
          .map(quantity => `"${quantity.text}"`),
      ),
    );
  };
  return [
    ['the summary', ungrounded(candidate.summary ?? '', allSources)] as const,
    ...Array.from(bulletsByLabel(candidate)).map(
      ([label, bullets]) =>
        [
          `"${displayLabel(candidate, label)}"`,
          ungrounded(
            bullets.join('\n'),
            entrySourceText(current, label, skillsNote),
          ),
        ] as const,
    ),
  ]
    .filter(([, figures]) => figures.length > 0)
    .map(
      ([place, figures]) =>
        `Figures in ${place} (${figures.join(', ')}) are not in that entry's current bullets, its career-note records or the user's own words. Restore the original figures or drop them; if the user stated one, record it as a confirmed fact quoting their words.`,
    );
};

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
 * current resume, the skills note or a confirmed fact; figures need a source in
 * the same entry; header links never change; the title may only become one the
 * skills note lists; and identity, employers and dates only change on a quoted
 * instruction.
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
    containsTerm(normalize(skillsNote?.experienceText ?? ''), term) ||
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

  issues.push(
    ...findMisplacedSkillBullets(
      current,
      candidate,
      normalize(context.requirements.join('\n')),
      skillsNote?.skillUsage ?? [],
    ),
  );

  issues.push(
    ...findUngroundedFigures(current, candidate, context, skillsNote),
  );

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

/** Whether a gap keyword ended up in the resume after all, so its gap note is stale. */
export const isMentionedInResume = (
  resume: ResumeData,
  keyword: string,
): boolean => {
  const text = normalize(evidenceText(resume));
  const parts = skillParts(keyword);
  return parts.length > 0 && parts.every(part => containsTerm(text, part));
};
