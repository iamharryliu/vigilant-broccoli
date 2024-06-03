import { SiteMonitor } from '../src/services/site-monitor/site-monitor.service';

const sites = process.env.SITES?.split(',') as string[];

async function main() {
  const siteMonitor = new SiteMonitor();
  Promise.all(sites.map(site => siteMonitor.monitorSiteActivity(site)));
}

main();
