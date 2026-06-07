import { GithubService } from '@vigilant-broccoli/github-workspace';
import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const repositories = await GithubService.getOrgRepositories(organization);
  return NextResponse.json(repositories);
}

export async function POST(request: NextRequest) {
  const { organization, repoName } = await request.json();
  await GithubService.createOrgRepo(organization, repoName);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organization = searchParams.get('organization') as string;
  const repo = searchParams.get('repo') as string;
  await GithubService.deleteOrgRepo(organization, repo);
  return new NextResponse(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
}
