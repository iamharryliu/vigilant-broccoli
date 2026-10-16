export const SLACK_MODE = {
  SOCKET: 'socket',
  HTTP: 'http',
} as const;
export type SlackMode = (typeof SLACK_MODE)[keyof typeof SLACK_MODE];

// Socket stays the default so existing deployments keep working without a public URL.
export const DEFAULT_SLACK_MODE: SlackMode = SLACK_MODE.SOCKET;

const REQUIRED_ENV: Record<SlackMode, string[]> = {
  [SLACK_MODE.SOCKET]: ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN'],
  [SLACK_MODE.HTTP]: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'],
};

export function resolveSlackMode(
  value: string | undefined = process.env.SLACK_MODE,
): SlackMode {
  if (!value) return DEFAULT_SLACK_MODE;
  const modes = Object.values(SLACK_MODE) as string[];
  if (!modes.includes(value)) {
    throw new Error(
      `Invalid SLACK_MODE "${value}". Expected one of: ${modes.join(', ')}.`,
    );
  }
  return value as SlackMode;
}

export function validateSlackEnv(
  mode: SlackMode,
  env: NodeJS.ProcessEnv = process.env,
) {
  const missing = REQUIRED_ENV[mode].filter(name => !env[name]);
  if (missing.length > 0) {
    throw new Error(
      `SLACK_MODE=${mode} requires ${REQUIRED_ENV[mode].join(' and ')}; missing: ${missing.join(', ')}.`,
    );
  }
}
