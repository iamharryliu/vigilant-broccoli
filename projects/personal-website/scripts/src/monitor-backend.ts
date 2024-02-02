import { SiteMonitor, logger } from '@prettydamntired/test-node-tools';
import { exec } from 'child_process';

main();

async function main() {
  logger.info('Backend monitor script started.');
  const status = await SiteMonitor.getSiteStatus(
    'https://harryliu-design-express.fly.dev/',
  );
  if (!status) {
    restartServer();
  }
  logger.info('Backend monitor script completed.');
}

function restartServer() {
  logger.info('Server is down. Attempting to restart.');
  exec(
    'fly deploy',
    { cwd: '/Users/hliu/vigilant-broccoli/projects/personal-website/backend' },
    (error, stdout, stderr) => {
      if (error) {
        logger.info(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.info(`stderr: ${stderr}`);
        return;
      }
      logger.info(`stdout: ${stdout}`);
      logger.info(`Site successfully restarted.`);
    },
  );
}
