/* eslint-disable @nx/enforce-module-boundaries */
import { SiteMonitor } from '../../@prettydamntired/test-node-tools/src';
import { TODO_SITE } from '../../@prettydamntired/todo-lib/src';

const sites = [
  'https://harryliu.dev/',
  'https://api.harryliu.dev/',
  'https://vibecheck-lite-express.fly.dev/',
  'https://vibecheck-angular.harryliu.dev/',
  'https://vibecheck-flask.harryliu.dev/',
  ...Object.values(TODO_SITE),
];

async function main() {
  const siteMonitor = new SiteMonitor();
  Promise.all(sites.map(site => siteMonitor.monitorSiteActivity(site)));
}

main();
