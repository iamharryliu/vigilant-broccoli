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
  toast,
  type EllipsisAction,
} from '@vigilant-broccoli/react-lib';
import { Card, DropdownMenu, Text } from '@radix-ui/themes';
import { authFetchOk, postEmails } from '../../../lib/api-helpers';
import { useAction } from '../../../lib/use-action';
import { useTranslation } from '../../i18n';

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
  const { t } = useTranslation();
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    authFetchOk(endpoint)
      .then(res => res.json())
      .then(json => setData(normalizeList(json)))
      .catch(() => toast.error(t('EMPLOYEES.ERROR.LOAD_FAILED')))
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
  actionsDisabled?: boolean;
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
  actionsDisabled,
  buildActions,
  selection,
}: EmployeeTableProps) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Text size="2" color="gray">
        {t('COMMON.LOADING')}
      </Text>
    );
  }
  if (employees.length === 0) {
    return (
      <Text size="2" color="gray">
        {t('EMPLOYEES.EMPTY')}
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
                  aria-label={t('EMPLOYEES.SELECT_ALL')}
                />
              </th>
            )}
            <th className={TH_CLASS}>{t('EMPLOYEES.COL.NAME')}</th>
            <th className={TH_CLASS}>{t('EMPLOYEES.COL.EMAIL')}</th>
            <th className={TH_CLASS}>{t('EMPLOYEES.COL.ACTIONS')}</th>
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
                      aria-label={t('EMPLOYEES.SELECT_ROW')}
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
                      <EllipsisCTA
                        actions={actions}
                        disabled={actionsDisabled}
                      />
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

const requireEmail = (email: string, errorMessage: string) => {
  if (!email) {
    toast.error(errorMessage);
    return false;
  }
  return true;
};

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const tab = searchParams.get(TAB_QUERY_KEY) ?? TAB_ACTIVE;
  const { running, run } = useAction();

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

  const offboardOne = (email: string) => {
    if (!requireEmail(email, t('EMPLOYEES.ERROR.NO_EMAILS'))) return;
    return run(
      async () => {
        await postEmails(MANUAL_OFFBOARD_ENDPOINT, [email]);
        active.reload();
        inactive.reload();
      },
      { success: t('EMPLOYEES.SUCCESS.OFFBOARD_ONE') },
    );
  };

  const recoverOne = (email: string) => {
    if (!requireEmail(email, t('EMPLOYEES.ERROR.NO_EMAILS'))) return;
    return run(
      async () => {
        await postEmails(RECOVER_ENDPOINT, [email]);
        active.reload();
        inactive.reload();
      },
      { success: t('EMPLOYEES.SUCCESS.RECOVER') },
    );
  };

  const onboardOne = (email: string) => {
    if (!requireEmail(email, t('EMPLOYEES.ERROR.NO_EMAILS'))) return;
    return run(
      async () => {
        await postEmails(MANUAL_ONBOARD_ENDPOINT, [email]);
        incoming.reload();
        active.reload();
      },
      { success: t('EMPLOYEES.SUCCESS.ONBOARD_ONE') },
    );
  };

  const syncData = () =>
    run(
      async () => {
        await authFetchOk(SYNC_ENDPOINT);
        active.reload();
      },
      { success: t('EMPLOYEES.SUCCESS.SYNC') },
    );

  const offboardSelected = () => {
    const emails = Array.from(selectedInactive);
    if (emails.length === 0) return;
    return run(
      async () => {
        await postEmails(MANUAL_OFFBOARD_ENDPOINT, emails);
        setSelectedInactive(new Set());
        active.reload();
        inactive.reload();
      },
      { success: t('EMPLOYEES.SUCCESS.OFFBOARD_SELECTED') },
    );
  };

  const offboardSelectedActive = () => {
    const emails = Array.from(selectedActive);
    if (emails.length === 0) return;
    return run(
      async () => {
        await postEmails(MANUAL_OFFBOARD_ENDPOINT, emails);
        setSelectedActive(new Set());
        active.reload();
        inactive.reload();
      },
      { success: t('EMPLOYEES.SUCCESS.OFFBOARD_SELECTED') },
    );
  };

  const onboardSelected = () => {
    const emails = Array.from(selectedIncoming);
    if (emails.length === 0) return;
    return run(
      async () => {
        await postEmails(MANUAL_ONBOARD_ENDPOINT, emails);
        setSelectedIncoming(new Set());
        incoming.reload();
        active.reload();
      },
      { success: t('EMPLOYEES.SUCCESS.ONBOARD_SELECTED') },
    );
  };

  const postRetentionCleanup = () =>
    run(
      async () => {
        await authFetchOk(POST_RETENTION_ENDPOINT);
      },
      { success: t('EMPLOYEES.SUCCESS.RETENTION') },
    );

  const buildActiveActions = (emp: Employee): EllipsisAction[] => [
    {
      label: t('EMPLOYEES.ACTION.OFFBOARD'),
      color: 'red',
      onSelect: () => offboardOne(emp.email),
      confirm: {
        title: t('EMPLOYEES.CONFIRM.OFFBOARD_TITLE'),
        description: t('EMPLOYEES.CONFIRM.OFFBOARD_DESCRIPTION', {
          email: emp.email,
        }),
      },
    },
  ];

  const buildIncomingActions = (emp: Employee): EllipsisAction[] => [
    {
      label: t('EMPLOYEES.ACTION.ONBOARD'),
      color: 'green',
      onSelect: () => onboardOne(emp.email),
      confirm: {
        title: t('EMPLOYEES.CONFIRM.ONBOARD_TITLE'),
        description: t('EMPLOYEES.CONFIRM.ONBOARD_DESCRIPTION', {
          email: emp.email,
        }),
      },
    },
  ];

  const buildInactiveActions = (emp: Employee): EllipsisAction[] => [
    {
      label: t('EMPLOYEES.ACTION.RECOVER'),
      color: 'green',
      onSelect: () => recoverOne(emp.email),
      confirm: {
        title: t('EMPLOYEES.ACTION.RECOVER'),
        description: t('EMPLOYEES.CONFIRM.RECOVER_DESCRIPTION', {
          email: emp.email,
        }),
      },
    },
  ];

  return (
    <div className={PAGE_CONTAINER}>
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value={TAB_INCOMING}>
            {t('EMPLOYEES.TAB.INCOMING')}
          </TabsTrigger>
          <TabsTrigger value={TAB_ACTIVE}>
            {t('EMPLOYEES.TAB.ACTIVE')}
          </TabsTrigger>
          <TabsTrigger value={TAB_INACTIVE}>
            {t('EMPLOYEES.TAB.INACTIVE')}
          </TabsTrigger>
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
                        disabled={selectedIncoming.size === 0 || running}
                      >
                        {t('EMPLOYEES.BULK_ACTIONS')}
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        disabled={running}
                        onSelect={() => void onboardSelected()}
                      >
                        {t('EMPLOYEES.ACTION.ONBOARD_SELECTED')}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              )}
              <EmployeeTable
                employees={incoming.data}
                loading={incoming.loading}
                actionsDisabled={running}
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
                      <Button variant="outline" disabled={running}>
                        {t('EMPLOYEES.BULK_ACTIONS')}
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        color="red"
                        disabled={selectedActive.size === 0 || running}
                        onSelect={() => void offboardSelectedActive()}
                      >
                        {t('EMPLOYEES.ACTION.OFFBOARD_SELECTED')}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        disabled={running}
                        onSelect={() => void syncData()}
                      >
                        {t('EMPLOYEES.ACTION.SYNC')}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              )}
              {!active.loading && active.data.length === 0 ? (
                <Text size="2" color="gray">
                  {t('EMPLOYEES.EMPTY')}
                </Text>
              ) : (
                <EmployeeTable
                  employees={active.data}
                  loading={active.loading}
                  actionsDisabled={running}
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
                      <Button variant="outline" disabled={running}>
                        {t('EMPLOYEES.BULK_ACTIONS')}
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        disabled={selectedInactive.size === 0 || running}
                        onSelect={() => void offboardSelected()}
                      >
                        {t('EMPLOYEES.ACTION.OFFBOARD_SELECTED')}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        color="red"
                        disabled={running}
                        onSelect={() => void postRetentionCleanup()}
                      >
                        {t('EMPLOYEES.ACTION.RETENTION')}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              )}
              <EmployeeTable
                employees={inactive.data}
                loading={inactive.loading}
                actionsDisabled={running}
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
