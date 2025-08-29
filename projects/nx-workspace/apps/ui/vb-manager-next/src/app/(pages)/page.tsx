'use client';

import { Button, Card, Code, Heading, Table } from '@radix-ui/themes';
import {
  GithubOrganizationTeamStructure,
  GithubTeam,
} from '@vigilant-broccoli/common-js';
import {
  CopyPastable,
  CRUDFormProps,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { getBasename } from '../../lib/utils';
import Link from 'next/link';

const API_ROUTES = {
  GET_CONFIGURATIONS: '/api/get-configurations',
  GET_FILE_OBJECT: '/api/get-file-object',
};

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

export default function Page() {
  return (
    <>
      <Heading>vigilant-broccoli Manager</Heading>
      <LinksTable />
      <StatusBadges />
      <GithubTeamManager />
    </>
  );
}

const LinksTable = () => {
  return (
    <Card>
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
                  <a
                    href={service.BILLING_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
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
    </Card>
  );
};

type Badge = {
  alt: string;
  href: string;
  src: string;
};

const BADGES: Badge[] = [
  {
    alt: 'App Health Check Status',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-health-check.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/cron-health-check.yml/badge.svg',
  },
  {
    alt: 'CMS Flask - Deploy App',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-cms-flask.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-cms-flask.yml/badge.svg',
  },
  {
    alt: 'Deploy Nx Apps - Deploy Apps Status',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml/badge.svg',
  },
  {
    alt: 'Toronto Alerts Flask - Deploy App Status',
    href: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-toronto-alerts.yml',
    src: 'https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-toronto-alerts.yml/badge.svg',
  },
];

const StatusBadges = () => {
  return (
    <Card asChild>
      <a
        href="https://github.com/iamharryliu/vigilant-broccoli/actions"
        target="_blank"
      >
        <Heading>Github Actions</Heading>
        <div className="flex flex-wrap gap-2">
          {BADGES.map(badge => (
            <div key={badge.alt}>
              {/* <a href={badge.href} target="_blank" rel="noopener noreferrer">
                <img src={badge.src} alt={badge.alt} />
              </a> */}
            </div>
          ))}
        </div>
      </a>
    </Card>
  );
};

const Form = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<{ config: string }>) => {
  const [item, setItem] = useState(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    await submitHandler(item, formType);
    setIsSubmitting(false);
  }

  return (
    <>
      <div>
        <label htmlFor="name">Config</label>
        <input
          id="name"
          value={item.config}
          onChange={e =>
            setItem(prev => {
              return { ...prev, title: e.target.value };
            })
          }
        />
      </div>

      <Button onClick={handleSubmit} loading={isSubmitting} className="w-full">
        Submit
      </Button>
    </>
  );
};

function extractTeamLinks(orgData: GithubOrganizationTeamStructure): string[] {
  const links: string[] = [];

  function recurse(teams: GithubTeam[]) {
    for (const team of teams) {
      links.push(
        `https://github.com/orgs/${orgData.organizationName}/teams/${team.name}`,
      );
      recurse(team.teams);
    }
  }

  recurse(orgData.teams);
  return links;
}

const ListItemComponent = ({ item }: { item: any }) => {
  return (
    <>
      <Heading>
        {getBasename(item.id, '.json')} ({item.config.organizationName})
      </Heading>

      <Heading size="3">Team Links </Heading>
      {extractTeamLinks(item.config).map(name => (
        <div key={name}>
          <Link href={name} target="blank" key={name}>
            {name}
          </Link>
        </div>
      ))}
      <CopyPastable text={JSON.stringify(item.config)}></CopyPastable>
    </>
  );
};

const GithubTeamManager = () => {
  const [teamSettings, setTeamSettings] = useState<
    { id: number; config: string }[]
  >([]);

  useEffect(() => {
    async function init() {
      const res = await fetch(API_ROUTES.GET_CONFIGURATIONS);
      setTeamSettings(await res.json());
    }
    init();
  }, []);

  return (
    <Card>
      <Heading>Github Team Manager</Heading>
      <CRUDItemList
        items={teamSettings}
        setItems={setTeamSettings}
        createItem={async () => {
          return { id: 2, config: '{}' };
        }}
        createItemFormDefaultValues={{ id: 0, config: '' }}
        FormComponent={Form}
        ListItemComponent={ListItemComponent}
        isCards={true}
      ></CRUDItemList>
    </Card>
  );
};
