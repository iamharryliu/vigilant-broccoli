import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DockerProject {
  name: string;
  state: 'running' | 'paused' | 'exited' | 'mixed';
  containerCount: number;
  services: ServiceInfo[];
}

interface ServiceInfo {
  name: string;
  ports: string;
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
  ports: string;
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

// Extract only local port numbers from Docker ports string
// Example input: "0.0.0.0:8080->80/tcp, :::8080->80/tcp"
// Example output: "8080"
function extractLocalPorts(portsString: string): string {
  if (!portsString) return '';

  const portMatches = portsString.match(/0\.0\.0\.0:(\d+)->/g);
  if (!portMatches) return '';

  const ports = portMatches.map(match => {
    const portMatch = match.match(/0\.0\.0\.0:(\d+)->/);
    return portMatch ? portMatch[1] : '';
  }).filter(port => port);

  // Remove duplicates and join with comma
  return [...new Set(ports)].join(', ');
}

export async function GET() {
  try {
    // Check if Docker is running first - this will throw if Docker is down
    await execAsync('docker info');

    // Get list of all Docker containers with compose labels and ports
    const { stdout: containersOutput } = await execAsync(
      'docker ps -a --format "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Label \\"com.docker.compose.project\\"}}\t{{.Label \\"com.docker.compose.service\\"}}\t{{.Ports}}"'
    );

    const projectMap = new Map<string, { states: Set<string>; services: Map<string, string>; count: number }>();
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
        const portsRaw = parts[5]?.trim() || '';
        const state = parseContainerState(status);
        const ports = extractLocalPorts(portsRaw);

        // Group by compose project if it exists
        if (project) {
          if (!projectMap.has(project)) {
            projectMap.set(project, { states: new Set(), services: new Map(), count: 0 });
          }
          const projectData = projectMap.get(project)!;
          projectData.states.add(state);
          if (service) projectData.services.set(service, ports);
          projectData.count++;
        } else {
          // Standalone container (not part of compose)
          standaloneContainers.push({
            id,
            name,
            status,
            state,
            ports,
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
        services: Array.from(data.services.entries())
          .map(([name, ports]) => ({ name, ports }))
          .sort((a, b) => a.name.localeCompare(b.name)),
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
