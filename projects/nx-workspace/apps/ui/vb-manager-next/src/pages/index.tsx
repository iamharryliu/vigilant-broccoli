import { Heading, Table } from '@radix-ui/themes';

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
} as Record<string, ServiceUrl>;

export default function Index() {
  return (
    <>
      <Heading>vigilant-broccoli Manager</Heading>
      <LinksTable />
    </>
  );
}

function LinksTable() {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Service</Table.ColumnHeaderCell>
          {Object.values(FIELD_ICONS).map(({ label, icon }) => (
            <Table.ColumnHeaderCell key={label}>
              <span className="flex items-center gap-1">
                {icon} {label}
              </span>
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {Object.values(URLS).map(service => (
          <Table.Row key={service.NAME}>
            <Table.RowHeaderCell>{service.NAME}</Table.RowHeaderCell>
            <Table.Cell>
              {service.DASHBOARD ? (
                <a href={service.DASHBOARD} target="_blank" rel="noreferrer">
                  Dashboard
                </a>
              ) : (
                '-'
              )}
            </Table.Cell>
            <Table.Cell>
              {service.BILLING_URL ? (
                <a href={service.BILLING_URL} target="_blank" rel="noreferrer">
                  Billing
                </a>
              ) : (
                '-'
              )}
            </Table.Cell>
            <Table.Cell>
              {service.PAYMENT_HISTORY ? (
                <a
                  href={service.PAYMENT_HISTORY}
                  target="_blank"
                  rel="noreferrer"
                >
                  Payment History
                </a>
              ) : (
                '-'
              )}
            </Table.Cell>
            <Table.Cell>
              {service.USAGE_URL ? (
                <a href={service.USAGE_URL} target="_blank" rel="noreferrer">
                  Usage
                </a>
              ) : (
                '-'
              )}
            </Table.Cell>
            <Table.Cell>
              {service.STATUS ? (
                <a href={service.STATUS} target="_blank" rel="noreferrer">
                  Status
                </a>
              ) : (
                '-'
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
