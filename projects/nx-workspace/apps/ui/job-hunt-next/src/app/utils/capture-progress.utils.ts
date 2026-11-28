import {
  JOB_POSTINGS_PROGRESS_STATE,
  type JobPostingsBookmarkletProgress,
} from '@vigilant-broccoli/common-js';
import { CAPTURE_PROGRESS_EVENT } from '../constants/saved-postings';

// A bookmarklet whose tab was closed mid-scan never sends `done`, so progress
// expires when no update arrives for this long.
const PROGRESS_STALE_MS = 60000;

// Module state, not React state: the sidebar receives the messages on every
// page, while the Job postings page that shows them may mount later.
let current: JobPostingsBookmarkletProgress | null = null;
let staleTimer: ReturnType<typeof setTimeout> | undefined;

export const getCaptureProgress = () => current;

export const setCaptureProgress = (
  progress: JobPostingsBookmarkletProgress,
) => {
  clearTimeout(staleTimer);
  current =
    progress.state === JOB_POSTINGS_PROGRESS_STATE.DONE ? null : progress;
  if (current) staleTimer = setTimeout(clearProgress, PROGRESS_STALE_MS);
  window.dispatchEvent(new Event(CAPTURE_PROGRESS_EVENT));
};

const clearProgress = () => {
  current = null;
  window.dispatchEvent(new Event(CAPTURE_PROGRESS_EVENT));
};
