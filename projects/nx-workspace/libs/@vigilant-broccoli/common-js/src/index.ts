export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
} as const;

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE];

export const OPEN_TYPE = {
  BROWSER: 'browser',
  MAC_APPLICATION: 'mac_application',
  FILE_SYSTEM: 'file_system',
  VSCODE: 'vscode',
} as const;

export type OpenType = (typeof OPEN_TYPE)[keyof typeof OPEN_TYPE];

// LLM
export * from './lib/llm/llm.consts';
export * from './lib/llm/llm.types';

// JSON Placeholder
export * from './lib/jsonplaceholder/jsonplaceholder.services';
export * from './lib/jsonplaceholder/jsonplaceholder.types';

// Utils
export * from './lib/utils/env.utils';
export * from './lib/utils/string.utils';
export * from './lib/utils/date.utils';

export * from './lib/github/github.types';

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export const GOOGLE_SERVICES = {
  PHOTOS: {
    NAME: 'Google Photos',
    URL: 'https://photos.google.com/?pli=1',
  },
  CONTACTS: {
    NAME: 'Google Contacts',
    URL: 'https://contacts.google.com/',
  },
  DRIVE: {
    NAME: 'Google Drive',
    URL: 'https://drive.google.com/drive/u/0/my-drive',
  },
  MAPS: {
    NAME: 'Google Maps',
    URL: 'https://www.google.com/maps',
  },
  TRANSLATE: {
    NAME: 'Google Translate',
    URL: 'https://translate.google.com/',
  },
  GMAIL: {
    NAME: 'Gmail',
    URL: 'https://mail.google.com',
    FILTERS: {
      NAME: 'Gmail Filters',
      URL: 'https://mail.google.com/mail/u/0/#settings/filters',
    },
  },
  CALENDAR: {
    NAME: 'Google Calendar',
    URL: 'https://calendar.google.com/',
  },
  MEET: {
    NAME: 'Google Meet',
    URL: 'https://meet.google.com/',
  },
  YOUTUBE: {
    NAME: 'YouTube',
    URL: 'https://www.youtube.com',
    WATCH_LATER: {
      NAME: 'YouTube Watch Later',
      URL: 'https://www.youtube.com/playlist?list=WL',
    },
  },
  KEEP: {
    NAME: 'Google Keep',
    URL: 'https://keep.google.com/',
  },
  TASKS: {
    NAME: 'Google Tasks',
    URL: 'https://tasks.google.com/tasks/',
  },
  GCP: {
    NAME: 'GCP',
    URL: 'https://console.cloud.google.com',
  },
  ADSENSE: {
    NAME: 'Google AdSense',
    URL: 'https://adsense.google.com/start/',
  },
  ANALYTICS: {
    NAME: 'Google Analytics',
    URL: 'https://analytics.google.com/analytics/',
  },
  GEMINI: {
    NAME: 'Gemini',
    URL: 'https://gemini.google.com/app',
  },
} as const;

export const UTILITY_URL = {
  FIND_MY: {
    NAME: 'Find My',
    URL: 'https://www.icloud.com/find/',
  },
  AMAZON: {
    NAME: 'Amazon',
    URL: 'https://www.amazon.com',
  },
  PINTEREST: {
    NAME: 'Pinterest',
    URL: 'https://www.pinterest.com',
  },
} as const;

export const OPENAI_LINK = {
  CHATGPT: {
    NAME: 'ChatGPT',
    URL: 'https://chat.openai.com',
  },
  INCOGNITO: {
    NAME: 'ChatGPT Incognito',
    URL: 'https://chatgpt.com/?temporary-chat=true',
  },
  DASHBOARD: {
    NAME: 'OpenAI Dashboard',
    URL: 'https://platform.openai.com/chat',
  },
  BILLING: {
    NAME: 'OpenAI Billing',
    URL: 'https://platform.openai.com/settings/organization/billing/overview',
  },
  PAYMENT_HISTORY: {
    NAME: 'OpenAI Payment History',
    URL: 'https://platform.openai.com/settings/organization/billing/history',
  },
  USAGE: {
    NAME: 'OpenAI Usage',
    URL: 'https://platform.openai.com/settings/organization/usage',
  },
  STATUS: {
    NAME: 'OpenAI Status',
    URL: 'https://status.openai.com/',
  },
  DOCS: {
    NAME: 'OpenAI Docs',
    URL: 'https://platform.openai.com/docs/overview',
  },
} as const;

export const CLAUDE_LINK = {
  CLAUDE: {
    NAME: 'Claude',
    URL: 'https://claude.ai',
  },
  DASHBOARD: {
    NAME: 'Claude Dashboard',
    URL: 'https://claude.ai/',
  },
  INCOGNITO: {
    NAME: 'Claude Incognito',
    URL: 'https://claude.ai/new?incognito',
  },
  BILLING: {
    NAME: 'Claude Billing',
    URL: 'https://claude.ai/settings/billing',
  },
  PAYMENT_HISTORY: {
    NAME: 'Claude Payment History',
    URL: 'https://claude.ai/settings/billing',
  },
  USAGE: {
    NAME: 'Claude Usage',
    URL: 'https://claude.ai/settings/usage',
  },
  STATUS: {
    NAME: 'Claude Status',
    URL: 'https://status.claude.com/',
  },
  PRICING: {
    NAME: 'Claude Pricing',
    URL: 'https://claude.com/pricing',
  },
  CODE: {
    NAME: 'Claude Code',
    URL: 'https://www.claude.com/product/claude-code',
  },
} as const;

export const GITHUB_LINK = {
  GITHUB: {
    NAME: 'GitHub',
    URL: 'https://github.com',
  },
  DASHBOARD: {
    NAME: 'Github Dashboard',
    URL: 'https://github.com/dashboard',
  },
  TOKENS: {
    NAME: 'GitHub Tokens',
    URL: 'https://github.com/settings/personal-access-tokens',
  },
  ACTIONS_PRICING: {
    NAME: 'GitHub Actions Pricing',
    URL: 'https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions',
  },
  BILLING: {
    NAME: 'GitHub Billing',
    URL: 'https://github.com/settings/billing',
  },
  PAYMENT_HISTORY: {
    NAME: 'Github Payment History',
    URL: 'https://github.com/account/billing/history',
  },
  USAGE: {
    NAME: 'Github Usage',
    URL: 'https://github.com/settings/billing/usage',
  },
  STATUS: {
    NAME: 'GitHub Status',
    URL: 'https://www.githubstatus.com/',
  },
} as const;

export const TWILIO_LINK = {
  BILLING: {
    NAME: 'Twilio Billing',
    URL: 'https://console.twilio.com/us1/billing/manage-billing/billing-overview',
  },
  USAGE: {
    NAME: 'Twilio Usage',
    URL: 'https://console.twilio.com/us1/billing/manage-billing/billing-overview?frameUrl=/console/usage',
  },
  STATUS: {
    NAME: 'Twilio Status',
    URL: 'https://status.twilio.com/',
  },
  PHONE_NUMBERS: {
    NAME: 'Twilio Phone Numbers',
    URL: 'https://console.twilio.com/us1/develop/phone-numbers/manage/verified',
  },
  DOCS: {
    NAME: 'Twilio Docs',
    URL: 'https://www.twilio.com/docs',
  },
} as const;

export const CLOUDFLARE_LINK = {
  DASHBOARD: {
    NAME: 'Cloudflare Dashboard',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/home/domains',
  },
  BILLING: {
    NAME: 'Cloudflare Billing',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
  },
  PAYMENT_HISTORY: {
    NAME: 'Cloudflare Payment History',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
  },
  USAGE: {
    NAME: 'Cloudflare Usage',
    URL: 'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing/billable-usage',
  },
  STATUS: {
    NAME: 'Cloudflare Status',
    URL: 'https://www.cloudflarestatus.com/',
  },
  DNS_DOCS: {
    NAME: 'Cloudflare DNS Docs',
    URL: 'https://www.cloudflare.com/application-services/products/dns/',
  },
  PAGES_DOCS: {
    NAME: 'Cloudflare Pages Docs',
    URL: 'https://pages.cloudflare.com/',
  },
  WORKERS_DOCS: {
    NAME: 'Cloudflare Workers Docs',
    URL: 'https://workers.cloudflare.com/',
  },
  R2_STORAGE_DOCS: {
    NAME: 'Cloudflare R2 Storage Docs',
    URL: 'https://www.cloudflare.com/developer-platform/products/r2/',
  },
  TURNSTILE_DOCS: {
    NAME: 'Cloudflare Turnstile Docs',
    URL: 'https://www.cloudflare.com/application-services/products/turnstile/',
  },
} as const;

export const FLYIO_LINK = {
  DASHBOARD: {
    NAME: 'FlyIO Dashboard',
    URL: 'https://fly.io/dashboard',
  },
  BILLING: {
    NAME: 'FlyIO Billing',
    URL: 'https://fly.io/dashboard/personal/billing',
  },
  PAYMENT_HISTORY: {
    NAME: 'Fly.io Payment History',
    URL: 'https://fly.io/dashboard/personal/billing',
  },
  USAGE: {
    NAME: 'Fly.io Usage',
    URL: 'https://fly.io/dashboard/harry-560/billing/cost-explorer',
  },
  STATUS: {
    NAME: 'Fly.io Status',
    URL: 'https://fly.io/dashboard/harry-560/status',
  },
  DOCS: {
    NAME: 'FlyIO Docs',
    URL: 'https://fly.io/docs/',
  },
} as const;

export const DATE_CONST = {
  DAY: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
};

export const GCP_LINK = {
  DASHBOARD: {
    NAME: 'GCP Dashboard',
    URL: 'https://console.cloud.google.com/home/dashboard?project=vigilant-broccoli',
  },
  BILLING: {
    NAME: 'GCP Billing',
    URL: 'https://console.cloud.google.com/billing',
  },
  STATUS: {
    NAME: 'GCP Status',
    URL: 'https://status.cloud.google.com/',
  },
} as const;

export const OPENWEATHER_LINK = {
  DASHBOARD: {
    NAME: 'OpenWeather Dashboard',
    URL: 'https://home.openweathermap.org/myservices',
  },
  BILLING: {
    NAME: 'OpenWeather Billing',
    URL: 'https://home.openweathermap.org/subscriptions',
  },
  PAYMENT_HISTORY: {
    NAME: 'OpenWeather Payment History',
    URL: 'https://home.openweathermap.org/payments',
  },
  STATUS: {
    NAME: 'OpenWeather Status',
    URL: 'https://openweathermap.org/',
  },
} as const;

export const TERRAFORM_LINK = {
  DASHBOARD: {
    NAME: 'Terraform Dashboard',
    URL: 'https://app.terraform.io/app/vigilant-broccoli/workspaces',
  },
  BILLING: {
    NAME: 'Terraform Billing',
    URL: 'https://app.terraform.io/app/vigilant-broccoli/settings/billing',
  },
  USAGE: {
    NAME: 'Terraform Usage',
    URL: 'https://app.terraform.io/app/vigilant-broccoli/usage',
  },
  STATUS: {
    NAME: 'Terraform Status',
    URL: 'https://status.hashicorp.com/',
  },
} as const;

export const ROBOFLOW_LINK = {
  DASHBOARD: {
    NAME: 'Roboflow Dashboard',
    URL: 'https://app.roboflow.com/',
  },
  BILLING: {
    NAME: 'Roboflow Billing',
    URL: 'https://app.roboflow.com/vigilantbroccoli/settings/plan',
  },
  PAYMENT_HISTORY: {
    NAME: 'Roboflow Payment History',
    URL: 'https://app.roboflow.com/vigilantbroccoli/settings/plan',
  },
  USAGE: {
    NAME: 'Roboflow Usage',
    URL: 'https://app.roboflow.com/vigilantbroccoli/settings/usage',
  },
} as const;

export const DEEPSEEK_LINK = {
  DASHBOARD: {
    NAME: 'DeepSeek Dashboard',
    URL: 'https://platform.deepseek.com/sign_in',
  },
  BILLING: {
    NAME: 'DeepSeek Billing',
    URL: 'https://platform.deepseek.com/transactions',
  },
  PAYMENT_HISTORY: {
    NAME: 'DeepSeek Payment History',
    URL: 'https://platform.deepseek.com/transactions',
  },
  USAGE: {
    NAME: 'DeepSeek Usage',
    URL: 'https://platform.deepseek.com/usage',
  },
} as const;

export const GROK_LINK = {
  DASHBOARD: {
    NAME: 'Grok Dashboard',
    URL: 'https://console.x.ai/',
  },
} as const;

export const GEMINI_LINK = {
  DASHBOARD: {
    NAME: 'Google AI Studio Dashboard',
    URL: 'https://aistudio.google.com/',
  },
  BILLING: {
    NAME: 'Google AI Studio Billing',
    URL: 'https://aistudio.google.com/usage?timeRange=last-28-days&tab=billing',
  },
  USAGE: {
    NAME: 'Google AI Studio Usage',
    URL: 'https://aistudio.google.com/usage?timeRange=last-28-days',
  },
} as const;

export const ANTHROPIC_LINK = {
  DASHBOARD: {
    NAME: 'Anthropic Dashboard',
    URL: 'https://platform.claude.com/dashboard',
  },
  BILLING: {
    NAME: 'Anthropic Billing',
    URL: 'https://platform.claude.com/workspaces/default/cost',
  },
  PAYMENT_HISTORY: {
    NAME: 'Anthropic Payment History',
    URL: 'https://platform.claude.com/settings/billing',
  },
  USAGE: {
    NAME: 'Anthropic Usage',
    URL: 'https://platform.claude.com/usage',
  },
} as const;

export const STRIPE_LINK = {
  DASHBOARD: {
    NAME: 'Stripe Dashboard',
    URL: 'https://dashboard.stripe.com/',
  },
  BILLING: {
    NAME: 'Stripe Billing',
    URL: 'https://dashboard.stripe.com/billing',
  },
  PAYMENT_HISTORY: {
    NAME: 'Stripe Payment History',
    URL: 'https://dashboard.stripe.com/invoices',
  },
  USAGE: {
    NAME: 'Stripe Usage',
    URL: 'https://dashboard.stripe.com/meters',
  },
  API_MANAGEMENT: {
    NAME: 'Stripe API Management',
    URL: 'https://dashboard.stripe.com/apikeys',
  },
  STATUS: {
    NAME: 'Stripe Status',
    URL: 'https://status.stripe.com/',
  },
} as const;
