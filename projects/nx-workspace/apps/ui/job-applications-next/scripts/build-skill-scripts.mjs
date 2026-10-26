// Assembles the runner's working directory: the skill where Claude Code finds
// project skills, and its scripts bundled into files that run with plain
// `node`. Playwright stays external because it needs its browser install
// next to it.
import { build } from 'esbuild';
import { cp } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORKDIR = resolve(
  APP_DIR,
  '../../../dist/apps/ui/job-applications-next/skill-workdir',
);
const SCRIPTS = [
  'check-resume.ts',
  'generate-cover-letter-pdf.ts',
  'generate-resume-pdf.ts',
  'validate-career-file.ts',
];
const LIB_RESUME_JSON = resolve(
  APP_DIR,
  '../../../libs/@vigilant-broccoli/resume/src/resume.json',
);
const TEMPLATE_RESUME_JSON = join(APP_DIR, 'templates/resume.json');

// Same swap as next.config.js: the lib's barrel must not pull the owner's
// resume into the image.
const blankResumePlugin = {
  name: 'blank-resume',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /resume\.json$/ }, args =>
      resolve(args.resolveDir, args.path) === LIB_RESUME_JSON
        ? { path: TEMPLATE_RESUME_JSON }
        : undefined,
    );
  },
};

await build({
  entryPoints: SCRIPTS.map(script => join(APP_DIR, 'scripts', script)),
  outdir: join(WORKDIR, 'skill-scripts'),
  outExtension: { '.js': '.cjs' },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node24',
  tsconfig: join(APP_DIR, 'tsconfig.json'),
  external: ['@playwright/test', 'playwright', 'playwright-core'],
  plugins: [blankResumePlugin],
  logLevel: 'warning',
});

await cp(join(APP_DIR, 'skill'), join(WORKDIR, '.claude/skills'), {
  recursive: true,
});
