export const VERCEL_CLI = 'npx';

export const VercelCommand = {
  listProjects: ['vercel', 'project', 'ls', '--format=json'],
  listTeams: ['vercel', 'teams', 'ls', '--format=json'],
} as const;
