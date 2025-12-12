'use client';

import { Table, Flex, Text } from '@radix-ui/themes';

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

export type ServiceUrl = {
  NAME: string;
  DASHBOARD?: string;
  BILLING?: string;
  PAYMENT_HISTORY?: string;
  USAGE?: string;
  STATUS?: string;
};

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

type ServiceLinksTableProps = {
  services: Record<string, ServiceUrl>;
  alphabetical?: boolean; 
};

export const ServiceLinksTable = ({
  services,
  alphabetical = true
}: ServiceLinksTableProps) => {
  const sortedServices = alphabetical
    ? Object.values(services).sort((a, b) => a.NAME.localeCompare(b.NAME))
    : Object.values(services);

  return (
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
          {sortedServices.map(service => (
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
              <TableLinkCell url={service.BILLING} label="View" />
              <TableLinkCell url={service.PAYMENT_HISTORY} label="View" />
              <TableLinkCell url={service.USAGE} label="View" />
              <TableLinkCell url={service.STATUS} label="Check" />
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};
