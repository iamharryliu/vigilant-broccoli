import { FastifyInstance } from 'fastify';
import { SiteMonitor } from '@prettydamntired/test-node-tools';

const sites = [
  'https://harryliu.design/',
  'https://vigilant-broccoli.pages.dev/',
  'https://harryliu-design-express.fly.dev/',
  'https://vibecheck-lite-express.fly.dev/',
];

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async () => {
    const res = {};
    await Promise.all(sites.map(SiteMonitor.getSiteStatus)).then(statuses => {
      for (let i = 0; i < sites.length; i++) {
        res[sites[i]] = statuses[i];
      }
    });
    return { data: res };
  });

  fastify.get('/monitor-sites', async () => {
    const sites = [
      'https://harryliu.design/',
      'https://harryliu-design-express.fly.dev/',
      'https://vibecheck-lite-express.fly.dev/',
    ];
    const siteMonitor = new SiteMonitor();
    for (const site of sites) {
      await siteMonitor.monitorSiteActivity(site);
    }
    // Promise.all(sites.map(siteMonitor.monitorSiteActivity));
    return {};
  });
}
