// Apps gated by Cloudflare Access or Vercel Authentication live here, not in infrastructure, so editing them does not redeploy the Fly APIs.
export const ACCESS_GATED_URL = {
  CODE_SERVER: {
    NAME: 'Code Server',
    URL: 'https://code.harryliu.dev/',
  },
  DRIVE: {
    NAME: 'Drive',
    URL: 'https://drive.harryliu.dev/',
  },
  GIT: {
    NAME: 'Git',
    URL: 'https://git.harryliu.dev/',
  },
  MOBILE_MANAGER_NEXT: {
    NAME: 'Mobile Manager Next',
    URL: 'https://manager.harryliu.dev/login',
    STAGING_URL: 'https://staging-vb-manager-next-mobile.vercel.app/login',
  },
  WEB_TERMINAL: {
    NAME: 'Web Terminal',
    URL: 'https://shell.harryliu.dev/',
  },
} as const;
