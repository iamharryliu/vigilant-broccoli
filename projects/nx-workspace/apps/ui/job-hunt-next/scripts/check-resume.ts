import { readFileSync } from 'node:fs';
import {
  ResumeData,
  ResumeWorkExperience,
  describeResumePdfLayout,
  isResumePdfPolished,
} from '@vigilant-broccoli/resume';
import { renderResumePdf } from '@vigilant-broccoli/resume/server';
import { parseJobExperience } from '../src/app/utils/career-experience.utils';
import {
  CAREER_EXPERIENCE_PATH,
  RESUME_BASELINE_PATH,
} from '../src/lib/paths.server';
import { readResume } from './skill-resume';

const FAILURE_EXIT_CODE = 1;
const KEY_SEPARATOR = '|';
const PREFIX = {
  OK: '✓',
  FAIL: '✗',
} as const;

const normalize = (text = '') => text.trim().toLowerCase();

const keyOf = (values: (string | undefined)[]) =>
  values.map(normalize).join(KEY_SEPARATOR);

const identityKey = ({ basics }: ResumeData) =>
  keyOf([basics.name, basics.email, basics.phone, basics.location]);

const linksKey = ({ basics }: ResumeData) =>
  basics.links.map(link => keyOf([link.label, link.url])).join('\n');

const historyKey = (entry: ResumeWorkExperience) =>
  keyOf([entry.company, entry.role, entry.startDate, entry.endDate]);

const historyKeys = (resume: ResumeData) =>
  [...resume.workExperience, ...resume.projectExperience]
    .map(historyKey)
    .sort()
    .join('\n');

/**
 * Holds a run to the same rules as local-manager-next's resume editor, against
 * the resume as it was when the run started: identity and links never change,
 * the title is one the career experience lists, and employers, roles and dates
 * stay as they were. A resume with no work history yet may take its employers
 * from the career experience.
 */
const findIssues = (
  baseline: ResumeData,
  candidate: ResumeData,
  careerExperience: string,
): string[] => {
  const issues: string[] = [];
  const jobs = parseJobExperience(careerExperience);

  if (identityKey(baseline) !== identityKey(candidate)) {
    issues.push(
      'Name, email, phone or location changed. Restore basics exactly as in the baseline resume.',
    );
  }
  if (linksKey(baseline) !== linksKey(candidate)) {
    issues.push(
      'The header links changed. Restore basics.links exactly as in the baseline resume.',
    );
  }

  const titles = jobs.flatMap(job => job.titles);
  const titleAllowed = titles.length
    ? titles.some(
        title => normalize(title) === normalize(candidate.basics.title),
      )
    : normalize(baseline.basics.title) === normalize(candidate.basics.title);
  if (!titleAllowed) {
    issues.push(
      titles.length
        ? `The title must be one of: ${titles.join(', ')}.`
        : `The title must stay "${baseline.basics.title}".`,
    );
  }

  if (baseline.workExperience.length) {
    if (historyKeys(baseline) !== historyKeys(candidate)) {
      issues.push(
        'Employers, roles or dates changed. Restore every entry exactly as in the baseline resume.',
      );
    }
  } else {
    const companies = new Set(jobs.map(job => normalize(job.company)));
    candidate.workExperience
      .filter(entry => !companies.has(normalize(entry.company)))
      .forEach(entry =>
        issues.push(
          `"${entry.company}" is not in the career experience's Job Experience table.`,
        ),
      );
  }
  return issues;
};

const main = async (): Promise<void> => {
  const candidate = readResume();
  const baseline = readResume(RESUME_BASELINE_PATH);
  const issues = findIssues(
    baseline,
    candidate,
    readFileSync(CAREER_EXPERIENCE_PATH, 'utf-8'),
  );
  issues.forEach(issue => console.error(`${PREFIX.FAIL} ${issue}`));

  const { layout } = await renderResumePdf(candidate);
  const layoutOk = isResumePdfPolished(layout);
  console.log(
    `${layoutOk ? PREFIX.OK : PREFIX.FAIL} ${describeResumePdfLayout(layout)}`,
  );

  if (!issues.length) console.log(`${PREFIX.OK} Protected fields unchanged.`);
  if (issues.length || !layoutOk) process.exit(FAILURE_EXIT_CODE);
};

main();
