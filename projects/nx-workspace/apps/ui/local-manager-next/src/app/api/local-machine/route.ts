import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CACHE_DURATION = 5 * 60 * 1000;
const DOWNLOAD_REGEX = /Download:\s+([\d.]+\s+\w+)/;
const UPLOAD_REGEX = /Upload:\s+([\d.]+\s+\w+)/;
const NOT_AVAILABLE = 'N/A';

let cachedSpeeds = {
  download: NOT_AVAILABLE,
  upload: NOT_AVAILABLE,
  timestamp: 0,
};

export async function GET() {
  const { stdout: dfOutput } = await execAsync('df -h /');
  const [, dataLine] = dfOutput.trim().split('\n');
  const [filesystem, size, used, available, capacity, mounted] =
    dataLine.split(/\s+/);

  const now = Date.now();

  if (now - cachedSpeeds.timestamp >= CACHE_DURATION) {
    try {
      const { stdout: speedtestOutput } = await execAsync('speedtest');

      cachedSpeeds = {
        download: speedtestOutput.match(DOWNLOAD_REGEX)?.[1] ?? NOT_AVAILABLE,
        upload: speedtestOutput.match(UPLOAD_REGEX)?.[1] ?? NOT_AVAILABLE,
        timestamp: now,
      };
    } catch (error) {
      console.error('Speedtest error:', error);
    }
  }

  return Response.json({
    filesystem,
    size,
    used,
    available,
    capacity,
    mounted,
    downloadSpeed: cachedSpeeds.download,
    uploadSpeed: cachedSpeeds.upload,
  });
}
