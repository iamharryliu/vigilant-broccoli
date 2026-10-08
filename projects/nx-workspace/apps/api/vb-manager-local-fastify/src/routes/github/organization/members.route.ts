import { GithubService } from '@vigilant-broccoli/github-workspace';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const members = await GithubService.getOrgMembers(organization);
  return Response.json(members);
}
