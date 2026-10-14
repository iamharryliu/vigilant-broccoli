import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runSyncAll, SYNC_STATE } from '../src/lib/event-scraper/sync-runner';

const DATA_DIR =
  process.env.VB_MANAGER_DATA_DIR ?? path.join(os.homedir(), '.vb-manager');
const LOCK_FILE = path.join(DATA_DIR, 'event-calendars-sync.pid');
const FAILURE_EXIT_CODE = 1;

const releaseLock = () => {
  try {
    if (readFileSync(LOCK_FILE, 'utf-8').trim() === String(process.pid)) {
      rmSync(LOCK_FILE);
    }
  } catch {
    // Lock already gone.
  }
};

const main = async () => {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(LOCK_FILE, String(process.pid));
  process.on('exit', releaseLock);
  process.on('SIGINT', () => process.exit(FAILURE_EXIT_CODE));
  process.on('SIGTERM', () => process.exit(FAILURE_EXIT_CODE));

  const results = await runSyncAll();
  results.forEach(({ name, state, message }) =>
    console.log(`${name}: ${state} — ${message}`),
  );
  const failed = results.filter(result => result.state === SYNC_STATE.FAILED);
  if (failed.length) {
    console.error(
      failed.some(result => result.loginRequired)
        ? 'Facebook login required — sign in to Facebook in Chrome and rerun.'
        : `${failed.length} calendar sync(s) failed.`,
    );
    process.exit(FAILURE_EXIT_CODE);
  }
};

main().catch(error => {
  console.error(error);
  process.exit(FAILURE_EXIT_CODE);
});
