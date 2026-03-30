const BASE_URL = 'https://cloud8skate.com';
const SANITY_API_URL =
  'https://akt6kw0u.apicdn.sanity.io/v2025-03-08/data/query/production';

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/calendar', changefreq: 'daily', priority: '0.9' },
  { path: '/faq', changefreq: 'monthly', priority: '0.8' },
  { path: '/more', changefreq: 'monthly', priority: '0.8' },
  { path: '/playlists', changefreq: 'monthly', priority: '0.7' },
  { path: '/skate-terminology', changefreq: 'monthly', priority: '0.7' },
  { path: '/gallery', changefreq: 'weekly', priority: '0.8' },
];

const fetchAlbumSlugs = async () => {
  const query = `*[_type == "galleryAlbum"] | order(date desc){ "slug": slug.current, "updatedAt": _updatedAt }`;
  const url = `${SANITY_API_URL}?query=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.warn(
      `Sanity API returned ${response.status}, skipping album routes`,
    );
    return [];
  }

  const data = await response.json();
  return data.result ?? [];
};

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) =>
  `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const generateSitemap = async () => {
  const today = new Date().toISOString().split('T')[0];

  const staticEntries = STATIC_ROUTES.map(route =>
    buildUrlEntry({
      loc: `${BASE_URL}${route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    }),
  );

  const albums = await fetchAlbumSlugs();
  const albumEntries = albums.map(album =>
    buildUrlEntry({
      loc: `${BASE_URL}/gallery/${album.slug}`,
      lastmod: album.updatedAt?.split('T')[0] ?? today,
      changefreq: 'monthly',
      priority: '0.6',
    }),
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...albumEntries].join('\n')}
</urlset>
`;

  return sitemap;
};

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const OUTPUT_PATH = resolve(
  import.meta.dirname,
  '../../../../../../dist/apps/ui/cloud-8-skate-angular/browser/sitemap.xml',
);

const run = async () => {
  const sitemap = await generateSitemap();

  const dir = dirname(OUTPUT_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');
  console.log(`Sitemap generated at ${OUTPUT_PATH}`);
  console.log(`  Static routes: ${STATIC_ROUTES.length}`);
  const albums = sitemap.match(/<url>/g)?.length ?? 0;
  console.log(`  Total URLs: ${albums}`);
};

run().catch(err => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
