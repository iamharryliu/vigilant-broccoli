import { FastifyPluginAsync } from 'fastify';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { listFiles, readFile } from '../libs/storage-service.client';

const CACHE_CONTROL_HEADER = 'Cache-Control';
const ALBUMS_CACHE_CONTROL = 'public, max-age=60';
const PHOTO_CACHE_CONTROL = 'public, max-age=86400';
const NO_STORE = 'no-store';
const BUCKET_PARAMS = { provider: 'cloudflare-r2' };
const PHOTOGRAPHY_PREFIX = 'photography/';
const KEY_SEPARATOR = '/';
const PARENT_SEGMENT = '..';
const PHOTO_PATH_SEGMENTS = 2;
const WILDCARD_PARAM = '*';
const ERROR_UNAVAILABLE = 'Photography is temporarily unavailable';
const ERROR_NOT_FOUND = 'Photo not found';

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

interface BucketFile {
  name: string;
  updatedAt?: string;
}

const contentTypeOf = (fileName: string) =>
  IMAGE_CONTENT_TYPES[fileName.split('.').pop()?.toLowerCase() ?? ''];

const toTitle = (slug: string) =>
  slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');

// Keys are photography/<album>/<file>; anything shallower, deeper or not an
// image is ignored, so stray files in the folder never reach the public site.
const toAlbums = (files: BucketFile[]) => {
  const byAlbum = new Map<string, { path: string; updatedAt: string }[]>();
  for (const { name, updatedAt } of files) {
    if (!name.startsWith(PHOTOGRAPHY_PREFIX)) continue;
    const segments = name.slice(PHOTOGRAPHY_PREFIX.length).split(KEY_SEPARATOR);
    if (
      segments.length !== PHOTO_PATH_SEGMENTS ||
      !contentTypeOf(segments[1])
    ) {
      continue;
    }
    const photos = byAlbum.get(segments[0]) ?? [];
    photos.push({
      path: segments.join(KEY_SEPARATOR),
      updatedAt: updatedAt ?? '',
    });
    byAlbum.set(segments[0], photos);
  }
  return [...byAlbum.entries()]
    .map(([slug, photos]) => ({
      slug,
      title: toTitle(slug),
      updatedAt: photos.reduce(
        (latest, { updatedAt }) => (updatedAt > latest ? updatedAt : latest),
        '',
      ),
      photos: photos
        .map(({ path }) => ({ path }))
        .sort((a, b) =>
          a.path.localeCompare(b.path, undefined, { numeric: true }),
        ),
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ slug, title, photos }) => ({ slug, title, photos }));
};

const publicPhotographyRoutes: FastifyPluginAsync = async app => {
  app.get('/albums', async (_req, reply) => {
    try {
      const files = (await listFiles(
        new URLSearchParams(BUCKET_PARAMS),
      )) as BucketFile[];
      reply.header(CACHE_CONTROL_HEADER, ALBUMS_CACHE_CONTROL);
      return { albums: toAlbums(files) };
    } catch (error) {
      console.error('Failed to load public photography albums:', error);
      reply.header(CACHE_CONTROL_HEADER, NO_STORE);
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: ERROR_UNAVAILABLE });
    }
  });

  // Serves only photography/<album>/<image> keys, so the rest of the shared
  // bucket stays unreachable however the path is crafted.
  app.get('/photos/*', async (req, reply) => {
    const path = (req.params as Record<string, string>)[WILDCARD_PARAM];
    const segments = path.split(KEY_SEPARATOR);
    const contentType = contentTypeOf(segments[segments.length - 1]);
    if (
      segments.length !== PHOTO_PATH_SEGMENTS ||
      segments.some(segment => !segment || segment === PARENT_SEGMENT) ||
      !contentType
    ) {
      return reply
        .code(HTTP_STATUS_CODES.INVALID_PATH)
        .send({ error: ERROR_NOT_FOUND });
    }
    try {
      const buffer = await readFile(
        `${PHOTOGRAPHY_PREFIX}${path}`,
        new URLSearchParams(BUCKET_PARAMS),
      );
      reply.header(CONTENT_TYPE_HEADER, contentType);
      reply.header(CACHE_CONTROL_HEADER, PHOTO_CACHE_CONTROL);
      return reply.send(buffer);
    } catch (error) {
      console.error('Failed to load public photograph:', error);
      reply.header(CACHE_CONTROL_HEADER, NO_STORE);
      return reply
        .code(HTTP_STATUS_CODES.INVALID_PATH)
        .send({ error: ERROR_NOT_FOUND });
    }
  });
};

export default publicPhotographyRoutes;
