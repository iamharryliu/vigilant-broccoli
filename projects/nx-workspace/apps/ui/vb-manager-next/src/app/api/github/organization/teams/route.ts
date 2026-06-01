import {
  GithubService,
  GithubUtils,
} from '@vigilant-broccoli/github-workspace';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const allTeams = await GithubService.getTeamsData(organization);
  const tree = await GithubUtils.buildTeamTree(organization, allTeams);
  return NextResponse.json(tree);
}

export async function POST(request: NextRequest) {
  const { organization, teamName } = await request.json();
  await GithubService.createOrgTeam(organization, teamName);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const team = searchParams.get('team') as string;
  await GithubService.deleteTeam(organization, team);
  return new NextResponse(null, { status: 204 });
}
