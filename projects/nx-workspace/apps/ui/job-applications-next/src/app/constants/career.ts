export const CAREER_FILE_KIND = {
  CAREER_EXPERIENCE: 'career-experience',
  RESUME: 'resume',
} as const;

export type CareerFileKind =
  (typeof CAREER_FILE_KIND)[keyof typeof CAREER_FILE_KIND];

export const CAREER_PRESET = {
  BLANK: 'blank',
  SAMPLE: 'sample',
} as const;

export type CareerPreset = (typeof CAREER_PRESET)[keyof typeof CAREER_PRESET];

export const CAREER_IMPORT_EXTENSIONS = ['.txt', '.md', '.json', '.pdf'];

// Sent by RunNotifications when an import run rewrites a career file, so an
// open editor reloads it.
export const CAREER_FILE_CHANGED_EVENT = 'career-file-changed';
