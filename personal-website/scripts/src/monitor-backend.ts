import { SiteMonitor } from '@prettydamntired/node-tools';
import { exec } from 'child_process';
const site = 'https://old-wind-7127.fly.dev/';

main();

async function main() {
  const status = await SiteMonitor.getSiteStatus(site);
  if (!status) {
    restartServer();
  }
}

function restartServer() {
  console.log('Server is down. Attempting to restart.');
  const command = 'fly deploy';
  exec(
    command,
    { cwd: '/Users/hliu/vigilant-broccoli/personal-website/backend' },
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
