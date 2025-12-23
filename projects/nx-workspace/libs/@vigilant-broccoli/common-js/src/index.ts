export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
} as const;

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE];

export const OPEN_TYPE = {
  BROWSER: 'browser',
  MAC_APPLICATION: 'mac_application',
  FILE_SYSTEM: 'file_system',
  VSCODE: 'vscode',
} as const;

export type OpenType = (typeof OPEN_TYPE)[keyof typeof OPEN_TYPE];

// LLM
export * from './lib/llm/llm.consts';
export * from './lib/llm/llm.types';

// JSON Placeholder
export * from './lib/jsonplaceholder/jsonplaceholder.services';
export * from './lib/jsonplaceholder/jsonplaceholder.types';

// Utils
export * from './lib/utils/env.utils';
export * from './lib/utils/string.utils';

export type GithubOrganizationTeamStructure = {
  organizationName: string;
  teams: GithubTeam[];
};

export const TEAM_ROLE = {
  MEMBER: 'member',
  MAINTAINER: 'maintainer',
  ADMIN: 'admin',
} as const;

export type TeamRole = (typeof TEAM_ROLE)[keyof typeof TEAM_ROLE];

export type GithubTeamMember = {
  username: string;
  role: TeamRole;
};
export const REPOSITORY_PERMISSION = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
} as const;

export type RepositoryPermission =
  (typeof REPOSITORY_PERMISSION)[keyof typeof REPOSITORY_PERMISSION];

type GithubTeamRepository = {
  name: string;
  permission: RepositoryPermission;
};

export type GithubTeam = {
  name: string;
  members: GithubTeamMember[];
  repositories: GithubTeamRepository[];
  teams: GithubTeam[];
};

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(blobUrl);
}