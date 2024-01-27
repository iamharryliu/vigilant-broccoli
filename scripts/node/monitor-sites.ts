import { SiteMonitor } from '@prettydamntired/test-node-tools';

const sites = [
  'https://harryliu.design',
  'https://vigilant-broccoli.pages.dev',
  'https://vibecheck-lite-express.fly.dev/',
  'https://harryliu-design-express.fly.dev/',
];
const siteMonitor = new SiteMonitor();

main();
async function main() {
  console.log('Site monitor script started.');
  Promise.all(sites.map(siteMonitor.monitorSiteActivity));
  console.log('Site monitor script completed.');
}
