import { execFile, spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { promisify } from 'util';
import {
  BackgroundTask,
  TASK_KIND,
  TASK_STATUS,
} from '../app/constants/background-tasks';
import {
  finishJobApplicationRun,
  hasRunningJobApplicationRun,
  insertJobApplicationRun,
  listJobApplicationRuns,
  pruneJobApplicationRuns,
  updateJobApplicationRunOutput,
} from './job-application-runs.db';

const execFileAsync = promisify(execFile);

const SKILL_COMMAND = '/job-application';
// Headless runs cannot answer permission prompts, so list what the skill's
// workflow needs: resume.json edits, PDF generation and the clipboard answer.
const ALLOWED_TOOLS = [
  'Read',
  'Edit',
  'Write',
  'Bash(npx:*)',
  'Bash(pnpm:*)',
  'Bash(mkdir:*)',
  'Bash(ls:*)',
  'Bash(date:*)',
  'Bash(pbcopy:*)',
  'Bash(pbpaste:*)',
];
const PERSIST_THROTTLE_MS = 2000;
const HOMEBREW_BIN = '/opt/homebrew/bin';
const OUTPUT_LIMIT = 20000;
const HISTORY_LIMIT = 20;
const TITLE_LIMIT = 70;

const STREAM_BLOCK = {
  TEXT: 'text',
  TOOL_USE: 'tool_use',
} as const;

type StreamBlock = { type: string; text?: string; name?: string };

export const listJobApplicationTasks = listJobApplicationRuns;

export const hasRunningJobApplicationTask = hasRunningJobApplicationRun;

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
  [SKILL_COMMAND, postingUrl && `Posting URL: ${postingUrl}`, text]
    .filter(Boolean)
    .join('\n\n');

const buildTitle = (postingUrl: string, text: string) => {
  const firstLine = text.split('\n').find(line => line.trim()) ?? postingUrl;
  return `Job application: ${firstLine.trim().slice(0, TITLE_LIMIT)}`;
};

// Runs are minutes long and edit the shared resume.json, so callers check
// hasRunningJobApplicationTask before starting another.
export const startJobApplicationRun = async (
  postingUrl: string,
  text: string,
): Promise<BackgroundTask> => {
  const { stdout } = await execFileAsync('git', [
    'rev-parse',
    '--show-toplevel',
  ]);
  const task: BackgroundTask = {
    id: randomUUID(),
    kind: TASK_KIND.JOB_APPLICATION,
    title: buildTitle(postingUrl, text),
    status: TASK_STATUS.RUNNING,
    startedAt: new Date().toISOString(),
    output: '',
  };
  insertJobApplicationRun(task);

  let lastPersistedAt = Date.now();
  const append = (chunk: string) => {
    task.output = `${task.output}${chunk}`.slice(-OUTPUT_LIMIT);
    if (Date.now() - lastPersistedAt < PERSIST_THROTTLE_MS) return;
    lastPersistedAt = Date.now();
    updateJobApplicationRunOutput(task.id, task.output);
  };
  const finish = (status: BackgroundTask['status']) => {
    task.status = status;
    task.finishedAt = new Date().toISOString();
    finishJobApplicationRun(task);
    pruneJobApplicationRuns(HISTORY_LIMIT);
  };

  const child = spawn(
    'claude',
    [
      '-p',
      buildPrompt(postingUrl, text),
      '--output-format',
      'stream-json',
      '--verbose',
      '--allowedTools',
      ...ALLOWED_TOOLS,
    ],
    {
      cwd: stdout.trim(),
      env: {
        ...process.env,
        PATH: `${HOMEBREW_BIN}:${process.env.PATH ?? ''}`,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
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
    finish(TASK_STATUS.FAILED);
  });
  child.on('close', code => {
    append(`\nExited with code ${code}\n`);
    finish(code === 0 ? TASK_STATUS.SUCCEEDED : TASK_STATUS.FAILED);
  });

  return task;
};
