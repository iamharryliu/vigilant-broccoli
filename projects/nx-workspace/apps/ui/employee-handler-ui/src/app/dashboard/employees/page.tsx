'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Checkbox,
  CopyButton,
  EllipsisCTA,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type EllipsisAction,
} from '@vigilant-broccoli/react-lib';
import { Card, DropdownMenu, Text } from '@radix-ui/themes';
import { ERR_NO_EMAILS, postEmails } from '../../../lib/api-helpers';

const INCOMING_ENDPOINT = '/api/employees/incoming';
const ACTIVE_ENDPOINT = '/api/employees/active';
const INACTIVE_ENDPOINT = '/api/employees/inactive';
const MANUAL_OFFBOARD_ENDPOINT = '/api/offboard/manualOffboard';
const MANUAL_ONBOARD_ENDPOINT = '/api/onboard/manualOnboard';
const RECOVER_ENDPOINT = '/api/recover';
const POST_RETENTION_ENDPOINT = '/api/postRetentionCleanup';
const SYNC_ENDPOINT = '/api/sync';

const TAB_QUERY_KEY = 'tab';
const TAB_INCOMING = 'incoming';
const TAB_ACTIVE = 'active';
const TAB_INACTIVE = 'inactive';

const LABEL_INCOMING = 'Incoming Employees';
const LABEL_ACTIVE = 'Active Employees';
const LABEL_INACTIVE = 'Inactive Employees';

const LOADING_TEXT = 'Loading...';
const EMPTY_TEXT = 'No employees';
const BULK_ACTIONS_LABEL = 'Actions';
const SELECT_ALL_LABEL = 'Select all';
const SELECT_ROW_LABEL = 'Select row';

const COL_NAME = 'Name';
const COL_EMAIL = 'Email';
const COL_ACTIONS = 'Actions';

const ACTION_OFFBOARD = 'Offboard';
const ACTION_RECOVER = 'Recover account';
const ACTION_ONBOARD_ONE = 'Onboard';
const ACTION_OFFBOARD_SELECTED = 'Offboard Selected';
const ACTION_ONBOARD_SELECTED = 'Onboard Selected';
const ACTION_RETENTION = 'Post-Retention Cleanup';
const ACTION_SYNC = 'Sync Data';

const CONFIRM_OFFBOARD_TITLE = 'Offboard employee';
const CONFIRM_ONBOARD_TITLE = 'Onboard employee';

const SUCCESS_OFFBOARD_ONE = 'Employee offboarded';
const SUCCESS_ONBOARD_ONE = 'Employee onboarded';
const SUCCESS_RECOVER = 'Account recovered';
const SUCCESS_OFFBOARD_SELECTED = 'Offboarded selected employees';
const SUCCESS_ONBOARD_SELECTED = 'Onboarded selected employees';
const SUCCESS_RETENTION = 'Post-retention cleanup complete';
const SUCCESS_SYNC = 'Sync complete';

const offboardConfirmDescription = (email: string) =>
  `Offboard ${email}? This will deactivate the account.`;
const recoverConfirmDescription = (email: string) =>
  `Recover the account for ${email}?`;
const onboardConfirmDescription = (email: string) =>
  `Onboard ${email}? This will activate the account.`;

const PAGE_CONTAINER = 'max-w-5xl mx-auto p-8 space-y-6';
const TABLE_WRAPPER = 'overflow-x-auto';
const TABLE_CLASS = 'w-full text-sm';
const TH_CLASS =
  'text-left font-medium text-muted-foreground border-b border-border py-2 px-3';
const TD_CLASS = 'border-b border-border py-2 px-3 align-middle';
const ROW_ACTIONS_CELL = 'flex items-center gap-2';

type Employee = {
  email: string;
  firstName?: string;
  lastName?: string;
};

const displayName = (e: Employee): string => {
  const name = [e.firstName, e.lastName].filter(Boolean).join(' ').trim();
  return name || '—';
};

const normalizeList = (data: unknown): Employee[] => {
  const raw = (data as { employees?: unknown[] })?.employees ?? [];
  return raw.map(item =>
    typeof item === 'string' ? { email: item } : (item as Employee),
  );
};

const useEmployeesTab = (endpoint: string) => {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    fetch(endpoint)
      .then(res => res.json())
      .then(json => setData(normalizeList(json)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return { data, loading, reload };
};

type EmployeeTableProps = {
  employees: Employee[];
  loading: boolean;
  buildActions?: (employee: Employee) => EllipsisAction[];
  selection?: {
    selectedEmails: Set<string>;
    toggleEmail: (email: string) => void;
    toggleAll: () => void;
  };
};

const EmployeeTable = ({
  employees,
  loading,
  buildActions,
  selection,
}: EmployeeTableProps) => {
  if (loading) {
    return (
      <Text size="2" color="gray">
        {LOADING_TEXT}
      </Text>
    );
  }
  if (employees.length === 0) {
    return (
      <Text size="2" color="gray">
        {EMPTY_TEXT}
      </Text>
    );
  }

  const allSelected =
    !!selection &&
    employees.length > 0 &&
    employees.every(emp => selection.selectedEmails.has(emp.email));

  return (
    <div className={TABLE_WRAPPER}>
      <table className={TABLE_CLASS}>
        <thead>
          <tr>
            {selection && (
              <th className={TH_CLASS}>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => selection.toggleAll()}
                  aria-label={SELECT_ALL_LABEL}
                />
              </th>
            )}
            <th className={TH_CLASS}>{COL_NAME}</th>
            <th className={TH_CLASS}>{COL_EMAIL}</th>
            <th className={TH_CLASS}>{COL_ACTIONS}</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => {
            const actions = buildActions?.(emp);
            const isChecked = selection?.selectedEmails.has(emp.email) ?? false;
            return (
              <tr key={emp.email}>
                {selection && (
                  <td className={TD_CLASS}>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => selection.toggleEmail(emp.email)}
                      aria-label={SELECT_ROW_LABEL}
                    />
                  </td>
                )}
                <td className={TD_CLASS}>{displayName(emp)}</td>
                <td className={TD_CLASS}>
                  <div className="flex items-center gap-1">
                    <span>{emp.email}</span>
                    <CopyButton text={emp.email} />
                  </div>
                </td>
                <td className={TD_CLASS}>
                  <div className={ROW_ACTIONS_CELL}>
                    {actions && actions.length > 0 && (
                      <EllipsisCTA actions={actions} />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const requireEmail = (email: string) => {
  if (!email) {
    alert(ERR_NO_EMAILS);
    return false;
  }
  return true;
};

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get(TAB_QUERY_KEY) ?? TAB_ACTIVE;

  const incoming = useEmployeesTab(INCOMING_ENDPOINT);
  const active = useEmployeesTab(ACTIVE_ENDPOINT);
  const inactive = useEmployeesTab(INACTIVE_ENDPOINT);
  const [selectedIncoming, setSelectedIncoming] = useState<Set<string>>(
    new Set(),
  );
  const [selectedActive, setSelectedActive] = useState<Set<string>>(new Set());
  const [selectedInactive, setSelectedInactive] = useState<Set<string>>(
    new Set(),
  );

  const makeSelectionHandlers = (
    setSelected: React.Dispatch<React.SetStateAction<Set<string>>>,
    getEmails: () => string[],
  ) => ({
    toggleEmail: (email: string) =>
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(email)) next.delete(email);
        else next.add(email);
        return next;
      }),
    toggleAll: () =>
      setSelected(prev => {
        const allEmails = getEmails();
        const allSelected = allEmails.every(e => prev.has(e));
        return allSelected ? new Set() : new Set(allEmails);
      }),
  });

  const incomingSelection = makeSelectionHandlers(setSelectedIncoming, () =>
    incoming.data.map(e => e.email),
  );
  const activeSelection = makeSelectionHandlers(setSelectedActive, () =>
    active.data.map(e => e.email),
  );
  const inactiveSelection = makeSelectionHandlers(setSelectedInactive, () =>
    inactive.data.map(e => e.email),
  );

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(TAB_QUERY_KEY, value);
    router.replace(`?${params.toString()}`);
  };

  const offboardOne = async (email: string) => {
    if (!requireEmail(email)) return;
    await postEmails(MANUAL_OFFBOARD_ENDPOINT, [email]);
    alert(SUCCESS_OFFBOARD_ONE);
    active.reload();
    inactive.reload();
  };

  const recoverOne = async (email: string) => {
    if (!requireEmail(email)) return;
    await postEmails(RECOVER_ENDPOINT, [email]);
    alert(SUCCESS_RECOVER);
    active.reload();
    inactive.reload();
  };

  const onboardOne = async (email: string) => {
    if (!requireEmail(email)) return;
    await postEmails(MANUAL_ONBOARD_ENDPOINT, [email]);
    alert(SUCCESS_ONBOARD_ONE);
    incoming.reload();
    active.reload();
  };

  const syncData = async () => {
    await fetch(SYNC_ENDPOINT);
    alert(SUCCESS_SYNC);
    active.reload();
  };

  const offboardSelected = async () => {
    const emails = Array.from(selectedInactive);
    if (emails.length === 0) return;
    await postEmails(MANUAL_OFFBOARD_ENDPOINT, emails);
    alert(SUCCESS_OFFBOARD_SELECTED);
    setSelectedInactive(new Set());
    active.reload();
    inactive.reload();
  };

  const offboardSelectedActive = async () => {
    const emails = Array.from(selectedActive);
    if (emails.length === 0) return;
    await postEmails(MANUAL_OFFBOARD_ENDPOINT, emails);
    alert(SUCCESS_OFFBOARD_SELECTED);
    setSelectedActive(new Set());
    active.reload();
    inactive.reload();
  };

  const onboardSelected = async () => {
    const emails = Array.from(selectedIncoming);
    if (emails.length === 0) return;
    await postEmails(MANUAL_ONBOARD_ENDPOINT, emails);
    alert(SUCCESS_ONBOARD_SELECTED);
    setSelectedIncoming(new Set());
    incoming.reload();
    active.reload();
  };

  const postRetentionCleanup = async () => {
    await fetch(POST_RETENTION_ENDPOINT);
    alert(SUCCESS_RETENTION);
  };

  const buildActiveActions = (emp: Employee): EllipsisAction[] => [
    {
      label: ACTION_OFFBOARD,
      color: 'red',
      onSelect: () => offboardOne(emp.email),
      confirm: {
        title: CONFIRM_OFFBOARD_TITLE,
        description: offboardConfirmDescription(emp.email),
      },
    },
  ];

  const buildIncomingActions = (emp: Employee): EllipsisAction[] => [
    {
      label: ACTION_ONBOARD_ONE,
      color: 'green',
      onSelect: () => onboardOne(emp.email),
      confirm: {
        title: CONFIRM_ONBOARD_TITLE,
        description: onboardConfirmDescription(emp.email),
      },
    },
  ];

  const buildInactiveActions = (emp: Employee): EllipsisAction[] => [
    {
      label: ACTION_RECOVER,
      color: 'green',
      onSelect: () => recoverOne(emp.email),
      confirm: {
        title: ACTION_RECOVER,
        description: recoverConfirmDescription(emp.email),
      },
    },
  ];

  return (
    <div className={PAGE_CONTAINER}>
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value={TAB_INCOMING}>{LABEL_INCOMING}</TabsTrigger>
          <TabsTrigger value={TAB_ACTIVE}>{LABEL_ACTIVE}</TabsTrigger>
          <TabsTrigger value={TAB_INACTIVE}>{LABEL_INACTIVE}</TabsTrigger>
        </TabsList>
        <TabsContent value={TAB_INCOMING}>
          <Card>
            <div className="space-y-4 p-4">
              {!incoming.loading && incoming.data.length > 0 && (
                <div className="flex justify-end">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button
                        variant="outline"
                        disabled={selectedIncoming.size === 0}
                      >
                        {BULK_ACTIONS_LABEL}
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        onSelect={() => void onboardSelected()}
                      >
                        {ACTION_ONBOARD_SELECTED}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              )}
              <EmployeeTable
                employees={incoming.data}
                loading={incoming.loading}
                buildActions={buildIncomingActions}
                selection={{
                  selectedEmails: selectedIncoming,
                  toggleEmail: incomingSelection.toggleEmail,
                  toggleAll: incomingSelection.toggleAll,
                }}
              />
            </div>
          </Card>
        </TabsContent>
        <TabsContent value={TAB_ACTIVE}>
          <Card>
            <div className="space-y-4 p-4">
              {!active.loading && active.data.length > 0 && (
                <div className="flex justify-end">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="outline">{BULK_ACTIONS_LABEL}</Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        color="red"
                        disabled={selectedActive.size === 0}
                        onSelect={() => void offboardSelectedActive()}
                      >
                        {ACTION_OFFBOARD_SELECTED}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => void syncData()}>
                        {ACTION_SYNC}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              )}
              {!active.loading && active.data.length === 0 ? (
                <Text size="2" color="gray">
                  {EMPTY_TEXT}
                </Text>
              ) : (
                <EmployeeTable
                  employees={active.data}
                  loading={active.loading}
                  buildActions={buildActiveActions}
                  selection={{
                    selectedEmails: selectedActive,
                    toggleEmail: activeSelection.toggleEmail,
                    toggleAll: activeSelection.toggleAll,
                  }}
                />
              )}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value={TAB_INACTIVE}>
          <Card>
            <div className="space-y-4 p-4">
              {!inactive.loading && inactive.data.length > 0 && (
                <div className="flex justify-end">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="outline">{BULK_ACTIONS_LABEL}</Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        disabled={selectedInactive.size === 0}
                        onSelect={() => void offboardSelected()}
                      >
                        {ACTION_OFFBOARD_SELECTED}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        color="red"
                        onSelect={() => void postRetentionCleanup()}
                      >
                        {ACTION_RETENTION}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              )}
              <EmployeeTable
                employees={inactive.data}
                loading={inactive.loading}
                buildActions={buildInactiveActions}
                selection={{
                  selectedEmails: selectedInactive,
                  toggleEmail: inactiveSelection.toggleEmail,
                  toggleAll: inactiveSelection.toggleAll,
                }}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
