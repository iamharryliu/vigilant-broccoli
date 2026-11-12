import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import {
  JobApplicationRun,
  RUN_KIND,
  RUN_STATUS,
  RunKind,
} from '../app/constants/runs';
import {
  finishJobApplicationRun,
  insertJobApplicationRun,
  markJobApplicationRunStarted,
  pruneJobApplicationRuns,
  updateJobApplicationRunOutput,
} from './job-application-runs.db';
import { SKILL_WORKDIR } from './paths.server';

// Any `claude --model` value: an alias such as `opus` or a full model ID.
const MODEL = process.env.JOB_HUNT_MODEL || 'sonnet';
const DEFAULT_MAX_CONCURRENT_RUNS = 2;
const MAX_CONCURRENT_RUNS =
  Number(process.env.JOB_HUNT_MAX_CONCURRENT_RUNS) ||
  DEFAULT_MAX_CONCURRENT_RUNS;
const PERSIST_THROTTLE_MS = 2000;
const OUTPUT_LIMIT = 20000;
const HISTORY_LIMIT = 20;

const STREAM_BLOCK = {
  TEXT: 'text',
  TOOL_USE: 'tool_use',
} as const;

type StreamBlock = { type: string; text?: string; name?: string };

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

type ClaudeRunOptions = {
  id?: string;
  kind: RunKind;
  title: string;
  prompt: string;
  // Directories outside the working directory, which Claude Code would
  // otherwise refuse to read or write.
  addedDirs: string[];
  // Headless runs cannot answer permission prompts, so anything not listed is
  // denied.
  allowedTools: string[];
  // Runs when the run leaves the queue, before `claude` starts, so it sees
  // the career files as an earlier import left them; a throw fails the run.
  prepare?: () => Promise<void>;
  // Runs after a clean exit; a returned message fails the run.
  finalize?: () => Promise<string | null>;
  // Runs once the run has ended, however it ended.
  cleanup?: () => Promise<void>;
};

type RunQueue = {
  running: Map<string, RunKind>;
  queued: { kind: RunKind; launch: () => void }[];
};

// Next bundles each route separately, so module-level state would give every
// route its own queue and cap.
const globalStore = globalThis as typeof globalThis & {
  jobHuntRunQueue?: RunQueue;
};

const getQueue = (): RunQueue =>
  (globalStore.jobHuntRunQueue ??= { running: new Map(), queued: [] });

// Suggestions only read stored postings, so they run beside applications.
const isImport = (kind: RunKind) =>
  kind === RUN_KIND.CAREER_EXPERIENCE_IMPORT || kind === RUN_KIND.RESUME_IMPORT;

// Imports rewrite the career files every run reads, so an import runs alone.
const canStart = (kind: RunKind) => {
  const { running } = getQueue();
  if (running.size >= MAX_CONCURRENT_RUNS) return false;
  if (isImport(kind)) return running.size === 0;
  return ![...running.values()].some(isImport);
};

// Oldest first: a waiting import also holds back the job applications behind
// it, so it is never starved.
const startQueuedRuns = () => {
  const { queued } = getQueue();
  while (queued.length && canStart(queued[0].kind)) {
    queued.shift()?.launch();
  }
};

// Records a run and starts `claude -p` in the skill workdir, or queues it
// while the concurrency cap or an import holds it back. Callers refuse career
// imports while any run is active.
export const startClaudeRun = ({
  id = randomUUID(),
  kind,
  title,
  prompt,
  addedDirs,
  allowedTools,
  prepare,
  finalize,
  cleanup,
}: ClaudeRunOptions): JobApplicationRun => {
  const run: JobApplicationRun = {
    id,
    kind,
    title,
    status: RUN_STATUS.QUEUED,
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
    getQueue().running.delete(run.id);
    startQueuedRuns();
    cleanup?.().catch(() => undefined);
  };

  const spawnClaude = () => {
    const child = spawn(
      'claude',
      [
        '-p',
        prompt,
        '--output-format',
        'stream-json',
        '--verbose',
        '--model',
        MODEL,
        '--add-dir',
        ...new Set(addedDirs),
        '--allowedTools',
        ...allowedTools,
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
    child.on('close', async code => {
      append(`\nExited with code ${code}\n`);
      if (code !== 0) return finish(RUN_STATUS.FAILED);
      const error = await finalize?.().catch((err: Error) => err.message);
      if (error) append(`${error}\n`);
      finish(error ? RUN_STATUS.FAILED : RUN_STATUS.SUCCEEDED);
    });
  };

  const launch = () => {
    getQueue().running.set(run.id, kind);
    run.status = RUN_STATUS.RUNNING;
    run.startedAt = new Date().toISOString();
    markJobApplicationRunStarted(run);
    (prepare?.() ?? Promise.resolve()).then(spawnClaude, (error: Error) => {
      append(`Failed to prepare the run: ${error.message}\n`);
      finish(RUN_STATUS.FAILED);
    });
  };

  getQueue().queued.push({ kind, launch });
  startQueuedRuns();
  return run;
};
