// Publishes each Docker Hub repository's short description and overview from
// the pages-index image registry, so Docker Hub shows the same text as the
// pages-index Docker card and /docker/:image page. Usage:
//   tsx scripts/update-dockerhub-descriptions.ts [--dry-run] [image-slug ...]
// with DOCKERHUB_TOKEN (a personal access token with Read, Write, Delete
// scope; pushing alone needs less) and optionally DOCKERHUB_USERNAME.
import { readFileSync } from 'fs';
import { dirname, join, posix, resolve } from 'path';
import { fileURLToPath } from 'url';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '../libs/@vigilant-broccoli/common-js/src/lib/http/http.consts';
import DOCKER_IMAGE_REGISTRY from '../apps/ui/pages-index/src/app/consts/dockerImages.json' with { type: 'json' };
import PAGES_INDEX_STRINGS from '../apps/ui/pages-index/src/app/i18n/en.json' with { type: 'json' };

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const DOCKER_HUB_API = 'https://hub.docker.com/v2';
const NAMESPACE = 'iamharryliu';
const REPO_URL = 'https://github.com/iamharryliu/vigilant-broccoli';
const BLOB_BASE = `${REPO_URL}/blob/main`;
const RAW_BASE =
  'https://raw.githubusercontent.com/iamharryliu/vigilant-broccoli/main';
// Docker Hub's limits for the two fields.
const MAX_DESCRIPTION_LENGTH = 100;
const MAX_FULL_DESCRIPTION_LENGTH = 25000;
const ABSOLUTE_OR_ANCHOR = /^([a-z][a-z0-9+.-]*:|#|\/\/)/i;
// [text](target) and ![alt](target); the target ends at whitespace or ")".
const DRY_RUN_FLAG = '--dry-run';
// Images not yet migrated to the self-hosting template keep their legacy doc and skip the heading check.
const SELF_HOSTING_DOC_SUFFIX = '/docs/features/self-hosting.md';
const RUN_FROM_REGISTRY_HEADING = /^## Run from Registry$/m;
// The doc's own ToC anchors do not resolve on Docker Hub; it ends at the next "## " heading.
const TABLE_OF_CONTENTS_BLOCK = /^## Table of Contents\n[\s\S]*?(?=^## )/m;
const MARKDOWN_LINK = /(!?)\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g;

type RegistryImage = {
  slug: string;
  readmePath: string;
  descriptionKey: string;
};

const lookupString = (key: string): string => {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      PAGES_INDEX_STRINGS,
    );
  if (typeof value !== 'string') throw new Error(`Missing string ${key}`);
  return value;
};

// Relative links in a repo doc break on Docker Hub, so they point at GitHub:
// images at the raw file, everything else at the rendered blob.
const absolutizeLinks = (markdown: string, docPath: string) =>
  markdown.replace(
    MARKDOWN_LINK,
    (match, bang: string, text: string, target: string, title: string) => {
      if (ABSOLUTE_OR_ANCHOR.test(target)) return match;
      const path = posix.normalize(posix.join(posix.dirname(docPath), target));
      const base = bang ? RAW_BASE : BLOB_BASE;
      return `${bang}[${text}](${base}/${path}${title})`;
    },
  );

const buildOverview = (
  { slug, readmePath }: RegistryImage,
  summary: string,
) => {
  const doc = readFileSync(join(REPO_ROOT, readmePath), 'utf-8');
  if (
    readmePath.endsWith(SELF_HOSTING_DOC_SUFFIX) &&
    !RUN_FROM_REGISTRY_HEADING.test(doc)
  ) {
    throw new Error(
      `${slug}: ${readmePath} has no "## Run from Registry" heading`,
    );
  }
  const overview = [
    `# ${slug}`,
    summary,
    `Source: [${readmePath}](${BLOB_BASE}/${readmePath}) in [vigilant-broccoli](${REPO_URL}).`,
    absolutizeLinks(
      doc.replace(TABLE_OF_CONTENTS_BLOCK, ''),
      readmePath,
    ).replace(/^# .*\n+/, ''),
  ].join('\n\n');
  if (overview.length > MAX_FULL_DESCRIPTION_LENGTH) {
    throw new Error(
      `${slug}: overview is ${overview.length} characters, over Docker Hub's ${MAX_FULL_DESCRIPTION_LENGTH}`,
    );
  }
  return overview;
};

const login = async (username: string, token: string) => {
  const response = await fetch(`${DOCKER_HUB_API}/users/login`, {
    method: HTTP_METHOD.POST,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ username, password: token }),
  });
  if (!response.ok) {
    throw new Error(`Docker Hub login failed (${response.status})`);
  }
  return ((await response.json()) as { token: string }).token;
};

const updateRepository = async (
  jwt: string,
  slug: string,
  description: string,
  fullDescription: string,
) => {
  const response = await fetch(
    `${DOCKER_HUB_API}/repositories/${NAMESPACE}/${slug}/`,
    {
      method: HTTP_METHOD.PATCH,
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
        Authorization: `JWT ${jwt}`,
      },
      body: JSON.stringify({ description, full_description: fullDescription }),
    },
  );
  if (!response.ok) {
    throw new Error(
      `${slug}: update failed (${response.status}) ${await response.text()}`,
    );
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes(DRY_RUN_FLAG);
  const requested = new Set(args.filter(arg => arg !== DRY_RUN_FLAG));
  const images = (DOCKER_IMAGE_REGISTRY.images as RegistryImage[]).filter(
    image => !requested.size || requested.has(image.slug),
  );
  const unknown = [...requested].filter(
    slug => !images.some(image => image.slug === slug),
  );
  if (unknown.length) throw new Error(`Unknown image: ${unknown.join(', ')}`);

  const token = process.env.DOCKERHUB_TOKEN;
  if (!dryRun && !token) throw new Error('DOCKERHUB_TOKEN is not set');
  const jwt = dryRun
    ? ''
    : await login(process.env.DOCKERHUB_USERNAME || NAMESPACE, token as string);
  for (const image of images) {
    const description = lookupString(image.descriptionKey);
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `${image.slug}: description is ${description.length} characters, over Docker Hub's ${MAX_DESCRIPTION_LENGTH}`,
      );
    }
    const overview = buildOverview(image, description);
    if (dryRun) {
      console.log(
        `--- ${NAMESPACE}/${image.slug}: ${description}\n${overview}\n`,
      );
      continue;
    }
    await updateRepository(jwt, image.slug, description, overview);
    console.log(`Updated ${NAMESPACE}/${image.slug}`);
  }
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
