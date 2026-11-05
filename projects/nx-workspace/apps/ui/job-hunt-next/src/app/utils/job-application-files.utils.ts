import { API_ENDPOINTS } from '../constants/api-endpoints';

const DATED_FOLDER_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
const MARKDOWN_BOLD = /\*\*/g;

export const APPLICATION_FILE = {
  POSTING: { marker: '-job-posting-', extension: '.txt' },
  RESUME: { marker: '-resume-', extension: '.pdf' },
  RESUME_SOURCE: { marker: '-resume-', extension: '.json' },
  GAPS: { marker: '-gaps-', extension: '.txt' },
  BRIEF: { marker: '-brief-', extension: '.json' },
  COVER_LETTER_PDF: { marker: '-cover-letter-', extension: '.pdf' },
  COVER_LETTER_TEXT: { marker: '-cover-letter-', extension: '.txt' },
} as const;

type ApplicationFileKind =
  (typeof APPLICATION_FILE)[keyof typeof APPLICATION_FILE];

export const findApplicationFile = <T extends { name: string }>(
  files: T[],
  { marker, extension }: ApplicationFileKind,
) =>
  files.find(
    file => file.name.includes(marker) && file.name.endsWith(extension),
  );

export const jobApplicationFileUrl = (path: string) =>
  `${API_ENDPOINTS.JOB_APPLICATIONS_FILE}?path=${encodeURIComponent(path)}`;

const fetchFile = async (path: string) => {
  const response = await fetch(jobApplicationFileUrl(path));
  if (!response.ok) throw new Error((await response.json()).error);
  return response;
};

// Letters written before the plain-text rule still carry `**bold**` markers.
export const readJobApplicationText = async (path: string) =>
  (await (await fetchFile(path)).text()).replace(MARKDOWN_BOLD, '');

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

// `2026-10-22-Capgemini-Senior-Backend-Developer` created at 11:44:03 ->
// `2026-10-22 11:44:03 Capgemini Senior Backend Developer`. The time is when
// the folder was created, so same-day applications are told apart in the order
// they are sorted. A folder without a date prefix keeps its name and uses its
// modified date.
export const parseApplicationFolder = (
  name: string,
  modified: string,
  created: string,
) => {
  const time = new Date(created).toLocaleTimeString(undefined, TIME_FORMAT);
  const match = DATED_FOLDER_PATTERN.exec(name);
  return match
    ? {
        date: match[1],
        title: `${match[1]} ${time} ${match[2].replace(/-/g, ' ')}`,
        label: match[2].replace(/-/g, ' '),
      }
    : {
        date: modified.slice(0, 10),
        title: `${modified.slice(0, 10)} ${time} ${name}`,
        label: name,
      };
};

const GAP_BULLET = /^\s*[-*•]\s+(.*\S)\s*$/;
const NO_GAPS_BULLET = /^none\.?$/i;

// The gaps file is a `- ` bullet list; a lone `- None` means no gaps.
export const parseGaps = (text: string) =>
  text
    .split('\n')
    .map(line => GAP_BULLET.exec(line)?.[1])
    .filter(
      (gap): gap is string => gap !== undefined && !NO_GAPS_BULLET.test(gap),
    );

export type Brief = {
  summary: string;
  roleDetails: {
    level: string;
    location: string;
    workMode: string;
    compensation: string;
  };
  responsibilities: string[];
  required: string[];
  niceToHave: string[];
  stack: string[];
  gaps: string[];
  redFlags: string[];
  questions: string[];
};

const text = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const list = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : [];

// The brief file is JSON written by the skill; fields it could not fill are
// empty. Null when the file is not a JSON object.
export const parseBrief = (source: string): Brief | null => {
  try {
    const data = JSON.parse(source);
    if (typeof data !== 'object' || data === null) return null;
    const details = data.roleDetails ?? {};
    return {
      summary: text(data.summary),
      roleDetails: {
        level: text(details.level),
        location: text(details.location),
        workMode: text(details.workMode),
        compensation: text(details.compensation),
      },
      responsibilities: list(data.responsibilities),
      required: list(data.required),
      niceToHave: list(data.niceToHave),
      stack: list(data.stack),
      gaps: list(data.gaps),
      redFlags: list(data.redFlags),
      questions: list(data.questions),
    };
  } catch {
    return null;
  }
};
