import { GithubService } from '@vigilant-broccoli/github-workspace';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const [orgData, role] = await Promise.all([
    GithubService.getOrgData(organization),
    GithubService.getOrgMembershipRole(organization),
  ]);
  return NextResponse.json({
    organizationName: organization,
    avatar_url: orgData.avatar_url,
    isOrgAdmin: role === 'admin',
    repoCount: orgData.public_repos + orgData.total_private_repos,
  });
}
