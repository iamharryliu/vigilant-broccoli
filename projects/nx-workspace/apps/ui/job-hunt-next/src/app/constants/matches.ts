// Sent by the sidebar when a search-results bookmarklet adds postings, so an
// open Matches page reloads them.
// Sent when the bookmarklet's progress changes, so an open Matches page shows it.
export const JOB_MATCHES_PROGRESS_EVENT = 'job-matches-progress';
export const MATCH_SKILL_STATUS = {
  SUGGESTED: 'suggested',
  ACCEPTED: 'accepted',
  DISMISSED: 'dismissed',
} as const;

export type MatchSkillStatus =
  (typeof MATCH_SKILL_STATUS)[keyof typeof MATCH_SKILL_STATUS];

export interface MatchSkill {
  name: string;
  aliases: string[];
  status: MatchSkillStatus;
  // Postings that named the skill when it was suggested.
  postings: number;
}

// Sent by RunNotifications when a skill-suggestion run finishes, so an open
// Matches page reloads the suggestions.
export const JOB_MATCH_SKILLS_CHANGED_EVENT = 'job-match-skills-changed';
export const JOB_MATCHES_CHANGED_EVENT = 'job-matches-changed';
