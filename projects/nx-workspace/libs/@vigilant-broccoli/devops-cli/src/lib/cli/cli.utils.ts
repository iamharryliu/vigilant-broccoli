import { execFile, spawn } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface CliResult {
  stdout: string;
  stderr: string;
}

export interface CliOptions {
  timeoutMs?: number;
}

// `docker ps` and `pm2 jlist` listings run past node's 1MB default.
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;
const CLIPBOARD_CLI = 'pbcopy';
const EXIT_CODE_SUCCESS = 0;

export const runCli = async (
  cli: string,
  args: readonly string[],
  { timeoutMs }: CliOptions = {},
): Promise<CliResult> => {
  const { stdout, stderr } = await execFileAsync(cli, [...args], {
    maxBuffer: MAX_OUTPUT_BYTES,
    timeout: timeoutMs,
  });
  return { stdout, stderr };
};

export const runCliJson = async <T>(
  cli: string,
  args: readonly string[],
  options?: CliOptions,
): Promise<T> => {
  const { stdout } = await runCli(cli, args, options);
  return JSON.parse(stdout || 'null') as T;
};

export const tryRunCli = async (
  cli: string,
  args: readonly string[],
  options?: CliOptions,
): Promise<string | null> => {
  try {
    const { stdout } = await runCli(cli, args, options);
    return stdout;
  } catch {
    return null;
  }
};

export interface CliOutcome {
  output: string;
  failed: boolean;
}

// Failures of the probed CLI are the signal here, so stdout and stderr are
// merged and the exit code is reported rather than thrown.
export const probeCli = async (
  cli: string,
  args: readonly string[],
  options?: CliOptions,
): Promise<CliOutcome> => {
  try {
    const { stdout, stderr } = await runCli(cli, args, options);
    return { output: `${stdout}${stderr}`, failed: false };
  } catch (error) {
    const { stdout = '', stderr = '' } = error as Partial<CliResult>;
    return { output: `${stdout}${stderr}`, failed: true };
  }
};

export const runCliToCompletion = (
  cli: string,
  args: readonly string[],
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(cli, [...args], { stdio: 'ignore' });
    child.on('error', reject);
    child.on('close', code =>
      code === EXIT_CODE_SUCCESS
        ? resolve()
        : reject(new Error(`${cli} exited with code ${code}`)),
    );
  });

// Browser-based CLI logins outlive the request that started them.
export const startDetachedCli = (
  cli: string,
  args: readonly string[],
): void => {
  const child = spawn(cli, [...args], { detached: true, stdio: 'ignore' });
  child.unref();
};

export const copyToClipboard = (text: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(CLIPBOARD_CLI);
    child.on('error', reject);
    child.on('close', code =>
      code === EXIT_CODE_SUCCESS
        ? resolve()
        : reject(new Error(`${CLIPBOARD_CLI} exited with code ${code}`)),
    );
    child.stdin.end(text);
  });

export const toLines = (output: string): string[] =>
  output
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
