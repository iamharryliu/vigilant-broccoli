import type { GithubUserRole } from './github.consts';

export interface GithubUser {
  login: string;
  id: number;
  role?: GithubUserRole;
}

export interface GithubPagesSite {
  fullName: string;
  repoUrl: string;
  pagesUrl: string;
  status: string | null;
  cname: string | null;
}
