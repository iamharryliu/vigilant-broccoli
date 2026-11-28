// Sent when the bookmarklet's progress changes, so an open Job postings page
// shows it.
export const CAPTURE_PROGRESS_EVENT = 'capture-progress';
export const POSTING_SKILL_STATUS = {
  SUGGESTED: 'suggested',
  ACCEPTED: 'accepted',
  DISMISSED: 'dismissed',
} as const;

export type PostingSkillStatus =
  (typeof POSTING_SKILL_STATUS)[keyof typeof POSTING_SKILL_STATUS];

export interface PostingSkill {
  name: string;
  aliases: string[];
  status: PostingSkillStatus;
  // Postings that named the skill when it was suggested.
  postings: number;
}

// Sent by RunNotifications when a skill-suggestion run finishes, so an open
// Job postings page reloads the suggestions.
export const POSTING_SKILLS_CHANGED_EVENT = 'posting-skills-changed';
// Sent when saved postings change (a bookmarklet capture, a recapture or a
// brief run), so an open page reloads them.
export const SAVED_POSTINGS_CHANGED_EVENT = 'saved-postings-changed';

export const SWEDISH_REQUIREMENT = {
  REQUIRED: 'required',
  PREFERRED: 'preferred',
  NOT_MENTIONED: 'not-mentioned',
} as const;

export type SwedishRequirement =
  (typeof SWEDISH_REQUIREMENT)[keyof typeof SWEDISH_REQUIREMENT];

export interface PostingAbbreviation {
  term: string;
  meaning: string;
}

// Written by a posting-brief run from one posting; a field the posting does
// not state is an empty string or list.
export interface PostingBrief {
  summary: string;
  level: string;
  location: string;
  workMode: string;
  employmentType: string;
  compensation: string;
  workAuthorization: string;
  swedish: SwedishRequirement;
  responsibilities: string[];
  mustHave: string[];
  niceToHave: string[];
  redFlags: string[];
  // Abbreviations the posting uses, alphabetical by term.
  abbreviations: PostingAbbreviation[];
}

// `brief` is null until one is generated, and again once a recapture changes
// the posting's text.
// `briefRunning` is true while a run for the posting is queued or running.
export type PostingBriefState = {
  brief: PostingBrief | null;
  briefRunning: boolean;
};
