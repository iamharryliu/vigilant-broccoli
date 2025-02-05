import { MOCK_EMPLOYEE_HANDLER_CONFIG } from '../mocks/mocks.const';
import { manualOffboardEmails } from './offboard.service';

jest.mock('../mocks/mocks.const', () => ({
  MOCK_EMPLOYEE_HANDLER_CONFIG: {
    offboardUtilities: {
      offboardEmployees: jest.fn(),
    },
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

    await manualOffboardEmails(MOCK_EMPLOYEE_HANDLER_CONFIG);

    expect(
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities.offboardEmployees,
    ).not.toHaveBeenCalled();
  });

  it('should offboard provided emails and log performance', async () => {
    const emails = ['test1@example.com', 'test2@example.com'];
    mockProcessArgv(emails);
    (
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities
        .offboardEmployees as jest.Mock
    ).mockResolvedValueOnce(true);

    await manualOffboardEmails(MOCK_EMPLOYEE_HANDLER_CONFIG);

    expect(
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities.offboardEmployees,
    ).toHaveBeenCalled();
  });

  it('should log an error if offboarding fails and rethrow the error', async () => {
    const emails = ['test1@example.com'];
    const error = new Error('Offboarding error');
    mockProcessArgv(emails);
    (
      MOCK_EMPLOYEE_HANDLER_CONFIG.offboardUtilities
        .offboardEmployees as jest.Mock
    ).mockRejectedValueOnce(error);

    await expect(
      manualOffboardEmails(MOCK_EMPLOYEE_HANDLER_CONFIG),
    ).rejects.toThrow(error);
  });
});
