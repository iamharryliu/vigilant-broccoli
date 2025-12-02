'use client';

import { Card, Table, Flex, Text } from '@radix-ui/themes';

const FIELD_ICONS: Record<
  string,
  { label: string; icon: JSX.Element | string }
> = {
  DASHBOARD: { label: 'Dashboard', icon: '🌐' },
  BILLING_URL: { label: 'Billing', icon: '💳' },
  PAYMENT_HISTORY: { label: 'Payments', icon: '🕓' },
  USAGE_URL: { label: 'Usage', icon: '📊' },
  STATUS: { label: 'Status', icon: '🚦' },
};

type ServiceUrl = {
  NAME: string;
  DASHBOARD?: string;
  BILLING_URL?: string;
  PAYMENT_HISTORY?: string;
  USAGE_URL?: string;
  STATUS?: string;
};

const URLS = {
  GITHUB: {
    NAME: 'Github',
    DASHBOARD: 'https://github.com/dashboard',
    BILLING_URL: 'https://github.com/settings/billing',
    PAYMENT_HISTORY: 'https://github.com/account/billing/history',
    USAGE_URL: 'https://github.com/settings/billing/usage',
    STATUS: 'https://www.githubstatus.com/',
  },
  GCP: {
    NAME: 'Google Cloud Platform',
    DASHBOARD: 'https://console.cloud.google.com/home/dashboard?project=vigilant-broccoli',
    BILLING_URL: 'https://console.cloud.google.com/billing',
    STATUS: 'https://status.cloud.google.com/',
  },
  OPENAI: {
    NAME: 'OpenAI',
    DASHBOARD: 'https://platform.openai.com/chat',
    BILLING_URL:
      'https://platform.openai.com/settings/organization/billing/overview',
    PAYMENT_HISTORY:
      'https://platform.openai.com/settings/organization/billing/history',
    USAGE_URL: 'https://platform.openai.com/settings/organization/usage',
    STATUS: 'https://status.openai.com/',
  },
  FLYIO: {
    NAME: 'Fly.io',
    DASHBOARD: 'https://fly.io/dashboard',
    BILLING_URL: 'https://fly.io/dashboard/personal/billing',
    // Requires clicking manage billing
    PAYMENT_HISTORY: 'https://fly.io/dashboard/harry-560/billing',
    USAGE_URL: 'https://fly.io/dashboard/harry-560/usage',
    STATUS: 'https://fly.io/dashboard/harry-560/status',
  },
  CLOUDFLARE: {
    NAME: 'Cloudflare',
    DASHBOARD:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/home/domains',
    BILLING_URL:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
    PAYMENT_HISTORY:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing',
    USAGE_URL:
      'https://dash.cloudflare.com/26d066ec62c4d27b8da5e9aebac17293/billing/billable-usage',
    STATUS: 'https://www.cloudflarestatus.com/',
  },
  TWILIO: {
    NAME: 'Twilio',
    BILLING_URL:
      'https://console.twilio.com/us1/billing/manage-billing/billing-overview',
    PAYMENT_HISTORY: '',
    USAGE_URL:
      'https://console.twilio.com/us1/billing/manage-billing/billing-overview?frameUrl=/console/usage',
    STATUS: 'https://status.twilio.com/',
  },
  OPENWEATHER: {
    NAME: 'OpenWeather',
    BILLING_URL: 'https://home.openweathermap.org/subscriptions',
    DASHBOARD: 'https://home.openweathermap.org/myservices',
    PAYMENT_HISTORY: 'https://home.openweathermap.org/payments',
    STATUS: 'https://openweathermap.org/',
  },
  TERRAFORM: {
    NAME: 'Terraform Cloud',
    DASHBOARD: 'https://app.terraform.io/app/vigilant-broccoli/workspaces',
    BILLING_URL:
      'https://app.terraform.io/app/vigilant-broccoli/settings/billing',
    USAGE_URL: 'https://app.terraform.io/app/vigilant-broccoli/usage',
    STATUS: 'https://status.hashicorp.com/',
  },
} as Record<string, ServiceUrl>;

// Helper component for table cells with links
const TableLinkCell = ({ url, label }: { url?: string; label: string }) => {
  if (!url) {
    return (
      <Table.Cell>
        <Text size="2" color="gray">
          -
        </Text>
      </Table.Cell>
    );
  }

  return (
    <Table.Cell>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
      >
        <Text size="2">{label}</Text>
      </a>
    </Table.Cell>
  );
};

export const LinksTable = () => {
  return (
    <Card className="w-full">
      <Flex direction="column" gap="4" p="4">
        <Text size="5" weight="bold">
          Service Links
        </Text>

        <div className="overflow-x-auto">
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  <Text size="2" weight="bold">
                    Service
                  </Text>
                </Table.ColumnHeaderCell>
                {Object.values(FIELD_ICONS).map(({ label, icon }) => (
                  <Table.ColumnHeaderCell key={label}>
                    <Flex align="center" gap="1">
                      <span className="text-base">{icon}</span>
                      <Text size="2" weight="bold">
                        {label}
                      </Text>
                    </Flex>
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {Object.values(URLS).map(service => (
                <Table.Row
                  key={service.NAME}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Table.RowHeaderCell>
                    <Text size="2" weight="medium">
                      {service.NAME}
                    </Text>
                  </Table.RowHeaderCell>
                  <TableLinkCell url={service.DASHBOARD} label="View" />
                  <TableLinkCell url={service.BILLING_URL} label="View" />
                  <TableLinkCell url={service.PAYMENT_HISTORY} label="View" />
                  <TableLinkCell url={service.USAGE_URL} label="View" />
                  <TableLinkCell url={service.STATUS} label="Check" />
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </Flex>
    </Card>
  );
};
