import {
  EmployeeHandlerService,
  EmployeeHandlerConfig,
} from '@vigilant-broccoli/employee-handler';

export const DEMO_CONFIG: EmployeeHandlerConfig = {
  onboardUtilities: {
    fetchIncomingEmployees: async () => [
      {
        email: 'onboardUser1@example.com',
        groups: [],
        password: 'password',
        organizationalUnit: 'unit',
      },
      {
        email: 'onboardUser2@example.com',
        groups: [],
        password: 'password',
        organizationalUnit: 'unit',
      },
    ],
    processIncomingEmployees: async users => {
      console.log('Onboarding users:', users);
    },
  },
  activeMaintenanceUtilities: {
    fetchEmailSignatures: async () => [
      {
        email: 'alice.johnson@example.com',
        signatureString: '<p>Alice Johnson - Software Engineer</p>',
      },
      {
        email: 'bob.williams@example.com',
        signatureString: '<p>Bob Williams - Product Manager</p>',
      },
    ],
    processEmailSignatures: async signatures => {
      console.log('updatesdfasdf');
      console.log('Updating email signatures:', signatures);
    },
    emailZippedSignatures: async attachments => {
      console.log('Sending zipped email signatures:', attachments);
    },
    recoverUsers: async emails => {
      console.log('Recovering users:', emails);
    },
    syncData: async () => {
      console.log('Performing data tasks.');
    },
    useSignatureCaching: true,
  },
  offboardUtilities: {
    fetchInactiveEmployees: async () => [
      'offboardUser1@example.com',
      'offboardUser2@example.com',
    ],
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

(async () => {
  try {
    await EmployeeHandlerService.handleInput(
      DEMO_CONFIG,
      'onboardIncomingEmployees',
    );

    await EmployeeHandlerService.handleInput(
      DEMO_CONFIG,
      'applyEmailSignatureUpdates',
    );
    await EmployeeHandlerService.handleInput(DEMO_CONFIG, 'syncData');

    await EmployeeHandlerService.handleInput(
      DEMO_CONFIG,
      'offboardInactiveEmployees',
    );
    await EmployeeHandlerService.handleInput(
      DEMO_CONFIG,
      'postRetentionCleanup',
    );
  } catch (err) {
    console.error('Error occurred:', err);
  }
})();
