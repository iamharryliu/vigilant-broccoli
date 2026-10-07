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

export const EMPLOYEE_METADATA_ENDPOINT = '/api/employees/metadata';

export type Employee = {
  email: string;
  firstName?: string;
  lastName?: string;
  githubUrl?: string;
  linkedInURL?: string;
  resumeUrl?: string;
};

export const displayName = (e: Employee): string => {
  const name = [e.firstName, e.lastName].filter(Boolean).join(' ').trim();
  return name || '—';
};
