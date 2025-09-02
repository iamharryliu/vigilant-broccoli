import { GithubService } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const res = await GithubService.getOrgStructure(organization);
  return NextResponse.json(res);
}
