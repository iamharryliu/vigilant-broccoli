import {
  GithubService,
  GithubUtils,
} from '@vigilant-broccoli/github-workspace';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const allTeams = await GithubService.getTeamsData(organization);
  const tree = await GithubUtils.buildTeamTree(organization, allTeams);
  return Response.json(tree);
}

export async function POST(request: Request) {
  const { organization, teamName } = await request.json();
  await GithubService.createOrgTeam(organization, teamName);
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const team = searchParams.get('team') as string;
  await GithubService.deleteTeam(organization, team);
  return new Response(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
}
