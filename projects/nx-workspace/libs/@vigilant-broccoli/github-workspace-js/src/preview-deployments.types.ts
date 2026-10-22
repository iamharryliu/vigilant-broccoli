import { PreviewDeploymentsError } from './preview-deployments.consts';

export type GithubDeployment = {
  id: number;
  environment: string;
  created_at: string;
  payload: unknown;
};

export type GithubPullRequest = {
  number: number;
  title: string;
  html_url: string;
  user: { login: string } | null;
  head: { ref: string };
};

export type PreviewDeploymentPayload = {
  prNumber: number;
  app: string;
  project: string;
  aliasUrl: string;
  buildUrl: string;
  commit: string;
};

export type PreviewDeploymentApp = Pick<
  PreviewDeploymentPayload,
  'app' | 'aliasUrl' | 'buildUrl' | 'commit'
> & {
  deployedAt: string;
};

export type PreviewDeploymentPullRequest = {
  number: number;
  title: string;
  url: string;
  author: string | null;
  headRef: string;
  apps: PreviewDeploymentApp[];
};

export type PreviewDeploymentsResult =
  | {
      ok: true;
      pullRequests: PreviewDeploymentPullRequest[];
      fetchedAt: string;
    }
  | {
      ok: false;
      error: PreviewDeploymentsError;
      rateLimitResetAt: string | null;
    };
