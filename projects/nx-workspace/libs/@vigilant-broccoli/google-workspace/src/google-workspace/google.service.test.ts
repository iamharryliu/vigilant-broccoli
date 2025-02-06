import { GoogleService } from './google.service';
import { getDateInISOFormat, runGAMReadCommand } from './gam.api';
import { ShellUtils } from '@vigilant-broccoli/common-node';

jest.mock('@vigilant-broccoli/common-node');
jest.mock('./gam.api', () => {
  return {
    ...jest.requireActual('./gam.api'),
    runGAMReadCommand: jest.fn(),
  };
});

const MOCK = {
  NUMBER_OF_MONTHS_OF_RETENTION: 6,
  POST_RETENTION_EMAIL: 'test@email.com',
};

describe('google.service', () => {
  test('deleteDriveFilesOlderThanNMonths', async () => {
    const today = new Date();
    const startOfRetentionPeriod = new Date();
    startOfRetentionPeriod.setDate(
      today.getDate() - MOCK.NUMBER_OF_MONTHS_OF_RETENTION * 30,
    );
    const mockDriveFileList =
      'Owner,id\nowner@example.com,12345\nowner@example.com,67890';
    (ShellUtils.runUpdateShellCommand as jest.Mock).mockResolvedValue(
      mockDriveFileList,
    );
    const getDriveFilesCommand = `gam user ${
      MOCK.POST_RETENTION_EMAIL
    } show filelist query "modifiedDate < '${getDateInISOFormat(
      startOfRetentionPeriod,
    )}'" id`;
    await GoogleService.deleteDriveFilesOlderThanNMonths(
      MOCK.POST_RETENTION_EMAIL,
      MOCK.NUMBER_OF_MONTHS_OF_RETENTION,
    );
    expect(runGAMReadCommand).toHaveBeenCalledWith(getDriveFilesCommand);
  });

  test('deleteEmailsOlderThanNMonths', async () => {
    console.log(
      await GoogleService.deleteEmailsOlderThanNMonths(
        MOCK.POST_RETENTION_EMAIL,
        MOCK.NUMBER_OF_MONTHS_OF_RETENTION,
      ),
    );
    expect('t').toEqual('t');
    await GoogleService.deleteEmailsOlderThanNMonths(
      MOCK.POST_RETENTION_EMAIL,
      MOCK.NUMBER_OF_MONTHS_OF_RETENTION,
    );
    const expectedCommand = `~/bin/gyb/gyb --email ${MOCK.POST_RETENTION_EMAIL} --action purge --spam-trash --search older_than:${MOCK.NUMBER_OF_MONTHS_OF_RETENTION}m --service-account`;
    expect(ShellUtils.runUpdateShellCommand).toHaveBeenCalledWith(
      expectedCommand,
    );
  });
});
