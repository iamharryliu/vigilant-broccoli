import { GithubService } from '@vigilant-broccoli/github-workspace';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const orgData = await GithubService.getOrgData(organization);
  return NextResponse.json({
    organizationName: organization,
    avatar_url: orgData.avatar_url,
  });
}
