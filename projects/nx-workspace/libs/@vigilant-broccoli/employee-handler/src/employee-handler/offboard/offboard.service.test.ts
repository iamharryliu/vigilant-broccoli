import type { Mock } from 'vitest';
import { EMPLOYEE_HANDLER_CONFIG_MOCK } from '../mocks/config.mock';
import { OffboardHandler } from './offboard.service';
import { OffboardUtilities } from '../employee-handler.models';

vi.mock('../mocks/config.mock', () => ({
  EMPLOYEE_HANDLER_CONFIG_MOCK: {
    offboardUtilities: {
      fetchInactiveEmployees: vi.fn(),
      processInactiveEmployees: vi.fn(),
    } as OffboardUtilities,
  },
}));

describe('manualOffboardEmails', () => {
  const mockProcessArgv = (emails: string[]): void => {
    process.argv = ['', 'node', 'script.js', ...emails];
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log a warning and return if no emails are provided', async () => {
    mockProcessArgv([]);

    await OffboardHandler.manualOffboardEmails(EMPLOYEE_HANDLER_CONFIG_MOCK);

    expect(
      EMPLOYEE_HANDLER_CONFIG_MOCK.offboardUtilities.processInactiveEmployees,
    ).not.toHaveBeenCalled();
  });

  it('should offboard emails', async () => {
    const emails = ['test1@example.com', 'test2@example.com'];
    mockProcessArgv(emails);
    (
      EMPLOYEE_HANDLER_CONFIG_MOCK.offboardUtilities
        .fetchInactiveEmployees as Mock
    ).mockResolvedValueOnce(true);

    await OffboardHandler.manualOffboardEmails(EMPLOYEE_HANDLER_CONFIG_MOCK);

    expect(
      EMPLOYEE_HANDLER_CONFIG_MOCK.offboardUtilities.processInactiveEmployees,
    ).toHaveBeenCalled();
  });

  it('should log an error if offboarding fails and rethrow the error', async () => {
    const emails = ['test1@example.com'];
    const error = new Error('Offboarding error');
    mockProcessArgv(emails);
    (
      EMPLOYEE_HANDLER_CONFIG_MOCK.offboardUtilities
        .processInactiveEmployees as Mock
    ).mockRejectedValueOnce(error);

    await expect(
      OffboardHandler.manualOffboardEmails(EMPLOYEE_HANDLER_CONFIG_MOCK),
    ).rejects.toThrow(error);
  });
});
