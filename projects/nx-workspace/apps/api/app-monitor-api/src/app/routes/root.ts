import { FastifyInstance } from 'fastify';
import { SiteMonitor } from '@prettydamntired/test-node-tools';

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
}
