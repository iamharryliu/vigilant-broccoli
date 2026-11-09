import { copyFile, mkdir, readFile, rm } from 'fs/promises';
import { randomUUID } from 'crypto';
import { dirname, relative } from 'path';
import { JobApplicationRun, RUN_KIND } from '../app/constants/runs';
import { seedApplicationBaseVersions } from './application-resume.server';
import { ensureCareerFiles } from './career-files.server';
import { startClaudeRun } from './claude-run.server';
import {
  CAREER_EXPERIENCE_PATH,
  getRunPaths,
  JOB_APPLICATIONS_ROOT,
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
const FILE_ENCODING = 'utf-8';

type RunPaths = ReturnType<typeof getRunPaths>;

// The skill reads every location from here, so it works the same with the
// image's mounts and with `nx serve` on the host.
const buildRunnerNote = (paths: RunPaths) =>
  [
    'Runner note:',
    `- Career experience: ${CAREER_EXPERIENCE_PATH}`,
    `- Master resume (read only, never edit): ${RESUME_PATH}`,
    `- Working resume (edit this copy for the application): ${paths.workingResume}`,
    `- Resume baseline: ${paths.baselineResume}`,
    `- Job Applications folder: ${JOB_APPLICATIONS_ROOT}`,
    `- Run the scripts exactly as \`node ${SKILL_SCRIPTS_DIR}/<script>.cjs <args>\` from the working directory, without \`cd\`; other shell commands are blocked.`,
  ].join('\n');

// The URL is only context for the skill (company, source); the posting text
// itself comes from the request, since login-gated pages cannot be fetched here.
const buildPrompt = (postingUrl: string, text: string, paths: RunPaths) =>
  [
    SKILL_COMMAND,
    postingUrl && `Posting URL: ${postingUrl}`,
    text,
    buildRunnerNote(paths),
  ]
    .filter(Boolean)
    .join('\n\n');

const buildTitle = (postingUrl: string, text: string) => {
  const firstLine = text.split('\n').find(line => line.trim()) ?? postingUrl;
  return firstLine.trim().slice(0, TITLE_LIMIT);
};

// check-resume compares identity and links against the resume as it was
// before the run, which the skill must not change. The skill tailors a copy
// so each application gets its own resume and the master stays as written.
const snapshotResume = async (paths: RunPaths) => {
  await mkdir(paths.dir, { recursive: true });
  await copyFile(RESUME_PATH, paths.baselineResume);
  await copyFile(RESUME_PATH, paths.workingResume);
};

// generate-resume-pdf lists every twin it copies from this run's working
// resume, so a sibling run's folder, even one written meanwhile, is never
// claimed.
const readRunApplicationFolders = async (paths: RunPaths) => {
  const lines = await readFile(paths.outputs, FILE_ENCODING).catch(() => '');
  return [
    ...new Set(
      lines
        .split('\n')
        .filter(Boolean)
        .map(twinPath => relative(JOB_APPLICATIONS_ROOT, dirname(twinPath))),
    ),
  ];
};

export const startJobApplicationRun = (
  postingUrl: string,
  text: string,
): JobApplicationRun => {
  const id = randomUUID();
  const paths = getRunPaths(id);
  return startClaudeRun({
    id,
    kind: RUN_KIND.JOB_APPLICATION,
    title: buildTitle(postingUrl, text),
    prompt: buildPrompt(postingUrl, text, paths),
    addedDirs: [
      dirname(CAREER_EXPERIENCE_PATH),
      dirname(RESUME_PATH),
      paths.dir,
      JOB_APPLICATIONS_ROOT,
    ],
    allowedTools: ALLOWED_TOOLS,
    prepare: async () => {
      await ensureCareerFiles();
      await snapshotResume(paths);
      await mkdir(JOB_APPLICATIONS_ROOT, { recursive: true });
    },
    cleanup: async () => {
      try {
        await seedApplicationBaseVersions(
          await readFile(paths.baselineResume, FILE_ENCODING),
          await readRunApplicationFolders(paths),
        );
      } finally {
        await rm(paths.dir, { recursive: true, force: true });
      }
    },
  });
};
