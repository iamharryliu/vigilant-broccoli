import { homedir } from 'os';
import { join, relative, resolve, sep } from 'path';

// The image sets these to its mount points; the defaults serve `nx serve` on
// the host, sharing local-manager-next's Job Applications folder.
const ENV = {
  JOB_APPLICATIONS_DIR: 'JOB_APPLICATIONS_DIR',
  CAREER_DIR: 'CAREER_DIR',
  CAREER_EXPERIENCE_PATH: 'CAREER_EXPERIENCE_PATH',
  RESUME_PATH: 'RESUME_PATH',
  STATE_DIR: 'STATE_DIR',
  TEMPLATES_DIR: 'TEMPLATES_DIR',
  SKILL_WORKDIR: 'SKILL_WORKDIR',
} as const;

const STATE_DIR_NAME = '.job-hunt';
const CAREER_EXPERIENCE_FILE = 'career-experience.md';
const RESUME_FILE = 'resume.json';

const fromEnv = (key: string, fallback: string) => process.env[key] || fallback;

export const JOB_APPLICATIONS_ROOT = fromEnv(
  ENV.JOB_APPLICATIONS_DIR,
  join(homedir(), 'Desktop', 'Job Applications'),
);

export const STATE_DIR = fromEnv(
  ENV.STATE_DIR,
  join(homedir(), STATE_DIR_NAME),
);

const CAREER_DIR = fromEnv(ENV.CAREER_DIR, join(STATE_DIR, 'career'));

export const CAREER_EXPERIENCE_PATH = fromEnv(
  ENV.CAREER_EXPERIENCE_PATH,
  join(CAREER_DIR, CAREER_EXPERIENCE_FILE),
);

export const RESUME_PATH = fromEnv(
  ENV.RESUME_PATH,
  join(CAREER_DIR, RESUME_FILE),
);

export const RESUME_BASELINE_PATH = join(STATE_DIR, 'resume.baseline.json');

// Outside the Job Applications folder so the application list never shows it.
export const RUNS_DB_PATH = join(STATE_DIR, 'job-applications.db');

const TEMPLATES_DIR = fromEnv(
  ENV.TEMPLATES_DIR,
  join(process.cwd(), 'templates'),
);

const SAMPLE_DIR = join(TEMPLATES_DIR, 'sample');

// Blank keeps only the required headings and fields; the sample is a
// fictional profile that also seeds career files that do not exist yet.
export const TEMPLATE_PATH = {
  BLANK: {
    CAREER_EXPERIENCE: join(TEMPLATES_DIR, CAREER_EXPERIENCE_FILE),
    RESUME: join(TEMPLATES_DIR, RESUME_FILE),
  },
  SAMPLE: {
    CAREER_EXPERIENCE: join(SAMPLE_DIR, CAREER_EXPERIENCE_FILE),
    RESUME: join(SAMPLE_DIR, RESUME_FILE),
  },
} as const;

// One folder per career import run, holding its sources and output.
export const IMPORTS_DIR = join(STATE_DIR, 'imports');

// Assembled by the build: `.claude/skills/job-application` plus the bundled
// `skill-scripts`.
export const SKILL_WORKDIR = fromEnv(
  ENV.SKILL_WORKDIR,
  join(process.cwd(), '../../../dist/apps/ui/job-hunt-next/skill-workdir'),
);

export const PATH_PARAM = 'path';

// Resolves a root-relative path, rejecting anything (`..`, absolute paths)
// that would escape the Job Applications folder.
export const resolveJobApplicationsPath = (
  relativePath: string,
): string | null => {
  const absolutePath = resolve(JOB_APPLICATIONS_ROOT, relativePath);
  const fromRoot = relative(JOB_APPLICATIONS_ROOT, absolutePath);
  if (fromRoot.startsWith('..') || fromRoot.startsWith(sep)) return null;
  return absolutePath;
};
