import { SiteMonitor } from '@prettydamntired/node-tools';

const sites = [
  'https://harryliu.design/',
  'https://vigilant-broccoli.pages.dev/',
  'https://old-wind-7127.fly.dev/',
];

main();
async function main() {
  await Promise.all(sites.map(SiteMonitor.monitorSiteActivity));
}
