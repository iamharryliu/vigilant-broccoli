import { EmployeeHandlerConfig } from '../employee-handler.models';

const MOCK_ONBOARDING_USERS = ['onboard1@email.com', 'onboard2@email.com'];
const MOCK_EMPLOYEES = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com' },
];

const generateMockSignatures = (
  employees: { firstName: string; lastName: string; email: string }[],
) => {
  return employees.map(employee => ({
    ...employee,
    signatureString: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p style="margin: 0; font-size: 14px;"><strong>Best regards,</strong></p>
        <p style="margin: 4px 0; font-size: 16px;"><strong>${employee.firstName} ${employee.lastName}</strong></p>
        <p style="margin: 4px 0; font-size: 14px;">
          <a href="mailto:${employee.email}" style="color: #0073e6; text-decoration: none;">${employee.email}</a>
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #666;">Company Name | <a href="https://www.company.com" style="color: #0073e6; text-decoration: none;">www.company.com</a></p>
      </div>
    `.trim(),
  }));
};

export const EMPLOYEE_HANDLER_CONFIG_MOCK: EmployeeHandlerConfig = {
  onboardUtilities: {
    fetchIncomingEmployees: async () => MOCK_ONBOARDING_USERS,
    processIncomingEmployees: async users => {
      console.log('Onboarding users:', users);
    },
  },
  activeMaintenanceUtilities: {
    fetchEmailSignatures: async () => generateMockSignatures(MOCK_EMPLOYEES),
    processEmailSignatures: async signatures => {
      console.log(
        'Updating email signatures for the following users',
        signatures.map(signature => signature.email),
      );
    },
    emailZippedSignatures: async attachments => {
      console.log('Sending zipped email signatures:', attachments);
    },
    recoverUsers: async emails => {
      console.log('Recovering users:', emails);
    },
    useSignatureCaching: false,
  },
  offboardUtilities: {
    fetchInactiveEmployees: async () =>
      MOCK_EMPLOYEES.map(employee => employee.email),
    processInactiveEmployees: async emails => {
      console.log('Offboarding employees:', emails);
    },
  },
  postRetentionUtilities: {
    postRetentionCleanup: async () => {
      console.log('Performing post-retention cleanup tasks.');
    },
  },
  customFunctions: {
    customFunctionExample: async (...args) => {
      console.log('Running custom function with args:', args);
    },
  },
};
