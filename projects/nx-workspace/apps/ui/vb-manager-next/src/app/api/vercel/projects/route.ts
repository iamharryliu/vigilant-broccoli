import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { VercelCommand } from '@vigilant-broccoli/ci';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const execAsync = promisify(exec);

interface VercelProject {
  name: string;
  id: string;
  latestProductionUrl?: string;
}

export async function GET() {
  try {
    const [projectsOut, teamsOut] = await Promise.all([
      execAsync(VercelCommand.listProjects),
      execAsync(VercelCommand.listTeams),
    ]);

    const parsedProjects = JSON.parse(projectsOut.stdout);
    const raw: VercelProject[] = parsedProjects.projects ?? parsedProjects;
    const projects = raw.map(p => ({
      id: p.id,
      name: p.name,
      url: p.latestProductionUrl ?? null,
    }));

    const parsedTeams = JSON.parse(teamsOut.stdout);
    const org =
      parsedTeams.teams?.find((t: { current: boolean }) => t.current)?.slug ??
      null;

    return NextResponse.json({ success: true, projects, org });
  } catch (error) {
    console.error('Error fetching Vercel projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Vercel projects' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
