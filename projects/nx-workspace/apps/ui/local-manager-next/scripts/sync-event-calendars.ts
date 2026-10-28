import {
  appendFileSync,
  fstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  truncateSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  runSyncAll,
  SYNC_STATE,
  SyncAllResult,
} from '../src/lib/event-scraper/sync-runner';
import { SYNC_RUN_TRIGGER } from '../src/app/constants/event-calendars';

const DATA_DIR =
  process.env.VB_MANAGER_DATA_DIR ?? path.join(os.homedir(), '.vb-manager');
const LOCK_FILE = path.join(DATA_DIR, 'event-calendars-sync.pid');
const LOG_FILE = path.join(DATA_DIR, 'event-calendars-sync.log');
const LOG_MAX_BYTES = 1024 * 1024;
const FAILURE_EXIT_CODE = 1;
// setup/dotfiles/zsh/scripts/event_calendars_autosync.zsh keys its retry rule
// on this code: an expired Facebook login waits for the next day.
const LOGIN_REQUIRED_EXIT_CODE = 3;
const STDOUT_FD = 1;

const isSameFile = (fd: number, file: string) => {
  try {
    const fdStat = fstatSync(fd);
    const fileStat = statSync(file);
    return fdStat.dev === fileStat.dev && fdStat.ino === fileStat.ino;
  } catch {
    return false;
  }
};

// Truncate in place rather than replace: the zsh hook's redirect keeps the
// file open in append mode, so a new inode would orphan its output.
const prepareLog = () => {
  try {
    if (statSync(LOG_FILE).size > LOG_MAX_BYTES) truncateSync(LOG_FILE);
  } catch {
    // No log yet.
  }
  appendFileSync(LOG_FILE, '');
  return isSameFile(STDOUT_FD, LOG_FILE);
};

let stdoutIsLog = false;

// The zsh hook already redirects stdout into the log, so echoing there too
// would write every line twice.
const log = (message: string, isError = false) => {
  appendFileSync(LOG_FILE, `${new Date().toISOString()} ${message}\n`);
  if (stdoutIsLog) return;
  if (isError) console.error(message);
  else console.log(message);
};

const logResult = ({ name, state, message }: SyncAllResult) =>
  log(`${name}: ${state} — ${message}`, state === SYNC_STATE.FAILED);

const releaseLock = () => {
  try {
    if (readFileSync(LOCK_FILE, 'utf-8').trim() === String(process.pid)) {
      rmSync(LOCK_FILE);
    }
  } catch {
    // Lock already gone.
  }
};

const isSyncRunning = () => {
  try {
    const pid = Number(readFileSync(LOCK_FILE, 'utf-8').trim());
    // Signal 0 only probes for the process; a stale lock throws ESRCH.
    return Number.isInteger(pid) && pid > 0 && process.kill(pid, 0);
  } catch {
    return false;
  }
};

const main = async () => {
  mkdirSync(DATA_DIR, { recursive: true });
  stdoutIsLog = prepareLog();
  log(`start pid=${process.pid}`);
  process.on('exit', code => log(`finish exit=${code}`));
  if (isSyncRunning()) {
    log('An event-calendar sync is already running.', true);
    process.exit(FAILURE_EXIT_CODE);
  }
  writeFileSync(LOCK_FILE, String(process.pid));
  process.on('exit', releaseLock);
  process.on('SIGINT', () => process.exit(FAILURE_EXIT_CODE));
  process.on('SIGTERM', () => process.exit(FAILURE_EXIT_CODE));

  const results = await runSyncAll(SYNC_RUN_TRIGGER.CLI, logResult);
  const failed = results.filter(result => result.state === SYNC_STATE.FAILED);
  if (!failed.length) return;
  if (failed.some(result => result.loginRequired)) {
    log(
      'Facebook login required — sign in to Facebook in Chrome and rerun.',
      true,
    );
    process.exit(LOGIN_REQUIRED_EXIT_CODE);
  }
  log(`${failed.length} calendar sync(s) failed.`, true);
  process.exit(FAILURE_EXIT_CODE);
};

main().catch(error => {
  log(
    `Sync failed: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
    true,
  );
  process.exit(FAILURE_EXIT_CODE);
});
