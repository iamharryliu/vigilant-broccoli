import { GithubService } from '@vigilant-broccoli/github-workspace';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { organization, username } = await request.json();
  await GithubService.addOrgMember(organization, username);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const username = searchParams.get('username') as string;
  await GithubService.removeOrgMember(organization, username);
  return NextResponse.json({ success: true });
}
