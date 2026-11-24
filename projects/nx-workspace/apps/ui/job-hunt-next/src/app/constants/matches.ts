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

export const SWEDISH_REQUIREMENT = {
  REQUIRED: 'required',
  PREFERRED: 'preferred',
  NOT_MENTIONED: 'not-mentioned',
} as const;

export type SwedishRequirement =
  (typeof SWEDISH_REQUIREMENT)[keyof typeof SWEDISH_REQUIREMENT];

export interface MatchAbbreviation {
  term: string;
  meaning: string;
}

// Written by a match-brief run from one posting; a field the posting does not
// state is an empty string or list.
export interface MatchBrief {
  summary: string;
  level: string;
  location: string;
  workMode: string;
  compensation: string;
  workAuthorization: string;
  swedish: SwedishRequirement;
  responsibilities: string[];
  mustHave: string[];
  niceToHave: string[];
  redFlags: string[];
  // Abbreviations the posting uses, alphabetical by term.
  abbreviations: MatchAbbreviation[];
}

// `brief` is null until one is generated, and again once a recapture changes
// the posting's text.
// `briefRunning` is true while a run for the posting is queued or running.
export type MatchBriefState = {
  brief: MatchBrief | null;
  briefRunning: boolean;
};
