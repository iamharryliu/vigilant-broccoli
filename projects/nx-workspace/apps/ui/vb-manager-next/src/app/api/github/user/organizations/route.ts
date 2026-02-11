import { GithubService } from '@vigilant-broccoli/github-workspace';
import { NextResponse } from 'next/server';

export async function GET() {
  const res = await GithubService.getOwnedOrganizations();
  return NextResponse.json(res);
}
