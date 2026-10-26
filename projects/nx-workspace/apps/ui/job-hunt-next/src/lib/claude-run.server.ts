import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { JobApplicationRun, RUN_STATUS, RunKind } from '../app/constants/runs';
import {
  finishJobApplicationRun,
  insertJobApplicationRun,
  pruneJobApplicationRuns,
  updateJobApplicationRunOutput,
} from './job-application-runs.db';
import { SKILL_WORKDIR } from './paths.server';

// Any `claude --model` value: an alias such as `opus` or a full model ID.
const MODEL = process.env.JOB_HUNT_MODEL || 'sonnet';
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
  kind: RunKind;
  title: string;
  prompt: string;
  // Directories outside the working directory, which Claude Code would
  // otherwise refuse to read or write.
  addedDirs: string[];
  // Headless runs cannot answer permission prompts, so anything not listed is
  // denied.
  allowedTools: string[];
  // Runs after a clean exit; a returned message fails the run.
  finalize?: () => Promise<string | null>;
  // Runs once the run has ended, however it ended.
  cleanup?: () => Promise<void>;
};

// Starts `claude -p` in the skill workdir and records it as a run. Callers
// check hasRunningJobApplicationRun first, since runs edit the shared career
// files.
export const startClaudeRun = ({
  kind,
  title,
  prompt,
  addedDirs,
  allowedTools,
  finalize,
  cleanup,
}: ClaudeRunOptions): JobApplicationRun => {
  const run: JobApplicationRun = {
    id: randomUUID(),
    kind,
    title,
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
    cleanup?.().catch(() => undefined);
  };

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

  return run;
};
