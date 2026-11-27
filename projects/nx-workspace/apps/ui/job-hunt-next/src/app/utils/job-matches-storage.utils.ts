import {
  type JobMatchesBookmarkletPosting,
  type JobMatchesBookmarkletSkip,
  type StoredJobMatchesPosting,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  JOB_MATCHES_CHANGED_EVENT,
  type MatchBriefState,
  type MatchSkill,
  type MatchSkillStatus,
} from '../constants/matches';

export type StoredMatchPosting = StoredJobMatchesPosting & MatchBriefState;

type PostingsResponse = { postings: StoredMatchPosting[] };

const readPostings = async (response: Response) => {
  if (!response.ok) throw new Error(`Job matches request failed`);
  return ((await response.json()) as PostingsResponse).postings;
};

export const fetchMatchPostings = () =>
  fetch(API_ENDPOINTS.JOB_MATCHES).then(readPostings);

export const fetchDeletedMatchPostings = () =>
  fetch(`${API_ENDPOINTS.JOB_MATCHES}?deleted=true`).then(readPostings);

// Adds to the stored postings; ones captured before stay.
export const addMatchPostings = async (
  postings: JobMatchesBookmarkletPosting[],
  skipped: JobMatchesBookmarkletSkip[] = [],
) => {
  const stored = await fetch(API_ENDPOINTS.JOB_MATCHES, {
    method: HTTP_METHOD.POST,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ postings, skipped }),
  }).then(readPostings);
  window.dispatchEvent(new Event(JOB_MATCHES_CHANGED_EVENT));
  return stored;
};

export const removeMatchPosting = (url: string) =>
  fetch(`${API_ENDPOINTS.JOB_MATCHES}?url=${encodeURIComponent(url)}`, {
    method: HTTP_METHOD.DELETE,
  }).then(readPostings);

// Soft-deletes every live posting; `deleted` lists their urls for the undo.
export const clearMatchPostings = async () => {
  const response = await fetch(API_ENDPOINTS.JOB_MATCHES, {
    method: HTTP_METHOD.DELETE,
  });
  if (!response.ok) throw new Error('Job matches request failed');
  return (await response.json()) as PostingsResponse & { deleted: string[] };
};

export const setMatchPostingArchived = (
  url: string,
  archived: boolean,
  applied = false,
) =>
  fetch(API_ENDPOINTS.JOB_MATCHES, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ url, archived, applied }),
  }).then(readPostings);

export const restoreMatchPosting = (url: string) =>
  fetch(API_ENDPOINTS.JOB_MATCHES, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ url, deleted: false }),
  }).then(readPostings);

export const restoreMatchPostings = (urls: string[]) =>
  fetch(API_ENDPOINTS.JOB_MATCHES, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ urls, deleted: false }),
  }).then(readPostings);

type SkillsResponse = { skills: MatchSkill[] };

const readSkills = async (response: Response) => {
  if (!response.ok) throw new Error('Match skills request failed');
  return ((await response.json()) as SkillsResponse).skills;
};

export const fetchMatchSkills = () =>
  fetch(API_ENDPOINTS.JOB_MATCHES_SKILLS).then(readSkills);

// Starts the Claude run that suggests skills; its result arrives as stored
// suggestions once the run finishes.
export const startSkillSuggestions = async () => {
  const response = await fetch(API_ENDPOINTS.JOB_MATCHES_SKILLS, {
    method: HTTP_METHOD.POST,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
};

// Starts a run that writes the brief of the posting at `url`; resolves to its
// run id.
export const startMatchBrief = async (url: string): Promise<string> => {
  const response = await fetch(
    `${API_ENDPOINTS.JOB_MATCHES_BRIEF}?url=${encodeURIComponent(url)}`,
    { method: HTTP_METHOD.POST },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.id;
};

export const setMatchSkillStatus = (name: string, status: MatchSkillStatus) =>
  fetch(API_ENDPOINTS.JOB_MATCHES_SKILLS, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ name, status }),
  }).then(readSkills);

export const removeMatchSkill = (name: string) =>
  fetch(
    `${API_ENDPOINTS.JOB_MATCHES_SKILLS}?name=${encodeURIComponent(name)}`,
    { method: HTTP_METHOD.DELETE },
  ).then(readSkills);
