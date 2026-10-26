export const CAREER_FILE_KIND = {
  CAREER_EXPERIENCE: 'career-experience',
  RESUME: 'resume',
} as const;

export type CareerFileKind =
  (typeof CAREER_FILE_KIND)[keyof typeof CAREER_FILE_KIND];
