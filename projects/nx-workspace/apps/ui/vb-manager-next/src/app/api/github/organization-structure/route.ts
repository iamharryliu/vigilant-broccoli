import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { GithubService } from '@vigilant-broccoli/github-workspace';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const res = await GithubService.getOrgStructure(organization);
  FileSystemUtils.writeJSON(`./github-configurations/${organization}`, res);
  return NextResponse.json(res);
}
