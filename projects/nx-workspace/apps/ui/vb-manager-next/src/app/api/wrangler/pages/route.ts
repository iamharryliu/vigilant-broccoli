import { WranglerService } from '@vigilant-broccoli/common-node';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { projectName } = await request.json();
    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing projectName' },
        { status: 400 },
      );
    }

    await WranglerService.deletePagesProject(projectName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Wrangler pages project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 },
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
      { status: 500 },
    );
  }
}
