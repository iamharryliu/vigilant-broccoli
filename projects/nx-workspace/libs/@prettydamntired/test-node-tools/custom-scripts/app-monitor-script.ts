import { SiteMonitor } from '../src/services/site-monitor/site-monitor.service';

const sites = [
  'https://harryliu.design/',
  'https://api.harryliu.design/',
  'https://vibecheck-lite-express.fly.dev/',
  'https://vibecheck-angular.harryliu.design/',
  'https://vibecheck-flask.harryliu.design/',
];

async function main() {
  const siteMonitor = new SiteMonitor();
  Promise.all(sites.map(site => siteMonitor.monitorSiteActivity(site)));
}

main();
