export const REPO_OWNER = 'iamharryliu';
export const REPO_NAME = 'vigilant-broccoli';
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export const toRawGithubUrl = (path: string) =>
  `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`;
