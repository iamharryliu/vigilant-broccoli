// Vercel apps gated by Cloudflare Access in every environment, which also
// verify the Access JWT themselves for their *.vercel.app aliases. Vercel
// Authentication would only add a second sign-in, so deploy-vercel.ts and
// vercel-domains.ts skip it for these. Keys match the Nx project and the
// Terraform domain map key.
export const CLOUDFLARE_ACCESS_GATED_VERCEL_APPS = new Set(['chat']);

const ENVIRONMENT_PREFIX = /^(staging|production|demo)-/;

export const isCloudflareAccessGatedVercelProject = (projectName: string) =>
  CLOUDFLARE_ACCESS_GATED_VERCEL_APPS.has(
    projectName.replace(ENVIRONMENT_PREFIX, ''),
  );
