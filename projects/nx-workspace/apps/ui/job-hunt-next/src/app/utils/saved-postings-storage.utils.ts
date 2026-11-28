import {
  type JobPostingsBookmarkletPosting,
  type JobPostingsBookmarkletSkip,
  type StoredBookmarkletPosting,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  SAVED_POSTINGS_CHANGED_EVENT,
  type PostingBriefState,
  type PostingSkill,
  type PostingSkillStatus,
} from '../constants/saved-postings';

export type SavedPosting = StoredBookmarkletPosting & PostingBriefState;

type PostingsResponse = { postings: SavedPosting[] };

const readPostings = async (response: Response) => {
  if (!response.ok) throw new Error(`Job postings request failed`);
  return ((await response.json()) as PostingsResponse).postings;
};

export const fetchSavedPostings = () =>
  fetch(API_ENDPOINTS.JOB_POSTINGS).then(readPostings);

export const fetchDeletedSavedPostings = () =>
  fetch(`${API_ENDPOINTS.JOB_POSTINGS}?deleted=true`).then(readPostings);

// Adds to the stored postings; ones captured before stay.
export const addSavedPostings = async (
  postings: JobPostingsBookmarkletPosting[],
  skipped: JobPostingsBookmarkletSkip[] = [],
) => {
  const stored = await fetch(API_ENDPOINTS.JOB_POSTINGS, {
    method: HTTP_METHOD.POST,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ postings, skipped }),
  }).then(readPostings);
  window.dispatchEvent(new Event(SAVED_POSTINGS_CHANGED_EVENT));
  return stored;
};

export const removeSavedPosting = (url: string) =>
  fetch(`${API_ENDPOINTS.JOB_POSTINGS}?url=${encodeURIComponent(url)}`, {
    method: HTTP_METHOD.DELETE,
  }).then(readPostings);

// Soft-deletes every live posting; `deleted` lists their urls for the undo.
export const clearSavedPostings = async () => {
  const response = await fetch(API_ENDPOINTS.JOB_POSTINGS, {
    method: HTTP_METHOD.DELETE,
  });
  if (!response.ok) throw new Error('Job postings request failed');
  return (await response.json()) as PostingsResponse & { deleted: string[] };
};

export const setSavedPostingArchived = (
  url: string,
  archived: boolean,
  applied = false,
) =>
  fetch(API_ENDPOINTS.JOB_POSTINGS, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ url, archived, applied }),
  }).then(readPostings);

export const restoreSavedPosting = (url: string) =>
  fetch(API_ENDPOINTS.JOB_POSTINGS, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ url, deleted: false }),
  }).then(readPostings);

export const restoreSavedPostings = (urls: string[]) =>
  fetch(API_ENDPOINTS.JOB_POSTINGS, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ urls, deleted: false }),
  }).then(readPostings);

type SkillsResponse = { skills: PostingSkill[] };

const readSkills = async (response: Response) => {
  if (!response.ok) throw new Error('Posting skills request failed');
  return ((await response.json()) as SkillsResponse).skills;
};

export const fetchPostingSkills = () =>
  fetch(API_ENDPOINTS.JOB_POSTINGS_SKILLS).then(readSkills);

// Starts the Claude run that suggests skills; its result arrives as stored
// suggestions once the run finishes.
export const startSkillSuggestions = async () => {
  const response = await fetch(API_ENDPOINTS.JOB_POSTINGS_SKILLS, {
    method: HTTP_METHOD.POST,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
};

// Starts a run that writes the brief of the posting at `url`; resolves to its
// run id.
export const startPostingBrief = async (url: string): Promise<string> => {
  const response = await fetch(
    `${API_ENDPOINTS.JOB_POSTINGS_BRIEF}?url=${encodeURIComponent(url)}`,
    { method: HTTP_METHOD.POST },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.id;
};

export const setPostingSkillStatus = (
  name: string,
  status: PostingSkillStatus,
) =>
  fetch(API_ENDPOINTS.JOB_POSTINGS_SKILLS, {
    method: HTTP_METHOD.PATCH,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ name, status }),
  }).then(readSkills);

export const removePostingSkill = (name: string) =>
  fetch(
    `${API_ENDPOINTS.JOB_POSTINGS_SKILLS}?name=${encodeURIComponent(name)}`,
    { method: HTTP_METHOD.DELETE },
  ).then(readSkills);
