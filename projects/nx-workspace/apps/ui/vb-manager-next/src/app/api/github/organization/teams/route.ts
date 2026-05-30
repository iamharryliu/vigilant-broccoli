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
