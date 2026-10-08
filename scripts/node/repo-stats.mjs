#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const NX_WORKSPACE = 'projects/nx-workspace';
const WEB_APPLICATIONS_REGISTRY = `${NX_WORKSPACE}/apps/ui/pages-index/src/app/consts/webApplications.json`;
const API_APPS_DIR = `${NX_WORKSPACE}/apps/api/`;
const NPM_LIBS_DIR = `${NX_WORKSPACE}/libs/@vigilant-broccoli/`;
const WORKFLOWS_DIR = '.github/workflows/';
const PROJECT_JSON = 'project.json';
const DOCKER_HUB_NAMESPACE = 'iamharryliu';
const PAGES_INDEX_URL = 'https://projects.harryliu.dev/';
const REPO_URL = 'https://github.com/iamharryliu/vigilant-broccoli';
const TARGETS = [
  {
    path: 'README.md',
    template: ({ applications, services, images, packages }) =>
      `Personal monorepo, supporting **${applications} applications**, **${services} API services**, **${images} Docker images** and **${packages} npm packages**. Learn more at [projects.harryliu.dev](${PAGES_INDEX_URL}).`,
  },
  {
    path: `${NX_WORKSPACE}/apps/ui/personal-website-react/src/app/content/about.md`,
    template: ({ applications, services, images, packages }) =>
      `Proud maintainer of [vigilant-broccoli](${REPO_URL}) supporting **${applications} applications**, **${services} API services**, **${images} Docker images** and **${packages} npm packages**.`,
  },
];
const RESUME_PATH = `${NX_WORKSPACE}/libs/@vigilant-broccoli/resume/src/resume.json`;
const RESUME_COUNTS =
  /\*\*\d+ applications\*\*, \*\*\d+ API services\*\*, \*\*\d+ Docker images\*\* and \*\*\d+ npm packages\*\*/;
const MARKER_START = '<!-- managed:repo-stats:start -->';
const MARKER_END = '<!-- managed:repo-stats:end -->';
const CHECK_FLAG = '--check';

const PUSH_COMMAND = /--push\b|docker push\b|docker\/build-push-action/;
const IMAGE_TAG = new RegExp(
  `(?:-t\\s+|IMAGE:\\s*|tags:\\s*)["']?(${DOCKER_HUB_NAMESPACE}/[a-z0-9._-]+)`,
  'g',
);

const read = path => readFileSync(join(REPO_ROOT, path), 'utf8');
const trackedFiles = (...pathspecs) =>
  execFileSync('git', ['ls-files', '--', ...pathspecs], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(path => path && existsSync(join(REPO_ROOT, path)));
const readTargets = path => JSON.parse(read(path)).targets ?? {};
const isDirectChild = dir => path =>
  path.startsWith(dir) &&
  relative(dir, path).split('/').length === 2 &&
  path.endsWith(`/${PROJECT_JSON}`);
const imagesIn = text =>
  PUSH_COMMAND.test(text)
    ? [...text.matchAll(IMAGE_TAG)].map(([, image]) => image)
    : [];
const targetCommands = target =>
  [target.command, target.options?.command, ...(target.options?.commands ?? [])]
    .map(command => command?.command ?? command)
    .filter(command => typeof command === 'string');

const projectJsons = trackedFiles(`${NX_WORKSPACE}/**/${PROJECT_JSON}`);

const countApplications = () =>
  new Set(
    Object.values(JSON.parse(read(WEB_APPLICATIONS_REGISTRY)))
      .flat()
      .map(({ href }) => href),
  ).size;

const countProjectsWithTarget = (dir, target) =>
  projectJsons
    .filter(isDirectChild(dir))
    .filter(path => target in readTargets(path)).length;

const countDockerImages = () =>
  new Set([
    ...projectJsons.flatMap(path =>
      Object.values(readTargets(path))
        .flatMap(targetCommands)
        .flatMap(imagesIn),
    ),
    ...trackedFiles(`${WORKFLOWS_DIR}*.yml`).flatMap(path =>
      imagesIn(read(path)),
    ),
  ]).size;

const computeStats = () => ({
  applications: countApplications(),
  services: countProjectsWithTarget(API_APPS_DIR, 'deploy'),
  images: countDockerImages(),
  packages: countProjectsWithTarget(NPM_LIBS_DIR, 'publish-package'),
});

const withStats = (content, line, path) => {
  const start = content.indexOf(MARKER_START);
  const end = content.indexOf(MARKER_END);
  if (start === -1 || end < start) {
    throw new Error(`${path}: missing ${MARKER_START} / ${MARKER_END} markers`);
  }
  return `${content.slice(0, start + MARKER_START.length)}\n\n${line}\n\n${content.slice(end)}`;
};

const withResumeStats = (
  content,
  { applications, services, images, packages },
  path,
) => {
  if (!RESUME_COUNTS.test(content)) {
    throw new Error(`${path}: no repo-stats counts bullet found`);
  }
  return content.replace(
    RESUME_COUNTS,
    `**${applications} applications**, **${services} API services**, **${images} Docker images** and **${packages} npm packages**`,
  );
};

const REWRITES = [
  ...TARGETS.map(({ path, template }) => ({
    path,
    rewrite: (content, stats) => withStats(content, template(stats), path),
  })),
  {
    path: RESUME_PATH,
    rewrite: (content, stats) => withResumeStats(content, stats, RESUME_PATH),
  },
];

const check = process.argv.includes(CHECK_FLAG);
const stats = computeStats();
const stale = REWRITES.filter(({ path, rewrite }) => {
  const current = read(path);
  const next = rewrite(current, stats);
  if (current === next) return false;
  if (!check) writeFileSync(join(REPO_ROOT, path), next);
  return true;
}).map(({ path }) => path);

if (check && stale.length) {
  console.error(
    `Repo stats line is stale in: ${stale.join(', ')}\nRun: pnpm repo-stats`,
  );
  process.exit(1);
}
console.log(
  stale.length
    ? `Updated: ${stale.join(', ')}`
    : `Up to date: ${JSON.stringify(stats)}`,
);
