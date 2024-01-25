import { SiteMonitor } from '@prettydamntired/node-tools';

const sites = [
  'https://harryliu.design',
  'https://vigilant-broccoli.pages.dev',
  'https://vibecheck-lite-express.fly.dev/',
  'https://harryliu-design-express.fly.dev/',
];

main();
async function main() {
  console.log('Site monitor script started.');
  await Promise.all(sites.map(SiteMonitor.monitorSiteActivity));
  console.log('Site monitor script completed.');
}
