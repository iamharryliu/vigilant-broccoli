export const REPO_OWNER = 'iamharryliu';
export const REPO_NAME = 'vigilant-broccoli';
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
export const UPTIME_REPO_NAME = 'uptime';
export const UPTIME_REPO_URL = `https://github.com/${REPO_OWNER}/${UPTIME_REPO_NAME}`;

export const UPTIME_SUMMARY_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${UPTIME_REPO_NAME}/main/history/summary.json`;

export const toRawGithubUrl = (path: string) =>
  `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`;
