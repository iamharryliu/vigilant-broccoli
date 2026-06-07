import { EmployeeHandlerConfig } from '../employee-handler.models';
import { SignatureTemplate } from '../signature-templates/signature-templates.store';

const COMPANY_DOMAIN = 'company.com';
const COMPANY_NAME = 'Company Name';
const COMPANY_WEBSITE = 'https://www.company.com';

export const MOCK_DEFAULT_TEMPLATES: SignatureTemplate[] = [
  {
    id: 'standard',
    label: 'Standard',
    template: `<div style="font-family: Arial, sans-serif; color: #333;">
  <p style="margin: 0; font-size: 15px;"><strong>{{name}}</strong></p>
  <p style="margin: 4px 0; font-size: 13px;">
    <a href="mailto:{{email}}" style="color: #0073e6; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 4px 0; font-size: 13px; color: #666;">${COMPANY_NAME} | <a href="${COMPANY_WEBSITE}" style="color: #0073e6; text-decoration: none;">${COMPANY_WEBSITE.replace(/^https?:\/\//, '')}</a></p>
</div>`,
  },
  {
    id: 'neon',
    label: 'Neon',
    template: `<div style="font-family: 'Courier New', monospace; background: #0d0d0d; color: #00ff99; padding: 12px 16px; border-radius: 6px; display: inline-block;">
  <p style="margin: 0; font-size: 15px; color: #00ff99;">▶ <strong>{{name}}</strong></p>
  <p style="margin: 4px 0; font-size: 12px;">
    <a href="mailto:{{email}}" style="color: #00ccff; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 4px 0; font-size: 11px; color: #555;">${COMPANY_NAME}</p>
</div>`,
  },
  {
    id: 'retro',
    label: 'Retro',
    template: `<div style="font-family: 'Georgia', serif; border: 2px solid #c8a96e; background: #fdf6e3; padding: 12px 16px; display: inline-block; border-radius: 2px;">
  <p style="margin: 0; font-size: 16px; color: #5c3d1e; letter-spacing: 1px;"><strong>{{name}}</strong></p>
  <p style="margin: 6px 0 2px; font-size: 12px; color: #8a6a3a; text-transform: uppercase; letter-spacing: 2px;">${COMPANY_NAME}</p>
  <p style="margin: 4px 0; font-size: 12px; border-top: 1px solid #c8a96e; padding-top: 6px;">
    <a href="mailto:{{email}}" style="color: #c0392b; text-decoration: none;">{{email}}</a>
  </p>
</div>`,
  },
  {
    id: 'gradient',
    label: 'Gradient',
    template: `<div style="font-family: Arial, sans-serif; padding: 12px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: inline-block; color: white;">
  <p style="margin: 0; font-size: 16px; font-weight: bold; color: white;">{{name}}</p>
  <p style="margin: 4px 0; font-size: 12px; opacity: 0.85;">
    <a href="mailto:{{email}}" style="color: #d4f1ff; text-decoration: none;">{{email}}</a>
  </p>
  <p style="margin: 4px 0; font-size: 11px; opacity: 0.7; color: white;">${COMPANY_NAME}</p>
</div>`,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    template: `<div style="font-family: Arial, sans-serif; color: #333; font-size: 13px; border-left: 2px solid #ddd; padding-left: 10px;">
  <strong style="font-size: 14px;">{{name}}</strong><br/>
  <a href="mailto:{{email}}" style="color: #888; text-decoration: none; font-size: 12px;">{{email}}</a>
</div>`,
  },
];

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
