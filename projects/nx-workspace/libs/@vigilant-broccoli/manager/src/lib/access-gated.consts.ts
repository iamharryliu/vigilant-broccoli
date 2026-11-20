// Apps gated by Cloudflare Access or Vercel Authentication live here, not in infrastructure, so editing them does not redeploy the Fly APIs.
export const ACCESS_GATED_URL = {
  CHAT: {
    NAME: 'Chat',
    URL: 'https://chat.harryliu.dev/',
    STAGING_URL: 'https://staging-chat.harryliu.dev/',
  },
  CODE_SERVER: {
    NAME: 'Code Server',
    URL: 'https://code.vigilant-broccoli.app/',
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
    STAGING_URL: 'https://staging-manager.harryliu.dev/login',
  },
  SANDBOX: {
    NAME: 'Sandbox',
    URL: 'https://sandbox.vigilant-broccoli.app/',
  },
  WEB_TERMINAL: {
    NAME: 'Web Terminal',
    URL: 'https://shell.vigilant-broccoli.app/',
  },
} as const;
