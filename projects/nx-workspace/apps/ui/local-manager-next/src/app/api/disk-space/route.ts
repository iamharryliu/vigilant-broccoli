import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const { stdout: dfOutput } = await execAsync('df -h /');
  const [, dataLine] = dfOutput.trim().split('\n');
  const [filesystem, size, used, available, capacity, mounted] =
    dataLine.split(/\s+/);

  return Response.json({
    filesystem,
    size,
    used,
    available,
    capacity,
    mounted,
  });
}
