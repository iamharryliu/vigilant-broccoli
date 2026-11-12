import {
  type JobMatchesBookmarkletPosting,
  type StoredJobMatchesPosting,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  JOB_MATCHES_CHANGED_EVENT,
  type MatchSkill,
  type MatchSkillStatus,
} from '../constants/matches';

type PostingsResponse = { postings: StoredJobMatchesPosting[] };

const readPostings = async (response: Response) => {
  if (!response.ok) throw new Error(`Job matches request failed`);
  return ((await response.json()) as PostingsResponse).postings;
};

export const fetchMatchPostings = () =>
  fetch(API_ENDPOINTS.JOB_MATCHES).then(readPostings);

// Adds to the stored postings; ones captured before stay.
export const addMatchPostings = async (
  postings: JobMatchesBookmarkletPosting[],
) => {
  const stored = await fetch(API_ENDPOINTS.JOB_MATCHES, {
    method: HTTP_METHOD.POST,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ postings }),
  }).then(readPostings);
  window.dispatchEvent(new Event(JOB_MATCHES_CHANGED_EVENT));
  return stored;
};

// Removes one posting, or all of them without a `url`.
export const removeMatchPostings = (url?: string) =>
  fetch(
    url
      ? `${API_ENDPOINTS.JOB_MATCHES}?url=${encodeURIComponent(url)}`
      : API_ENDPOINTS.JOB_MATCHES,
    { method: HTTP_METHOD.DELETE },
  ).then(readPostings);

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
