export const SERVICE_NAME = 'office-presence-service';

export const SLACK_ROUTE = {
  EVENTS: '/slack/events',
  INTERACTIVITY: '/slack/interactivity',
  COMMANDS: '/slack/commands',
} as const;

export const DEMO_ROUTE_PREFIX = '/demo';

export const INTERNAL_ROUTE = {
  SEED: '/internal/seed',
  REMINDERS: '/internal/reminders',
} as const;

export const DEMO_SESSION_HEADER = 'x-demo-session';
