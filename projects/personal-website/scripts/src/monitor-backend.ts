import { SiteMonitor } from '@prettydamntired/node-tools';
import { exec } from 'child_process';

main();

async function main() {
  console.log('Backend monitor script started.');
  const status = await SiteMonitor.getSiteStatus(
    'https://harryliu-design-express.fly.dev/',
  );
  if (!status) {
    restartServer();
  }
  console.log('Backend monitor script completed.');
}

function restartServer() {
  console.log('Server is down. Attempting to restart.');
  const command = 'fly deploy';
  exec(
    command,
    { cwd: '/Users/hliu/vigilant-broccoli/projects/personal-website/backend' },
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`Site successfully restarted.`);
    },
  );
}
