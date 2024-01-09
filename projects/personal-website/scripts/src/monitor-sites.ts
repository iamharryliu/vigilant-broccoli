import { SiteMonitor } from '../../../node/tools/src';

const sites = [
  'https://harryliu-design-express.fly.dev/',
  'https://vigilant-broccoli.pages.dev',
  'https://harryliu.design',
];

main();
async function main() {
  console.log('Site monitor script started.');
  await Promise.all(sites.map(SiteMonitor.monitorSiteActivity));
  console.log('Site monitor script completed.');
}
