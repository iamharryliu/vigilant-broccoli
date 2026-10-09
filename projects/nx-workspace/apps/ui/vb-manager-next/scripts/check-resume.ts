import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  describeResumePdfLayout,
  isResumePdfPolished,
  validateResume,
} from '@vigilant-broccoli/resume';
import { renderResumePdf } from '@vigilant-broccoli/resume/server';
import { loadSkillsNote } from '../src/app/api/resume/chat/resume-chat.skills-note.server';
import { findGroundingIssues } from '../src/lib/resume-chat.grounding';
import { EMPTY_TAILORING_CONTEXT } from '../src/lib/resume-chat.schema';

const RESUME_PATH = 'libs/@vigilant-broccoli/resume/src/resume.json';
const DEFAULT_BASE_REF = 'HEAD';
const FAILURE_EXIT_CODE = 1;
const PREFIX = {
  OK: '✓',
  FAIL: '✗',
} as const;

const readBaseline = (ref: string): unknown =>
  JSON.parse(
    execFileSync('git', ['show', `${ref}:./${RESUME_PATH}`], {
      encoding: 'utf-8',
    }),
  );

const parseResume = (value: unknown) => {
  const validation = validateResume(value);
  if (!validation.ok) {
    console.error(`${PREFIX.FAIL} Invalid resume:`, validation.errors);
    process.exit(FAILURE_EXIT_CODE);
  }
  return validation.resume;
};

/**
 * Runs the in-app editor's code-enforced checks on the working-tree resume so a
 * CLI edit is held to the same rules. The baseline is the committed resume,
 * standing in for the editor's "current resume"; a rule the user explicitly
 * waived for this edit is the only reason to ignore a reported issue.
 */
const main = async (): Promise<void> => {
  const baseRef = process.argv[2] ?? DEFAULT_BASE_REF;
  const candidate = parseResume(JSON.parse(readFileSync(RESUME_PATH, 'utf-8')));
  const current = parseResume(readBaseline(baseRef));

  const issues = findGroundingIssues({
    current,
    candidate,
    context: EMPTY_TAILORING_CONTEXT,
    userMessages: [],
    skillsNote: await loadSkillsNote(),
  });
  issues.forEach(issue => console.error(`${PREFIX.FAIL} ${issue}`));

  const { layout } = await renderResumePdf(candidate);
  const layoutOk = isResumePdfPolished(layout);
  console.log(
    `${layoutOk ? PREFIX.OK : PREFIX.FAIL} ${describeResumePdfLayout(layout)}`,
  );

  if (issues.length === 0) {
    console.log(`${PREFIX.OK} Grounding checks pass against ${baseRef}.`);
  }
  if (issues.length > 0 || !layoutOk) process.exit(FAILURE_EXIT_CODE);
};

main();
