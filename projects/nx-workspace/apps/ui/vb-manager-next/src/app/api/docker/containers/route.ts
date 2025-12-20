import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DockerProject {
  name: string;
  state: 'running' | 'paused' | 'exited' | 'mixed';
  containerCount: number;
  services: string[];
}

interface DockerStatus {
  projects: DockerProject[];
  standaloneContainers: StandaloneContainer[];
}

interface StandaloneContainer {
  id: string;
  name: string;
  status: string;
  state: 'running' | 'paused' | 'exited' | 'created' | 'restarting' | 'removing' | 'dead';
}

// Parse Docker status string to determine container state
function parseContainerState(status: string): 'running' | 'paused' | 'exited' | 'created' | 'restarting' | 'removing' | 'dead' {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('up')) return 'running';
  if (lowerStatus.includes('paused')) return 'paused';
  if (lowerStatus.includes('exited')) return 'exited';
  if (lowerStatus.includes('created')) return 'created';
  if (lowerStatus.includes('restarting')) return 'restarting';
  if (lowerStatus.includes('removing')) return 'removing';
  if (lowerStatus.includes('dead')) return 'dead';
  return 'exited';
}

export async function GET() {
  try {
    // Check if Docker is running first - this will throw if Docker is down
    await execAsync('docker info');

    // Get list of all Docker containers with compose labels
    const { stdout: containersOutput } = await execAsync(
      'docker ps -a --format "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Label \\"com.docker.compose.project\\"}}\t{{.Label \\"com.docker.compose.service\\"}}"'
    );

    const projectMap = new Map<string, { states: Set<string>; services: Set<string>; count: number }>();
    const standaloneContainers: StandaloneContainer[] = [];

    containersOutput
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .forEach(line => {
        const parts = line.split('\t');
        const id = parts[0]?.trim() || '';
        const name = parts[1]?.trim() || '';
        const status = parts[2]?.trim() || '';
        const project = parts[3]?.trim() || '';
        const service = parts[4]?.trim() || '';
        const state = parseContainerState(status);

        // Group by compose project if it exists
        if (project) {
          if (!projectMap.has(project)) {
            projectMap.set(project, { states: new Set(), services: new Set(), count: 0 });
          }
          const projectData = projectMap.get(project)!;
          projectData.states.add(state);
          if (service) projectData.services.add(service);
          projectData.count++;
        } else {
          // Standalone container (not part of compose)
          standaloneContainers.push({
            id,
            name,
            status,
            state,
          });
        }
      });

    // Convert project map to array
    const projects: DockerProject[] = Array.from(projectMap.entries()).map(([name, data]) => {
      // Determine overall project state
      let projectState: 'running' | 'paused' | 'exited' | 'mixed' = 'exited';
      if (data.states.has('running') && data.states.size === 1) {
        projectState = 'running';
      } else if (data.states.has('paused') && data.states.size === 1) {
        projectState = 'paused';
      } else if (data.states.has('exited') && data.states.size === 1) {
        projectState = 'exited';
      } else if (data.states.size > 1) {
        projectState = 'mixed';
      }

      return {
        name,
        state: projectState,
        containerCount: data.count,
        services: Array.from(data.services).sort(),
      };
    });

    const dockerStatus: DockerStatus = {
      projects,
      standaloneContainers,
    };

    return NextResponse.json(dockerStatus);
  } catch (error) {
    console.error('Error fetching Docker container status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Docker container status' },
      { status: 500 }
    );
  }
}
