// The job-application bookmarklet posts a job page to job-applications-next,
// which acknowledges it; a page embedding the app (vb-manager-next's Job Hunt)
// relays both. Installed bookmarklets carry these values, so changing one
// breaks them until they are reinstalled.
export const JOB_APPLICATION_BOOKMARKLET = {
  MESSAGE_SOURCE: 'job-application-bookmarklet',
  ACK: 'job-application-ack',
  // An embedding page passes its own URL in this query param of the app.
  TARGET_PARAM: 'bookmarklet',
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
