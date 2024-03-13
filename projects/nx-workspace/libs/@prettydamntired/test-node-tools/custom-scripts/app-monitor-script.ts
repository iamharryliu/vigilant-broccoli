import { SiteMonitor } from '../src/services/site-monitor/site-monitor.service';

const sites = [
  // harryliu.design
  'https://harryliu.design/',
  'https://api.harryliu.design/',
  // Vibecheck Lite
  'https://vibecheck-lite-express.fly.dev/',
  // Vibecheck
  'https://vibecheck-angular.harryliu.design/',
  'https://vibecheck-flask.harryliu.design/',
];

async function main() {
  const siteMonitor = new SiteMonitor();
  for (const site of sites) {
    await siteMonitor.monitorSiteActivity(site);
  }
  Promise.all(sites.map(siteMonitor.monitorSiteActivity));
}

main();
