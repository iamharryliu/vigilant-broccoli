import { GithubService } from '@vigilant-broccoli/github-workspace';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sites = await GithubService.listPagesSites();
    return NextResponse.json({ success: true, sites });
  } catch (error) {
    console.error('Error fetching GitHub Pages sites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GitHub Pages sites' },
      { status: 500 },
    );
  }
}
