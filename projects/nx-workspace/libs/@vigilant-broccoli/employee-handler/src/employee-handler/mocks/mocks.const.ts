import { EmployeeHandlerConfig } from '../employee-handler.models';

export const MOCK_EMPLOYEE_HANDLER_CONFIG: EmployeeHandlerConfig = {
  onboardUtilities: {
    getIncomingEmployees: async () => [],
    onboardUsers: async users => {
      console.log('Onboarding users:', users);
    },
  },
  activeMaintenanceUtilities: {
    getEmployeeSignatures: async () => [],
    updateEmailSignatures: async signatures => {
      console.log('Updating email signatures:', signatures);
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
    getOffboardEmails: async () => [
      'johndoe@example.com',
      'janesmith@example.com',
    ],
    offboardEmployees: async emails => {
      console.log('Offboarding employees:', emails);
    },
  },
  postRetentionUtilities: {
    postRetentionCleanup: async () => {
      console.log('Performing post-retention cleanup');
    },
  },
  customFunctions: {
    customFunctionExample: async (...args) => {
      console.log('Running custom function with args:', args);
    },
  },
};
