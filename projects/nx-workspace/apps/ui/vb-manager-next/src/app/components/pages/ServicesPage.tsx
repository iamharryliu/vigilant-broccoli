'use client';

import {
  ServiceLinksTable,
  type ServiceUrl,
} from '@vigilant-broccoli/react-lib';

const URLS = {
  GITHUB: {
    NAME: 'Github',
    DASHBOARD: 'https://github.com/dashboard',
    BILLING: 'https://github.com/settings/billing',
    PAYMENT_HISTORY: 'https://github.com/account/billing/history',
    USAGE: 'https://github.com/settings/billing/usage',
    STATUS: 'https://www.githubstatus.com/',
  },
  GCP: {
    NAME: 'Google Cloud Platform',
    DASHBOARD:
      'https://console.cloud.google.com/home/dashboard?project=vigilant-broccoli',
    BILLING: 'https://console.cloud.google.com/billing',
    STATUS: 'https://status.cloud.google.com/',
  },
  OPENAI: {
    NAME: 'OpenAI',
    DASHBOARD: 'https://platform.openai.com/chat',
    BILLING:
      'https://platform.openai.com/settings/organization/billing/overview',
    PAYMENT_HISTORY:
      'https://platform.openai.com/settings/organization/billing/history',
    USAGE: 'https://platform.openai.com/settings/organization/usage',
    STATUS: 'https://status.openai.com/',
  },
  FLYIO: {
    NAME: 'Fly.io',
    DASHBOARD: 'https://fly.io/dashboard',
    BILLING: 'https://fly.io/dashboard/personal/billing',
    PAYMENT_HISTORY: 'https://fly.io/dashboard/personal/billing',
    USAGE: 'https://fly.io/dashboard/harry-560/billing/cost-explorer',
    STATUS: 'https://fly.io/dashboard/harry-560/status',
  },
  CLOUDFLARE: {
    NAME: 'Cloudflare',
    DASHBOARD:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/home/domains',
    BILLING:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
    PAYMENT_HISTORY:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
    USAGE:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing/billable-usage',
    STATUS: 'https://www.cloudflarestatus.com/',
  },
  TWILIO: {
    NAME: 'Twilio',
    BILLING:
      'https://console.twilio.com/us1/billing/manage-billing/billing-overview',
    PAYMENT_HISTORY: '',
    USAGE:
      'https://console.twilio.com/us1/billing/manage-billing/billing-overview?frameUrl=/console/usage',
    STATUS: 'https://status.twilio.com/',
  },
  OPENWEATHER: {
    NAME: 'OpenWeather',
    BILLING: 'https://home.openweathermap.org/subscriptions',
    DASHBOARD: 'https://home.openweathermap.org/myservices',
    PAYMENT_HISTORY: 'https://home.openweathermap.org/payments',
    STATUS: 'https://openweathermap.org/',
  },
  TERRAFORM: {
    NAME: 'Terraform Cloud',
    DASHBOARD: 'https://app.terraform.io/app/vigilant-broccoli/workspaces',
    BILLING: 'https://app.terraform.io/app/vigilant-broccoli/settings/billing',
    USAGE: 'https://app.terraform.io/app/vigilant-broccoli/usage',
    STATUS: 'https://status.hashicorp.com/',
  },
  CLAUDE: {
    NAME: 'Claude',
    DASHBOARD: 'https://claude.ai/',
    BILLING: 'https://claude.ai/settings/billing',
    PAYMENT_HISTORY: 'https://claude.ai/settings/billing',
    USAGE: 'https://claude.ai/settings/usage',
    STATUS: 'https://status.claude.com/',
  },
  ROBOFLOW: {
    NAME: 'Roboflow',
    DASHBOARD: 'https://app.roboflow.com/',
    BILLING: 'https://app.roboflow.com/vigilantbroccoli/settings/plan',
    PAYMENT_HISTORY: 'https://app.roboflow.com/vigilantbroccoli/settings/plan',
    USAGE: 'https://app.roboflow.com/vigilantbroccoli/settings/usage',
  },
  DEEPSEEK: {
    DASHBOARD: 'https://platform.deepseek.com/sign_in',
    NAME: 'DeepSeek',
    BILLING: 'https://platform.deepseek.com/transactions',
    PAYMENT_HISTORY: 'https://platform.deepseek.com/transactions',
    USAGE: 'https://platform.deepseek.com/usage',
  },
  GROK: {
    DASHBOARD: 'https://console.x.ai/',
    NAME: 'Grok',
  },
  GEMINI: {
    DASHBOARD: 'https://aistudio.google.com/',
    NAME: 'Google AI Studio',
    BILLING:
      'https://aistudio.google.com/usage?timeRange=last-28-days&tab=billing',
    PAYMENT_HISTORY: '',
    USAGE: 'https://aistudio.google.com/usage?timeRange=last-28-days',
  },
  ANTHROPIC: {
    DASHBOARD: 'https://platform.claude.com/dashboard',
    NAME: 'Anthropic',
    BILLING: 'https://platform.claude.com/workspaces/default/cost',
    PAYMENT_HISTORY: 'https://platform.claude.com/settings/billing',
    USAGE: 'https://platform.claude.com/usage',
  },
  STRIPE: {
    NAME: 'Stripe',
    DASHBOARD: 'https://dashboard.stripe.com/',
    BILLING: 'https://dashboard.stripe.com/billing',
    PAYMENT_HISTORY: 'https://dashboard.stripe.com/invoices',
    USAGE: 'https://dashboard.stripe.com/meters',
    API_MANAGEMENT: 'https://dashboard.stripe.com/apikeys',
    STATUS: 'https://status.stripe.com/'
  }
} as Record<string, ServiceUrl>;

export const ServicesPage = () => {
  return <ServiceLinksTable services={URLS} />;
};
