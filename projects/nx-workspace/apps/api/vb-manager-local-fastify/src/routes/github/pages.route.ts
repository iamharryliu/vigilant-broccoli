import { GithubService } from '@vigilant-broccoli/github-workspace';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createTtlCache } from '../../libs/ttl-cache.utils';

const PAGES_CACHE_TTL_MS = 5 * 60 * 1000;

const getCachedPagesSites = createTtlCache(PAGES_CACHE_TTL_MS, () =>
  GithubService.listPagesSites(),
);

export async function GET() {
  try {
    const sites = await getCachedPagesSites();
    return Response.json({ success: true, sites });
  } catch (error) {
    console.error('Error fetching GitHub Pages sites:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch GitHub Pages sites' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
