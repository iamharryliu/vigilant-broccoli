export const NPM_SCOPE = '@vigilant-broccoli';

export const NPM_PACKAGE_SLUGS = [
  'react-lib',
  'employee-handler',
  'slack-workspace',
  'slackbots',
];

export const toPackageName = (slug: string) => `${NPM_SCOPE}/${slug}`;

export const toRegistryUrl = (slug: string) =>
  `https://registry.npmjs.org/${toPackageName(slug)}`;

export const toNpmPackageUrl = (slug: string) =>
  `https://www.npmjs.com/package/${toPackageName(slug)}`;

export const isKnownNpmPackage = (slug?: string) =>
  Boolean(slug && NPM_PACKAGE_SLUGS.includes(slug));
