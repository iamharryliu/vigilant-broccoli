import { runCliJson } from '../cli/cli.utils';
import { VERCEL_CLI, VercelCommand } from './vercel.consts';

export interface VercelProject {
  id: string;
  name: string;
  url: string | null;
}

export interface VercelProjectList {
  projects: VercelProject[];
  org: string | null;
}

interface VercelProjectJson {
  id: string;
  name: string;
  latestProductionUrl?: string;
}

// `vercel project ls` has shipped both a bare array and a `{ projects }` envelope.
type VercelProjectsResponse =
  | VercelProjectJson[]
  | { projects: VercelProjectJson[] };

interface VercelTeamsResponse {
  teams?: { slug: string; current: boolean }[];
}

const listProjects = async (): Promise<VercelProjectList> => {
  const [projectsResponse, teamsResponse] = await Promise.all([
    runCliJson<VercelProjectsResponse>(VERCEL_CLI, VercelCommand.listProjects),
    runCliJson<VercelTeamsResponse>(VERCEL_CLI, VercelCommand.listTeams),
  ]);

  const rawProjects = Array.isArray(projectsResponse)
    ? projectsResponse
    : projectsResponse.projects;

  return {
    projects: rawProjects.map(project => ({
      id: project.id,
      name: project.name,
      url: project.latestProductionUrl ?? null,
    })),
    org: teamsResponse.teams?.find(team => team.current)?.slug ?? null,
  };
};

export const VercelService = {
  listProjects,
};
