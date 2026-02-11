import type { GithubUserRole } from './github.consts';

export interface GithubUser {
  login: string;
  id: number;
  role?: GithubUserRole;
}
