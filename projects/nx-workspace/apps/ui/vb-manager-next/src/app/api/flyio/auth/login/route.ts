import { NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { FlyioCommand } from '@vigilant-broccoli/ci';

const execAsync = promisify(exec);

const WAIT_FOR_AUTH_ATTEMPTS = 10;
const WAIT_FOR_AUTH_INTERVAL_MS = 500;
const LOGIN_TIMEOUT_MS = 3 * 60 * 1000;

const PTY_COMMAND = 'script';
const AUTH_URL_PATTERN = /https:\/\/fly\.io\/app\/auth\/cli\/\S+/;
const ANSI_ESCAPE_PATTERN = new RegExp(
  `${String.fromCharCode(27)}\\[[0-9;]*m`,
  'g',
);

const LOGIN_FAILED_ERROR = 'Fly.io login failed';
const LOGIN_TIMEOUT_ERROR =
  'Fly.io login timed out waiting for the browser sign-in';
const TOKEN_MISSING_ERROR = 'Fly.io login finished but no token was written';

// flyctl refuses to start the browser flow unless stdin is a terminal
// ("requires an interactive terminal"), so `script` allocates a pty for it.
const buildPtyArgs = (command: string): string[] =>
  process.platform === 'darwin'
    ? ['-q', '/dev/null', ...command.split(' ')]
    : ['-qec', command, '/dev/null'];

const stripAnsi = (value: string): string =>
  value.replace(ANSI_ESCAPE_PATTERN, '');

const waitForAuth = async (): Promise<void> => {
  for (let i = 0; i < WAIT_FOR_AUTH_ATTEMPTS; i++) {
    try {
      await execAsync(FlyioCommand.authToken);
      return;
    } catch {
      await new Promise(resolve =>
        setTimeout(resolve, WAIT_FOR_AUTH_INTERVAL_MS),
      );
    }
  }
  throw new Error(TOKEN_MISSING_ERROR);
};

interface LoginRun {
  code: number | null;
  output: string;
  timedOut: boolean;
}

const runLogin = (): Promise<LoginRun> =>
  new Promise((resolve, reject) => {
    // `script` runs tcgetattr on its own stdin, which errors on a node pipe
    // ("Operation not supported on socket"), so stdin has to be /dev/null.
    const child = spawn(PTY_COMMAND, buildPtyArgs(FlyioCommand.authLogin), {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    let timedOut = false;
    const capture = (chunk: Buffer) => (output += chunk.toString());
    child.stdout.on('data', capture);
    child.stderr.on('data', capture);

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, LOGIN_TIMEOUT_MS);

    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code, output: stripAnsi(output), timedOut });
    });
    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
  });

export async function POST() {
  try {
    const { code, output, timedOut } = await runLogin();

    if (code !== 0) {
      console.error('Fly.io login failed:', output);
      return NextResponse.json(
        {
          success: false,
          error: timedOut ? LOGIN_TIMEOUT_ERROR : LOGIN_FAILED_ERROR,
          authUrl: output.match(AUTH_URL_PATTERN)?.[0] ?? null,
        },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }

    await waitForAuth();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging in to Fly.io:', error);
    return NextResponse.json(
      { success: false, error: LOGIN_FAILED_ERROR },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
