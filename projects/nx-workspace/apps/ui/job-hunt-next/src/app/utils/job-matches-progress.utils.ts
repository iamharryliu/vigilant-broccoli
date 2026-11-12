import {
  JOB_MATCHES_PROGRESS_STATE,
  type JobMatchesBookmarkletProgress,
} from '@vigilant-broccoli/common-js';
import { JOB_MATCHES_PROGRESS_EVENT } from '../constants/matches';

// A bookmarklet whose tab was closed mid-scan never sends `done`, so progress
// expires when no update arrives for this long.
const PROGRESS_STALE_MS = 60000;

// Module state, not React state: the sidebar receives the messages on every
// page, while the Matches page that shows them may mount later.
let current: JobMatchesBookmarkletProgress | null = null;
let staleTimer: ReturnType<typeof setTimeout> | undefined;

export const getMatchesProgress = () => current;

export const setMatchesProgress = (progress: JobMatchesBookmarkletProgress) => {
  clearTimeout(staleTimer);
  current =
    progress.state === JOB_MATCHES_PROGRESS_STATE.DONE ? null : progress;
  if (current) staleTimer = setTimeout(clearProgress, PROGRESS_STALE_MS);
  window.dispatchEvent(new Event(JOB_MATCHES_PROGRESS_EVENT));
};

const clearProgress = () => {
  current = null;
  window.dispatchEvent(new Event(JOB_MATCHES_PROGRESS_EVENT));
};
