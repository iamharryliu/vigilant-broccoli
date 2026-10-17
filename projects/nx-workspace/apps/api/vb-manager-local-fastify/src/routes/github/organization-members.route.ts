import { GithubService } from '@vigilant-broccoli/github-workspace';

export async function POST(request: Request) {
  const { organization, username } = await request.json();
  await GithubService.addOrgMember(organization, username);
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const username = searchParams.get('username') as string;
  await GithubService.removeOrgMember(organization, username);
  return Response.json({ success: true });
}
