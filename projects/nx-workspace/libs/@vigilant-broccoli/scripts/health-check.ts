/* eslint-disable @nx/enforce-module-boundaries */

import { TODO_SITE } from '../../@prettydamntired/common-lib/src';
import { SiteMonitor } from '../../@prettydamntired/test-node-tools/src';

const sites = [
  'https://harryliu.design/',
  'https://api.harryliu.design/',
  'https://vibecheck-lite-express.fly.dev/',
  'https://vibecheck-angular.harryliu.design/',
  'https://vibecheck-flask.harryliu.design/',
  ...Object.values(TODO_SITE),
];

async function main() {
  const siteMonitor = new SiteMonitor();
  Promise.all(sites.map(site => siteMonitor.monitorSiteActivity(site)));
}

main();
