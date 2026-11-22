import { PROJECT_LINK } from '@harry/personal';

// Zone for the public tool sites and Weather; keep in sync with `vigilant_broccoli_domain`
// in infrastructure/terraform/variables.tf.
const VB_APP_DOMAIN = 'vigilant-broccoli.app';

export const VB_APP_URL = {
  GAMES: { NAME: 'Games', URL: `https://games.${VB_APP_DOMAIN}/` },
  COMPONENT_LIBRARY: {
    NAME: 'Component Library',
    URL: `https://components.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-components.${VB_APP_DOMAIN}/`,
  },
  TEXT_TOOLS: {
    NAME: 'Text Tools',
    URL: `https://text-tools.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-text-tools.${VB_APP_DOMAIN}/`,
  },
  UTILITIES: {
    NAME: 'Utilities',
    URL: `https://utilities.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-utilities.${VB_APP_DOMAIN}/`,
  },
  WAITING_GAMES: {
    NAME: 'Waiting Games',
    URL: `https://waiting.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-waiting.${VB_APP_DOMAIN}/`,
  },
  BOOKMARKS: {
    NAME: 'Bookmarks',
    URL: `https://bookmarks.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-bookmarks.${VB_APP_DOMAIN}/`,
  },
  POMODORO: {
    NAME: 'Pomodoro',
    URL: `https://pomodoro.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-pomodoro.${VB_APP_DOMAIN}/`,
  },
  PHOTOGRAPHY: {
    NAME: 'Photography',
    URL: 'https://photography.harryliu.dev/',
    STAGING_URL: 'https://staging-photography.harryliu.dev/',
  },
  CALENDARS: {
    NAME: 'Calendars',
    URL: PROJECT_LINK.CALENDAR.URL,
    STAGING_URL: 'https://staging-calendar.harryliu.dev/',
  },
  WEATHER: {
    NAME: 'Weather',
    URL: `https://weather.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-weather.${VB_APP_DOMAIN}/`,
  },
  TASKS: {
    NAME: 'Tasks',
    URL: 'https://tasks.harryliu.dev/',
    STAGING_URL: 'https://staging-tasks.harryliu.dev/',
  },
  FIND_ME: {
    NAME: 'Find Me',
    URL: `https://findme.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-findme.${VB_APP_DOMAIN}/`,
  },
  WHITEBOARD: {
    NAME: 'Whiteboard',
    URL: `https://whiteboard.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-whiteboard.${VB_APP_DOMAIN}/`,
  },
  BALLOONO: {
    NAME: 'Balloono',
    URL: `https://balloono.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-balloono.${VB_APP_DOMAIN}/`,
  },
  GRAVITY_GUY: {
    NAME: 'Gravity Guy',
    URL: `https://gravity-guy.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-gravity-guy.${VB_APP_DOMAIN}/`,
  },
  DOCS: {
    NAME: 'Docs',
    URL: 'https://docs.harryliu.dev/',
    STAGING_URL: 'https://staging-docs.harryliu.dev/',
  },
  GRIND_75: {
    NAME: 'Grind 75',
    URL: `https://grind-75.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-grind-75.${VB_APP_DOMAIN}/`,
  },
  CONTEXT: {
    NAME: 'Agent Context',
    URL: `https://context.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-context.${VB_APP_DOMAIN}/`,
  },
  CLOUD_8_SKATE: {
    NAME: 'Cloud 8 Skate',
    URL: 'https://cloud8skate.com/',
    STAGING_URL: 'https://staging.cloud8skate.com/',
  },
  PERSONAL_WEBSITE: {
    NAME: 'harryliu.dev',
    URL: 'https://harryliu.dev/',
    STAGING_URL: 'https://staging.harryliu.dev/',
  },
  RESUME: {
    NAME: 'Resume',
    URL: 'https://harryliu.dev/resume',
    STAGING_URL: 'https://staging.harryliu.dev/resume',
  },
  HEARTH: {
    NAME: 'Hearth',
    URL: 'https://hearth.harryliu.dev/login',
    STAGING_URL: 'https://staging-hearth.harryliu.dev/login',
  },
  SERVICE_MANAGER: {
    NAME: 'Service Manager API',
    URL: 'https://api.harryliu.dev/',
    STAGING_URL: 'https://staging-api.harryliu.dev/',
  },
  MEDIA_SERVICE: {
    NAME: 'Media Service API',
    URL: 'https://production-media-service.fly.dev/',
    STAGING_URL: 'https://staging-media-service.fly.dev/',
  },
  EMPLOYEE_HANDLER_DEMO: {
    NAME: 'Employee Handler Demo',
    URL: 'https://demo-employee-handler-ui.vercel.app/',
  },
  JOB_HUNT_DEMO: {
    NAME: 'Job Hunt Demo',
    URL: 'https://demo-job-hunt-next.vercel.app/',
  },
  OFFICE_PRESENCE_DEMO: {
    NAME: 'Office Presence Demo',
    URL: 'https://demo-office-presence-ui.pages.dev/',
  },
  OFFICE_PRESENCE_SERVICE_DEMO: {
    NAME: 'Office Presence Service Demo',
    URL: 'https://demo-office-presence-service.fly.dev/',
  },
  CAREER: {
    NAME: 'Career',
    URL: 'https://career.harryliu.dev/',
  },
  PROJECTS_HUB: {
    NAME: 'Projects Hub',
    URL: `https://projects.${VB_APP_DOMAIN}/`,
    STAGING_URL: `https://staging-projects.${VB_APP_DOMAIN}/`,
  },
} as const;
