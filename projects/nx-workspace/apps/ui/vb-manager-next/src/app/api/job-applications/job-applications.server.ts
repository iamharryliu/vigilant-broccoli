import { homedir } from 'os';
import { join, relative, resolve, sep } from 'path';

export const JOB_APPLICATIONS_ROOT = join(
  homedir(),
  'Desktop',
  'Job Applications',
);

export const PATH_PARAM = 'path';

// Resolves a root-relative path, rejecting anything (`..`, absolute paths)
// that would escape the Job Applications folder.
export const resolveJobApplicationsPath = (
  relativePath: string,
): string | null => {
  const absolutePath = resolve(JOB_APPLICATIONS_ROOT, relativePath);
  const fromRoot = relative(JOB_APPLICATIONS_ROOT, absolutePath);
  if (fromRoot.startsWith('..') || fromRoot.startsWith(sep)) return null;
  return absolutePath;
};
