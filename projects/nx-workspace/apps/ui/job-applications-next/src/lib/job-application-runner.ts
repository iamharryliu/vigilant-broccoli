import { copyFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { JobApplicationRun, RUN_KIND } from '../app/constants/runs';
import { ensureCareerFiles } from './career-files.server';
import { startClaudeRun } from './claude-run.server';
import {
  CAREER_EXPERIENCE_PATH,
  JOB_APPLICATIONS_ROOT,
  RESUME_BASELINE_PATH,
  RESUME_PATH,
} from './paths.server';

const SKILL_COMMAND = '/job-application';
const SKILL_SCRIPTS_DIR = 'skill-scripts';
const SKILL_SCRIPTS = [
  'check-resume.cjs',
  'generate-resume-pdf.cjs',
  'generate-cover-letter-pdf.cjs',
];
// The posting is untrusted text, so Bash is limited to the skill's own
// scripts: a broader rule would let an injected posting run any command.
const ALLOWED_TOOLS = [
  'Read',
  'Edit',
  'Write',
  ...SKILL_SCRIPTS.map(script => `Bash(node ${SKILL_SCRIPTS_DIR}/${script}:*)`),
  'Bash(mkdir:*)',
  'Bash(ls:*)',
  'Bash(date:*)',
];
const TITLE_LIMIT = 70;

// The skill reads every location from here, so it works the same with the
// image's mounts and with `nx serve` on the host.
const RUNNER_NOTE = [
  'Runner note:',
  `- Career experience: ${CAREER_EXPERIENCE_PATH}`,
  `- Resume: ${RESUME_PATH}`,
  `- Resume baseline: ${RESUME_BASELINE_PATH}`,
  `- Job Applications folder: ${JOB_APPLICATIONS_ROOT}`,
  `- Run the scripts exactly as \`node ${SKILL_SCRIPTS_DIR}/<script>.cjs <args>\` from the working directory, without \`cd\`; other shell commands are blocked.`,
].join('\n');

// The URL is only context for the skill (company, source); the posting text
// itself comes from the request, since login-gated pages cannot be fetched here.
const buildPrompt = (postingUrl: string, text: string) =>
  [SKILL_COMMAND, postingUrl && `Posting URL: ${postingUrl}`, text, RUNNER_NOTE]
    .filter(Boolean)
    .join('\n\n');

const buildTitle = (postingUrl: string, text: string) => {
  const firstLine = text.split('\n').find(line => line.trim()) ?? postingUrl;
  return firstLine.trim().slice(0, TITLE_LIMIT);
};

// check-resume compares identity and links against the resume as it was
// before the run, which the skill must not change.
const snapshotResume = async () => {
  await mkdir(dirname(RESUME_BASELINE_PATH), { recursive: true });
  await copyFile(RESUME_PATH, RESUME_BASELINE_PATH);
};

export const startJobApplicationRun = async (
  postingUrl: string,
  text: string,
): Promise<JobApplicationRun> => {
  await ensureCareerFiles();
  await snapshotResume();
  await mkdir(JOB_APPLICATIONS_ROOT, { recursive: true });
  return startClaudeRun({
    kind: RUN_KIND.JOB_APPLICATION,
    title: buildTitle(postingUrl, text),
    prompt: buildPrompt(postingUrl, text),
    addedDirs: [
      dirname(CAREER_EXPERIENCE_PATH),
      dirname(RESUME_PATH),
      dirname(RESUME_BASELINE_PATH),
      JOB_APPLICATIONS_ROOT,
    ],
    allowedTools: ALLOWED_TOOLS,
  });
};
