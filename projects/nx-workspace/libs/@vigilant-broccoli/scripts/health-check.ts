/* eslint-disable-next-line @nx/enforce-module-boundaries */
import { SiteMonitor } from '../common-node/src';

const sites = [
  'https://harryliu.dev/',
  'https://vb-express.fly.dev',
  'https://vb-next-demo.vercel.app/',
];

async function main() {
  const siteMonitor = new SiteMonitor({ provider: 'resend' });
  await Promise.all(sites.map(site => siteMonitor.monitorSiteActivity(site)));
}

main();
