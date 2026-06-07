import { WranglerService } from '@vigilant-broccoli/ci';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { projectName } = await request.json();
    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing projectName' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await WranglerService.deletePagesProject(projectName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Wrangler pages project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function GET() {
  try {
    const projects = await WranglerService.listPagesProjects();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Error fetching Wrangler pages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Wrangler pages',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
