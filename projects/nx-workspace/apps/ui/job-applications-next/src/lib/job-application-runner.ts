import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { copyFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { JobApplicationRun, RUN_STATUS } from '../app/constants/runs';
import { ensureCareerFiles } from './career-files.server';
import {
  finishJobApplicationRun,
  insertJobApplicationRun,
  pruneJobApplicationRuns,
  updateJobApplicationRunOutput,
} from './job-application-runs.db';
import {
  CAREER_EXPERIENCE_PATH,
  JOB_APPLICATIONS_ROOT,
  RESUME_BASELINE_PATH,
  RESUME_PATH,
  SKILL_WORKDIR,
} from './paths.server';

const SKILL_COMMAND = '/job-application';
const SKILL_SCRIPTS_DIR = 'skill-scripts';
const SKILL_SCRIPTS = [
  'check-resume.cjs',
  'generate-resume-pdf.cjs',
  'generate-cover-letter-pdf.cjs',
];
// Headless runs cannot answer permission prompts, so anything not listed is
// denied. The posting is untrusted text, so Bash is limited to the skill's own
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
const PERSIST_THROTTLE_MS = 2000;
const OUTPUT_LIMIT = 20000;
const HISTORY_LIMIT = 20;
const TITLE_LIMIT = 70;

const STREAM_BLOCK = {
  TEXT: 'text',
  TOOL_USE: 'tool_use',
} as const;

type StreamBlock = { type: string; text?: string; name?: string };

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

const describeStreamLine = (line: string): string => {
  try {
    const event = JSON.parse(line);
    if (event.type !== 'assistant') return '';
    return (event.message.content as StreamBlock[])
      .map(block => {
        if (block.type === STREAM_BLOCK.TEXT) return `${block.text}\n`;
        if (block.type === STREAM_BLOCK.TOOL_USE) return `→ ${block.name}\n`;
        return '';
      })
      .join('');
  } catch {
    return '';
  }
};

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

// Runs are minutes long and edit the shared resume.json, so callers check
// hasRunningJobApplicationRun before starting another.
export const startJobApplicationRun = async (
  postingUrl: string,
  text: string,
): Promise<JobApplicationRun> => {
  await ensureCareerFiles();
  await snapshotResume();
  await mkdir(JOB_APPLICATIONS_ROOT, { recursive: true });

  const run: JobApplicationRun = {
    id: randomUUID(),
    title: buildTitle(postingUrl, text),
    status: RUN_STATUS.RUNNING,
    startedAt: new Date().toISOString(),
    output: '',
  };
  insertJobApplicationRun(run);

  let lastPersistedAt = Date.now();
  const append = (chunk: string) => {
    run.output = `${run.output}${chunk}`.slice(-OUTPUT_LIMIT);
    if (Date.now() - lastPersistedAt < PERSIST_THROTTLE_MS) return;
    lastPersistedAt = Date.now();
    updateJobApplicationRunOutput(run.id, run.output);
  };
  const finish = (status: JobApplicationRun['status']) => {
    run.status = status;
    run.finishedAt = new Date().toISOString();
    finishJobApplicationRun(run);
    pruneJobApplicationRuns(HISTORY_LIMIT);
  };

  // The career files and the applications folder sit outside the working
  // directory, which Claude Code would otherwise refuse to read or write.
  const addedDirs = [
    ...new Set([
      dirname(CAREER_EXPERIENCE_PATH),
      dirname(RESUME_PATH),
      dirname(RESUME_BASELINE_PATH),
      JOB_APPLICATIONS_ROOT,
    ]),
  ];
  const child = spawn(
    'claude',
    [
      '-p',
      buildPrompt(postingUrl, text),
      '--output-format',
      'stream-json',
      '--verbose',
      '--add-dir',
      ...addedDirs,
      '--allowedTools',
      ...ALLOWED_TOOLS,
    ],
    { cwd: SKILL_WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] },
  );

  let buffered = '';
  child.stdout.on('data', chunk => {
    const lines = (buffered + chunk).split('\n');
    buffered = lines.pop() ?? '';
    lines.forEach(line => append(describeStreamLine(line)));
  });
  child.stderr.on('data', chunk => append(String(chunk)));
  child.on('error', error => {
    append(`Failed to start claude: ${error.message}\n`);
    finish(RUN_STATUS.FAILED);
  });
  child.on('close', code => {
    append(`\nExited with code ${code}\n`);
    finish(code === 0 ? RUN_STATUS.SUCCEEDED : RUN_STATUS.FAILED);
  });

  return run;
};
