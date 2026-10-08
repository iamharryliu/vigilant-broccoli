import { GithubService } from '@vigilant-broccoli/github-workspace';

export async function GET() {
  const res = await GithubService.getOwnedOrganizations();
  return Response.json(res);
}
