'use client';

import {
  ServiceLinksTable,
  type ServiceUrl,
} from '@vigilant-broccoli/react-lib';
import {
  GITHUB_LINK,
  GCP_LINK,
  OPENAI_LINK,
  FLYIO_LINK,
  CLOUDFLARE_LINK,
  TWILIO_LINK,
  OPENWEATHER_LINK,
  TERRAFORM_LINK,
  CLAUDE_LINK,
  ROBOFLOW_LINK,
  DEEPSEEK_LINK,
  GROK_LINK,
  GEMINI_LINK,
  ANTHROPIC_LINK,
  STRIPE_LINK,
} from '@vigilant-broccoli/common-js';

const DASHBOARD_KEYS = ['DASHBOARD', 'CLAUDE', 'CHATGPT', 'GITHUB'];
const KEY_MAPPING: Record<string, keyof ServiceUrl> = {
  BILLING: 'BILLING',
  PAYMENT_HISTORY: 'PAYMENT_HISTORY',
  USAGE: 'USAGE',
  STATUS: 'STATUS',
  API_MANAGEMENT: 'API_MANAGEMENT',
};

const convertToServiceUrl = (
  links: Record<string, { NAME: string; URL: string }>,
): ServiceUrl => {
  const result: ServiceUrl = { NAME: '' };

  for (const [key, value] of Object.entries(links)) {
    if (DASHBOARD_KEYS.includes(key)) {
      result.DASHBOARD = value.URL;
      if (!result.NAME) result.NAME = value.NAME;
    } else if (KEY_MAPPING[key]) {
      result[KEY_MAPPING[key]] = value.URL;
    }

    if (key.includes('Dashboard') && !result.NAME) {
      result.NAME = value.NAME.replace(' Dashboard', '');
    }
  }

  return result;
};

const URLS = {
  GITHUB: convertToServiceUrl(GITHUB_LINK),
  GCP: convertToServiceUrl(GCP_LINK),
  OPENAI: convertToServiceUrl(OPENAI_LINK),
  FLYIO: convertToServiceUrl(FLYIO_LINK),
  CLOUDFLARE: convertToServiceUrl(CLOUDFLARE_LINK),
  TWILIO: convertToServiceUrl(TWILIO_LINK),
  OPENWEATHER: convertToServiceUrl(OPENWEATHER_LINK),
  TERRAFORM: convertToServiceUrl(TERRAFORM_LINK),
  CLAUDE: convertToServiceUrl(CLAUDE_LINK),
  ROBOFLOW: convertToServiceUrl(ROBOFLOW_LINK),
  DEEPSEEK: convertToServiceUrl(DEEPSEEK_LINK),
  GROK: convertToServiceUrl(GROK_LINK),
  GEMINI: convertToServiceUrl(GEMINI_LINK),
  ANTHROPIC: convertToServiceUrl(ANTHROPIC_LINK),
  STRIPE: convertToServiceUrl(STRIPE_LINK),
} as Record<string, ServiceUrl>;

export const ServicesPage = () => {
  return <ServiceLinksTable services={URLS} />;
};
