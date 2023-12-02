import { exec } from 'child_process';
import { PERSONAL_WEBSITE_URL } from '../../common/src';
import { SiteMonitor } from '../../../node/tools/src';

main();

async function main() {
  console.log('Backend monitor script started.');
  const status = await SiteMonitor.getSiteStatus(PERSONAL_WEBSITE_URL.BACKEND);
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
