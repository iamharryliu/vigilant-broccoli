import { GithubService } from '@vigilant-broccoli/github-workspace';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const repositories = await GithubService.getOrgRepositories(organization);
  return Response.json(repositories);
}

export async function POST(request: Request) {
  const { organization, repoName } = await request.json();
  await GithubService.createOrgRepo(organization, repoName);
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const repo = searchParams.get('repo') as string;
  await GithubService.deleteOrgRepo(organization, repo);
  return new Response(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
}
