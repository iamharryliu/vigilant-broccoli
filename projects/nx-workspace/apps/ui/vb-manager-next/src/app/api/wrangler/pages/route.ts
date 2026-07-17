import { WranglerService } from '@vigilant-broccoli/ci';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { NextResponse } from 'next/server';

const DELETION_STATUS = {
  DELETING: 'deleting',
  DONE: 'done',
  ERROR: 'error',
} as const;

type DeletionState =
  | { status: typeof DELETION_STATUS.DELETING }
  | { status: typeof DELETION_STATUS.DONE }
  | { status: typeof DELETION_STATUS.ERROR; error: string };

const deletionStatusByProject = new Map<string, DeletionState>();

export async function DELETE(request: Request) {
  const { projectName } = await request.json();
  if (!projectName || typeof projectName !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing projectName' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  deletionStatusByProject.set(projectName, {
    status: DELETION_STATUS.DELETING,
  });

  WranglerService.deletePagesProject(projectName)
    .then(() => {
      deletionStatusByProject.set(projectName, {
        status: DELETION_STATUS.DONE,
      });
    })
    .catch(error => {
      console.error('Error deleting Wrangler pages project:', error);
      deletionStatusByProject.set(projectName, {
        status: DELETION_STATUS.ERROR,
        error: 'Failed to delete project',
      });
    });

  return NextResponse.json({ success: true, status: DELETION_STATUS.DELETING });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusProjectName = searchParams.get('status');

  if (statusProjectName) {
    const state = deletionStatusByProject.get(statusProjectName);
    if (!state) {
      return NextResponse.json(
        { success: false, error: 'No deletion in progress for project' },
        { status: HTTP_STATUS_CODES.INVALID_PATH },
      );
    }
    if (state.status === DELETION_STATUS.DONE) {
      deletionStatusByProject.delete(statusProjectName);
    }
    return NextResponse.json({ success: true, ...state });
  }

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
