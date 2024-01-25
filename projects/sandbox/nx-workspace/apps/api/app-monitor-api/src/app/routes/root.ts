import { FastifyInstance } from 'fastify';

import { SiteMonitor } from '@prettydamntired/node-tools';

const sites = [
  'https://harryliu.design',
  'https://vigilant-broccoli.pages.dev',
  'https://harryliu-design-express.fly.dev/',
  'https://vibecheck-lite-express.fly.dev/',
];

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async () => {
    let res = [];
    await Promise.all(sites.map(SiteMonitor.getSiteStatus)).then(
      (statuses) => (res = sites.map((site, i) => [site, statuses[i]]))
    );
    return { data: res };
  });
}
