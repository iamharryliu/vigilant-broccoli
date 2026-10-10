import {
  apiPath,
  EMPLOYEE_HANDLER_ROUTES,
  type Employee,
} from '@vigilant-broccoli/employee-handler/contract';

export const EMPLOYEE_TAB = {
  INCOMING: 'incoming',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type EmployeeTab = (typeof EMPLOYEE_TAB)[keyof typeof EMPLOYEE_TAB];

export const EMPLOYEE_TAB_LABEL_KEY = {
  [EMPLOYEE_TAB.INCOMING]: 'EMPLOYEES.TAB.INCOMING',
  [EMPLOYEE_TAB.ACTIVE]: 'EMPLOYEES.TAB.ACTIVE',
  [EMPLOYEE_TAB.INACTIVE]: 'EMPLOYEES.TAB.INACTIVE',
} as const;

export const EMPLOYEE_METADATA_ENDPOINT = apiPath(
  EMPLOYEE_HANDLER_ROUTES.employeesMetadata,
);

export type { Employee };

export const displayName = (e: Employee): string => {
  const name = [e.firstName, e.lastName].filter(Boolean).join(' ').trim();
  return name || '—';
};
