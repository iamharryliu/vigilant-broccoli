'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Text,
} from '@vigilant-broccoli/react-lib';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { authFetchOk } from '../../../lib/api-helpers';
import { useAction } from '../../../lib/use-action';
import { useTranslation } from '../../i18n';
import {
  displayName,
  EMPLOYEE_METADATA_ENDPOINT,
  EMPLOYEE_TAB_LABEL_KEY,
  type Employee,
  type EmployeeTab,
} from './employees.shared';

const DRAWER_CLASS =
  'left-auto right-0 top-0 h-dvh max-w-md translate-x-0 translate-y-0 overflow-y-auto rounded-none data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:rounded-none';
const FIELD_CLASS = 'flex flex-col gap-1';
const LINK_CLASS = 'text-sm text-blue-600 underline break-all';

const METADATA_FIELDS = [
  { key: 'githubUrl', labelKey: 'EMPLOYEES.DRAWER.GITHUB' },
  { key: 'linkedInURL', labelKey: 'EMPLOYEES.DRAWER.LINKEDIN' },
  { key: 'resumeUrl', labelKey: 'EMPLOYEES.DRAWER.RESUME' },
] as const;

type MetadataKey = (typeof METADATA_FIELDS)[number]['key'];
type MetadataForm = Record<MetadataKey, string>;

const toForm = (employee: Employee): MetadataForm => ({
  githubUrl: employee.githubUrl ?? '',
  linkedInURL: employee.linkedInURL ?? '',
  resumeUrl: employee.resumeUrl ?? '',
});

type EmployeeDrawerProps = {
  employee: Employee | null;
  tab: EmployeeTab;
  onClose: () => void;
  onSaved: () => void;
};

export const EmployeeDrawer = ({
  employee,
  tab,
  onClose,
  onSaved,
}: EmployeeDrawerProps) => {
  const { t } = useTranslation();
  const { running, run } = useAction();
  const [form, setForm] = useState<MetadataForm>(toForm({ email: '' }));

  useEffect(() => {
    if (employee) setForm(toForm(employee));
  }, [employee]);

  const save = () => {
    if (!employee) return;
    return run(
      async () => {
        await authFetchOk(EMPLOYEE_METADATA_ENDPOINT, {
          method: HTTP_METHOD.PATCH,
          headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
          body: JSON.stringify({ email: employee.email, ...form }),
        });
        onSaved();
      },
      {
        success: t('EMPLOYEES.SUCCESS.METADATA_SAVED'),
        error: t('EMPLOYEES.ERROR.METADATA_SAVE_FAILED'),
      },
    );
  };

  return (
    <Dialog open={!!employee} onOpenChange={open => !open && onClose()}>
      <DialogContent className={DRAWER_CLASS}>
        {employee && (
          <>
            <DialogHeader>
              <DialogTitle>{displayName(employee)}</DialogTitle>
              <DialogDescription>
                {t('EMPLOYEES.DRAWER.TITLE')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className={FIELD_CLASS}>
                <Text size="1" weight="medium">
                  {t('EMPLOYEES.COL.EMAIL')}
                </Text>
                <Text size="2">{employee.email}</Text>
              </div>
              <div className={FIELD_CLASS}>
                <Text size="1" weight="medium">
                  {t('EMPLOYEES.DRAWER.STATUS')}
                </Text>
                <Badge>{t(EMPLOYEE_TAB_LABEL_KEY[tab])}</Badge>
              </div>
              <div className="space-y-3">
                <Text size="2" weight="medium">
                  {t('EMPLOYEES.DRAWER.METADATA')}
                </Text>
                {METADATA_FIELDS.map(({ key, labelKey }) => (
                  <div key={key} className={FIELD_CLASS}>
                    <Text size="1" weight="medium">
                      {t(labelKey)}
                    </Text>
                    {employee[key] ? (
                      <a
                        href={employee[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                      >
                        {employee[key]}
                      </a>
                    ) : (
                      <Text size="2" color="gray">
                        {t('EMPLOYEES.DRAWER.NOT_SET')}
                      </Text>
                    )}
                    <Input
                      type="url"
                      aria-label={t(labelKey)}
                      placeholder={t('EMPLOYEES.DRAWER.URL_PLACEHOLDER')}
                      value={form[key]}
                      onChange={e =>
                        setForm(prev => ({ ...prev, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <Button disabled={running} onClick={() => void save()}>
                  {t('EMPLOYEES.DRAWER.SAVE')}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
