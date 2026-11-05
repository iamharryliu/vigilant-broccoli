export const STAGING = 'staging';

interface RenderServiceConfig {
  name: string;
  region: string;
  plan: 'free';
  healthCheckPath: string;
}

export const renderServices: Record<
  string,
  Record<string, RenderServiceConfig>
> = {
  'llm-service': {
    [STAGING]: {
      name: 'staging-llm-service',
      region: 'frankfurt',
      plan: 'free',
      healthCheckPath: '/',
    },
  },
};
