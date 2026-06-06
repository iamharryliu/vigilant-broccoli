'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  CardContainer,
  CopyButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EllipsisCTA,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type EllipsisAction,
} from '@vigilant-broccoli/react-lib';
import { Text } from '@radix-ui/themes';
import {
  ERR_NO_EMAILS,
  parseEmails,
  postEmails,
} from '../../../lib/api-helpers';

const INCOMING_ENDPOINT = '/api/employees/incoming';
const ACTIVE_ENDPOINT = '/api/employees/active';
const INACTIVE_ENDPOINT = '/api/employees/inactive';
const MANUAL_OFFBOARD_ENDPOINT = '/api/offboard/manualOffboard';
const RECOVER_ENDPOINT = '/api/recover';
const ONBOARD_ENDPOINT = '/api/onboard';
const OFFBOARD_ENDPOINT = '/api/offboard';
const POST_RETENTION_ENDPOINT = '/api/postRetentionCleanup';
const SYNC_ENDPOINT = '/api/sync';

const ONBOARD_CARD_TITLE = 'Onboard incoming employees';
const ONBOARD_CARD_DESCRIPTION =
  'Provisions accounts for new employees based on the configured roster.';
const ACTION_ONBOARD = 'Onboard Incoming Employees';
const SUCCESS_ONBOARD = 'Onboarded incoming employees';

const TAB_INCOMING = 'incoming';
const TAB_ACTIVE = 'active';
const TAB_INACTIVE = 'inactive';

const LABEL_INCOMING = 'Incoming';
const LABEL_ACTIVE = 'Active';
const LABEL_INACTIVE = 'Inactive';

const PAGE_HEADING = 'Employees';
const LOADING_TEXT = 'Loading...';
const EMPTY_TEXT = 'No employees';
const COL_NAME = 'Name';
const COL_EMAIL = 'Email';
const COL_ACTIONS = 'Actions';
const ACTION_OFFBOARD = 'Offboard';
const ACTION_RECOVER = 'Recover account';
const CONFIRM_OFFBOARD_TITLE = 'Offboard employee';
const offboardConfirmDescription = (email: string) =>
  `Offboard ${email}? This will deactivate the account.`;
const recoverConfirmDescription = (email: string) =>
  `Recover the account for ${email}?`;
const SUCCESS_OFFBOARD_ONE = 'Employee offboarded';
const SUCCESS_RECOVER = 'Account recovered';
const SUCCESS_OFFBOARD_INACTIVE = 'Offboarded inactive employees';
const SUCCESS_MANUAL = 'Manually offboarded employees';
const SUCCESS_RETENTION = 'Post-retention cleanup complete';

const ACTION_MANUAL_OFFBOARD = 'Manual Offboard';
const MANUAL_OFFBOARD_TITLE = 'Manual offboard';
const MANUAL_OFFBOARD_DESCRIPTION =
  'Offboard specific employees by email. Comma-separated.';
const MANUAL_OFFBOARD_PLACEHOLDER = 'alice@example.com, bob@example.com';
const ACTION_CANCEL = 'Cancel';

const ACTION_OFFBOARD_INACTIVE = 'Offboard Inactive Employees';
const ACTION_RETENTION = 'Post-Retention Cleanup';
const ACTION_SYNC = 'Sync Data';
const SUCCESS_SYNC = 'Sync complete';

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
};

const EmployeeTable = ({
  employees,
  loading,
  buildActions,
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

  return (
    <div className={TABLE_WRAPPER}>
      <table className={TABLE_CLASS}>
        <thead>
          <tr>
            <th className={TH_CLASS}>{COL_NAME}</th>
            <th className={TH_CLASS}>{COL_EMAIL}</th>
            <th className={TH_CLASS}>{COL_ACTIONS}</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => {
            const actions = buildActions?.(emp);
            return (
              <tr key={emp.email}>
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

type ManualOffboardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const ManualOffboardModal = ({
  open,
  onOpenChange,
  onSuccess,
}: ManualOffboardModalProps) => {
  const [emailInput, setEmailInput] = useState('');

  const handleSubmit = async () => {
    const emails = parseEmails(emailInput);
    if (emails.length === 0) {
      alert(ERR_NO_EMAILS);
      return;
    }
    await postEmails(MANUAL_OFFBOARD_ENDPOINT, emails);
    alert(SUCCESS_MANUAL);
    setEmailInput('');
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MANUAL_OFFBOARD_TITLE}</DialogTitle>
        </DialogHeader>
        <Text size="2" color="gray">
          {MANUAL_OFFBOARD_DESCRIPTION}
        </Text>
        <Textarea
          placeholder={MANUAL_OFFBOARD_PLACEHOLDER}
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          rows={3}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {ACTION_CANCEL}
          </Button>
          <Button variant="destructive" onClick={handleSubmit}>
            {ACTION_MANUAL_OFFBOARD}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? TAB_ACTIVE;

  const incoming = useEmployeesTab(INCOMING_ENDPOINT);
  const active = useEmployeesTab(ACTIVE_ENDPOINT);
  const inactive = useEmployeesTab(INACTIVE_ENDPOINT);
  const [manualOffboardOpen, setManualOffboardOpen] = useState(false);

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
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

  const onboardAll = async () => {
    await fetch(ONBOARD_ENDPOINT);
    alert(SUCCESS_ONBOARD);
    incoming.reload();
    active.reload();
  };

  const syncData = async () => {
    await fetch(SYNC_ENDPOINT);
    alert(SUCCESS_SYNC);
    active.reload();
  };

  const offboardInactive = async () => {
    await fetch(OFFBOARD_ENDPOINT);
    alert(SUCCESS_OFFBOARD_INACTIVE);
    active.reload();
    inactive.reload();
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
      <Text size="6" weight="bold">
        {PAGE_HEADING}
      </Text>
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value={TAB_INCOMING}>{LABEL_INCOMING}</TabsTrigger>
          <TabsTrigger value={TAB_ACTIVE}>{LABEL_ACTIVE}</TabsTrigger>
          <TabsTrigger value={TAB_INACTIVE}>{LABEL_INACTIVE}</TabsTrigger>
        </TabsList>
        <TabsContent value={TAB_INCOMING}>
          <div className="space-y-4">
            {!incoming.loading && incoming.data.length > 0 && (
              <CardContainer title={ONBOARD_CARD_TITLE}>
                <Text size="2" color="gray">
                  {ONBOARD_CARD_DESCRIPTION}
                </Text>
                <div>
                  <Button onClick={onboardAll}>{ACTION_ONBOARD}</Button>
                </div>
              </CardContainer>
            )}
            <EmployeeTable
              employees={incoming.data}
              loading={incoming.loading}
            />
          </div>
        </TabsContent>
        <TabsContent value={TAB_ACTIVE}>
          <div className="space-y-4">
            <Button variant="outline" onClick={syncData}>
              {ACTION_SYNC}
            </Button>
            {!active.loading && active.data.length === 0 ? (
              <Text size="2" color="gray">
                {EMPTY_TEXT}
              </Text>
            ) : (
              <EmployeeTable
                employees={active.data}
                loading={active.loading}
                buildActions={buildActiveActions}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value={TAB_INACTIVE}>
          <div className="space-y-4">
            {!inactive.loading && inactive.data.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={offboardInactive}>
                  {ACTION_OFFBOARD_INACTIVE}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setManualOffboardOpen(true)}
                >
                  {ACTION_MANUAL_OFFBOARD}
                </Button>
                <Button variant="destructive" onClick={postRetentionCleanup}>
                  {ACTION_RETENTION}
                </Button>
              </div>
            )}
            <EmployeeTable
              employees={inactive.data}
              loading={inactive.loading}
              buildActions={buildInactiveActions}
            />
          </div>
        </TabsContent>
      </Tabs>
      <ManualOffboardModal
        open={manualOffboardOpen}
        onOpenChange={setManualOffboardOpen}
        onSuccess={() => {
          active.reload();
          inactive.reload();
        }}
      />
    </div>
  );
}
