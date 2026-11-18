// The job-application bookmarklet posts a job page to job-hunt-next,
// which acknowledges it; a page embedding the app (local-manager-next's Job Hunt)
// relays both. Installed bookmarklets carry these values, so changing one
// breaks them until they are reinstalled.
export const JOB_APPLICATION_BOOKMARKLET = {
  MESSAGE_SOURCE: 'job-application-bookmarklet',
  ACK: 'job-application-ack',
  // An embedding page passes its own URL in this query param of the app.
  TARGET_PARAM: 'bookmarklet',
  // An embedding page's own query param naming the app path its frame opens.
  PATH_PARAM: 'path',
} as const;

export type JobApplicationBookmarkletMessage = {
  source: typeof JOB_APPLICATION_BOOKMARKLET.MESSAGE_SOURCE;
  url: string;
  title?: string;
  text: string;
};

export const isJobApplicationBookmarkletMessage = (
  data: unknown,
): data is JobApplicationBookmarkletMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as JobApplicationBookmarkletMessage).source ===
    JOB_APPLICATION_BOOKMARKLET.MESSAGE_SOURCE;

export type JobMatchesBookmarkletPosting = {
  url: string;
  title: string;
  text: string;
  // LinkedIn's relative age at capture, such as "2 days ago"; empty when the
  // page did not show one.
  posted?: string;
  // Whether LinkedIn offered Easy Apply; unset for postings captured before
  // it was recorded.
  easyApply?: boolean;
};

// A posting as the app stores it: the capture time is added on save.
export type StoredJobMatchesPosting = JobMatchesBookmarkletPosting & {
  capturedAt: string;
};

export const JOB_MATCHES_PROGRESS_STATE = {
  RUNNING: 'running',
  DONE: 'done',
} as const;

export const JOB_MATCHES_SKIP_REASON = {
  NO_DESCRIPTION: 'no-description',
  DUPLICATE_URL: 'duplicate-url',
} as const;

export type JobMatchesBookmarkletSkip = {
  title: string;
  reason: (typeof JOB_MATCHES_SKIP_REASON)[keyof typeof JOB_MATCHES_SKIP_REASON];
  // The card's key, or the address the click resolved to.
  detail: string;
};

export type JobMatchesBookmarkletProgress = {
  state: (typeof JOB_MATCHES_PROGRESS_STATE)[keyof typeof JOB_MATCHES_PROGRESS_STATE];
  // Postings sent so far, and cards opened so far.
  captured: number;
  seen: number;
};

// The search-results bookmarklet reuses the message source and ack, so an
// embedding page's relay forwards it unchanged; `postings` tells the app to
// score the postings instead of opening the application dialog.
// It streams: one message per captured posting, then one with the state
// `done`, so the app shows results and progress while the page is scanned.
export type JobMatchesBookmarkletMessage = {
  source: typeof JOB_APPLICATION_BOOKMARKLET.MESSAGE_SOURCE;
  postings: JobMatchesBookmarkletPosting[];
  progress: JobMatchesBookmarkletProgress;
  // Cards opened since the last message that produced no posting.
  skipped?: JobMatchesBookmarkletSkip[];
};

export const isJobMatchesBookmarkletMessage = (
  data: unknown,
): data is JobMatchesBookmarkletMessage =>
  isJobApplicationBookmarkletMessage(data) &&
  Array.isArray((data as Partial<JobMatchesBookmarkletMessage>).postings);
