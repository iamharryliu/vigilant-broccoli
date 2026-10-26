import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const OBJECT_URL_REVOKE_DELAY_MS = 60_000;
const DATED_FOLDER_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
const POSTING_FILE_MARKER = '-job-posting-';
const COPYABLE_EXTENSIONS = ['txt', 'md', 'json'];
const MARKDOWN_BOLD = /\*\*/g;

const fetchFile = async (path: string) => {
  const response = await authFetch(
    `${API_ENDPOINTS.JOB_APPLICATIONS_FILE}?path=${encodeURIComponent(path)}`,
  );
  if (!response.ok) throw new Error((await response.json()).error);
  return response;
};

// The file route needs the bearer token, so a plain link cannot open it.
export const openJobApplicationFile = async (path: string) => {
  const preview = window.open('', '_blank');
  try {
    const url = URL.createObjectURL(await (await fetchFile(path)).blob());
    if (preview) preview.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
  } catch (error) {
    preview?.close();
    throw error;
  }
};

// Letters written before the plain-text rule still carry `**bold**` markers.
export const readJobApplicationText = async (path: string) =>
  (await (await fetchFile(path)).text()).replace(MARKDOWN_BOLD, '');

export const isCopyableFile = (name: string) =>
  COPYABLE_EXTENSIONS.includes((name.split('.').pop() ?? '').toLowerCase());

export const isPostingFile = (name: string) =>
  name.includes(POSTING_FILE_MARKER) && name.endsWith('.txt');

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
      }
    : {
        date: modified.slice(0, 10),
        title: `${modified.slice(0, 10)} ${time} ${name}`,
      };
};
