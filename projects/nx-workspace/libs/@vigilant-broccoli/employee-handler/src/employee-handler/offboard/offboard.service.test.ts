import { MOCK_EMPLOYEE_HANDLER_CONFIG } from '../mocks/mocks.const';
import { OffboardHandler } from './offboard.service';
import { OffboardUtilities } from '../employee-handler.models';

jest.mock('../mocks/mocks.const', () => ({
  MOCK_EMPLOYEE_HANDLER_CONFIG: {
    offboardUtilities: {
      fetchInactiveEmployees: jest.fn(),
      processInactiveEmployees: jest.fn(),
    } as OffboardUtilities,
  },
}));

describe('manualOffboardEmails', () => {
  const mockProcessArgv = (emails: string[]): void => {
    process.argv = ['', 'node', 'script.js', ...emails];
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log a warning and return if no emails are provided', async () => {
    mockProcessArgv([]);

    await OffboardHandler.manualOffboardEmails(MOCK_EMPLOYEE_HANDLER_CONFIG);

    expect(
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities.processInactiveEmployees,
    ).not.toHaveBeenCalled();
  });

  it('should offboard provided emails and log performance', async () => {
    const emails = ['test1@example.com', 'test2@example.com'];
    mockProcessArgv(emails);
    (
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities
        .fetchInactiveEmployees as jest.Mock
    ).mockResolvedValueOnce(true);

    await OffboardHandler.manualOffboardEmails(MOCK_EMPLOYEE_HANDLER_CONFIG);

    expect(
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities.processInactiveEmployees,
    ).toHaveBeenCalled();
  });

  it('should log an error if offboarding fails and rethrow the error', async () => {
    const emails = ['test1@example.com'];
    const error = new Error('Offboarding error');
    mockProcessArgv(emails);
    (
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities
        .processInactiveEmployees as jest.Mock
    ).mockRejectedValueOnce(error);

    await expect(
      OffboardHandler.manualOffboardEmails(MOCK_EMPLOYEE_HANDLER_CONFIG),
    ).rejects.toThrow(error);
  });
});
