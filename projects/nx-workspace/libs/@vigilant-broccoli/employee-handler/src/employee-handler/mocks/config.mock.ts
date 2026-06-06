import { EmployeeHandlerConfig } from '../employee-handler.models';

const COMPANY_DOMAIN = 'company.com';
const COMPANY_NAME = 'Company Name';
const COMPANY_WEBSITE = 'https://www.company.com';

const INCOMING_COUNT = 4;
const ACTIVE_COUNT = 8;
const INACTIVE_COUNT = 3;

const TITLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Engineering Manager',
  'Product Designer',
  'Product Manager',
  'Data Analyst',
  'Customer Success Manager',
  'Recruiter',
];
const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'People', 'Data'];
const OFFICES = ['Toronto', 'New York', 'Remote — EU'];

type EmployeeStatus = 'incoming' | 'active' | 'inactive';

type MockEmployee = {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department: string;
  office: string;
  phoneNumber: string;
};

const pick = <T>(arr: T[], index: number): T => arr[index % arr.length];

const slug = (firstName: string, lastName: string) =>
  `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '');

const generateEmployees = (
  status: EmployeeStatus,
  count: number,
): MockEmployee[] =>
  Array.from({ length: count }, (_, i) => {
    const firstName = status[0].toUpperCase() + status.slice(1);
    const lastName = `Employee${i + 1}`;
    return {
      firstName,
      lastName,
      email: `${slug(firstName, lastName)}@${COMPANY_DOMAIN}`,
      title: pick(TITLES, i),
      department: pick(DEPARTMENTS, i),
      office: pick(OFFICES, i),
      phoneNumber: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i * 7).padStart(4, '0')}`,
    };
  });

const employeesByEmail = new Map<string, MockEmployee>();
const incomingEmails = new Set<string>();
const activeEmails = new Set<string>();
const inactiveEmails = new Set<string>();

const seedStatus = (
  status: EmployeeStatus,
  set: Set<string>,
  count: number,
) => {
  for (const employee of generateEmployees(status, count)) {
    employeesByEmail.set(employee.email, employee);
    set.add(employee.email);
  }
};

seedStatus('incoming', incomingEmails, INCOMING_COUNT);
seedStatus('active', activeEmails, ACTIVE_COUNT);
seedStatus('inactive', inactiveEmails, INACTIVE_COUNT);

const setStatus = (email: string, target: EmployeeStatus) => {
  incomingEmails.delete(email);
  activeEmails.delete(email);
  inactiveEmails.delete(email);
  if (target === 'incoming') incomingEmails.add(email);
  if (target === 'active') activeEmails.add(email);
  if (target === 'inactive') inactiveEmails.add(email);
};

const listByStatus = (set: Set<string>): MockEmployee[] => {
  const out: MockEmployee[] = [];
  for (const email of set) {
    const record = employeesByEmail.get(email);
    if (record) out.push(record);
  }
  return out;
};

const buildSignature = (employee: MockEmployee): string =>
  `<div style="font-family: Arial, sans-serif; color: #333;">
  <p style="margin: 0; font-size: 16px;"><strong>${employee.firstName} ${employee.lastName}</strong></p>
  <p style="margin: 4px 0; font-size: 13px;">
    <a href="mailto:${employee.email}" style="color: #0073e6; text-decoration: none;">${employee.email}</a>
  </p>
  <p style="margin: 4px 0; font-size: 13px; color: #666;">${COMPANY_NAME} | <a href="${COMPANY_WEBSITE}" style="color: #0073e6; text-decoration: none;">${COMPANY_WEBSITE.replace(/^https?:\/\//, '')}</a></p>
</div>`;

const GLOBAL_OVERRIDES_KEY = '__employeeHandlerSignatureOverrides__';
type GlobalWithOverrides = typeof globalThis & {
  [GLOBAL_OVERRIDES_KEY]?: Map<string, string>;
};
const globalScope = globalThis as GlobalWithOverrides;
const signatureTemplateOverrides: Map<string, string> =
  globalScope[GLOBAL_OVERRIDES_KEY] ??
  (globalScope[GLOBAL_OVERRIDES_KEY] = new Map<string, string>());

const generateMockSignatures = (employees: MockEmployee[]) =>
  employees.map(employee => {
    const template = signatureTemplateOverrides.get(employee.email);
    const signatureString = template
      ? template
          .split('{{name}}')
          .join(`${employee.firstName} ${employee.lastName}`.trim())
          .split('{{email}}')
          .join(employee.email)
      : buildSignature(employee);
    return { ...employee, signatureString };
  });

const extractEmail = (input: unknown): string | null => {
  if (typeof input === 'string') return input;
  if (input && typeof input === 'object' && 'email' in input) {
    const value = (input as { email: unknown }).email;
    if (typeof value === 'string') return value;
  }
  return null;
};

export const EMPLOYEE_HANDLER_CONFIG_MOCK: EmployeeHandlerConfig = {
  onboardUtilities: {
    fetchIncomingEmployees: async () => listByStatus(incomingEmails),
    processIncomingEmployees: async users => {
      const emails = users.map(extractEmail).filter((e): e is string => !!e);
      for (const email of emails) {
        if (!employeesByEmail.has(email)) continue;
        setStatus(email, 'active');
      }
      console.log('Onboarded users:', emails.join(', '));
    },
  },
  activeMaintenanceUtilities: {
    fetchEmailSignatures: async () =>
      generateMockSignatures(listByStatus(activeEmails)),
    processEmailSignatures: async signatures => {
      for (const { email, signatureString } of signatures) {
        signatureTemplateOverrides.set(email, signatureString);
      }
    },
    emailAttachments: async (attachments, receivers) => {
      console.log(
        `Sending attachments to ${receivers.join(', ')}: \n${attachments
          .map(attachment => attachment.filename)
          .join('\n')}`,
      );
    },
    recoverUsers: async emails => {
      for (const email of emails) {
        if (!employeesByEmail.has(email)) continue;
        setStatus(email, 'active');
      }
      console.log('Recovered users:', emails.join(', '));
    },
    syncData: async () => {
      console.log('Performing sync tasks.');
    },
    useSignatureCaching: false,
  },
  offboardUtilities: {
    fetchInactiveEmployees: async () => Array.from(inactiveEmails),
    processInactiveEmployees: async emails => {
      for (const email of emails) {
        if (!employeesByEmail.has(email)) continue;
        setStatus(email, 'inactive');
      }
      console.log('Offboarded employees:', emails.join(', '));
    },
  },
  postRetentionUtilities: {
    postRetentionCleanup: async () => {
      const purged = Array.from(inactiveEmails);
      for (const email of purged) {
        inactiveEmails.delete(email);
        employeesByEmail.delete(email);
      }
      console.log('Post-retention cleanup purged:', purged.join(', '));
    },
  },
  customFunctions: {
    customFunctionExample: async (...args) => {
      console.log('Running custom function with args:', args);
    },
  },
};
