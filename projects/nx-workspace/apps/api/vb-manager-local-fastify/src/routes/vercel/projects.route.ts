import { VercelService } from '@vigilant-broccoli/devops-cli';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function GET() {
  try {
    const { projects, org } = await VercelService.listProjects();
    return Response.json({ success: true, projects, org });
  } catch (error) {
    console.error('Error fetching Vercel projects:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch Vercel projects' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
