import path from 'path';
import { GamCommand } from './gam.api';
import { EMAIL_BACKUP_DIRECTORY } from './google.consts';
import {
  GoogleBatchOperation,
  EmailSignature,
  GoogleManagerUpdate,
  GooglePhoneNumberUpdate,
  GoogleUserOrganization,
  IncomingUser,
} from './google.model';
import { runGamReadCommand } from './google.utils';
import {
  FileSystemUtils,
  ShellUtils,
  TMP_PATH,
} from '@vigilant-broccoli/common-node';

const getEmailBackupFilepath = (email: string): string => {
  return path.resolve(EMAIL_BACKUP_DIRECTORY, email);
};

const restoreBackupToEmail = async (
  backupFilepath: string,
  retentionEmail: string,
): Promise<void> => {
  const restoreCommand = GamCommand.restoreEmailsFromBackup(
    retentionEmail,
    backupFilepath,
  );
  await ShellUtils.runUpdateShellCommand(restoreCommand);
};

const backupEmailsToLocalBackupFilepath = async (
  email: string,
  backupFilepath: string,
  months: number,
): Promise<void> => {
  const backupCommand =
    GamCommand.backupEmailsNewerThanNMonthsToLocalBackupFilepath(
      email,
      backupFilepath,
      months,
    );
  await ShellUtils.runUpdateShellCommand(backupCommand);
};

const backupEmailAccountEmailsToAnotherEmail = async (
  fromEmail: string,
  toEmail: string,
  months: number,
): Promise<void> => {
  const backupFilepath = getEmailBackupFilepath(fromEmail);
  FileSystemUtils.makedirectory(backupFilepath);
  await backupEmailsToLocalBackupFilepath(fromEmail, backupFilepath, months);
  await restoreBackupToEmail(backupFilepath, toEmail);
  await FileSystemUtils.deletePath(backupFilepath);
};

const backupMultipleEmailAccountEmailsToAnotherEmail = async (
  emailAccounts: string[],
  storageEmail: string,
  months: number,
): Promise<void> => {
  for (const email of emailAccounts) {
    await backupEmailAccountEmailsToAnotherEmail(email, storageEmail, months);
  }
};

const batchAddUserToAssociatedGroups = async (
  users: IncomingUser[],
): Promise<GoogleBatchOperation> => {
  const commands = users
    .map(user =>
      user.groups.map(group => GamCommand.addEmailToGroup(user.email, group)),
    )
    .flat();
  return { commands };
};

const batchUpdateManagers = async (
  updates: GoogleManagerUpdate[],
): Promise<GoogleBatchOperation> => {
  const commands = updates.map(update =>
    GamCommand.updateManager(update.email, update.managerEmail),
  );
  return { commands };
};

const batchUpdateUserPasswords = async (
  users: IncomingUser[],
): Promise<GoogleBatchOperation> => {
  const commands = users.map(user =>
    GamCommand.updateEmailPassword(user.email, user.password),
  );
  return { commands };
};

const batchAddUsersToOrganizationalUnitCommand = async (
  users: IncomingUser[],
): Promise<GoogleBatchOperation> => {
  const commands = users.map(user =>
    GamCommand.addUserToOrganizationalUnit(user.email, user.organizationalUnit),
  );
  return { commands };
};

const batchUpdateSignatures = async (
  signatures: EmailSignature[],
): Promise<GoogleBatchOperation> => {
  const TMP_DIR = path.resolve(TMP_PATH, 'update-email-signatures');
  const commands = await Promise.all(
    signatures.map(async signature => {
      const updateFilename = `update-email-${signature.email}.html`;
      const updateFilepath = path.resolve(TMP_DIR, updateFilename);
      await FileSystemUtils.writeFile(
        updateFilepath,
        signature.signatureString,
      );
      return GamCommand.setEmailSignature(signature.email, updateFilepath);
    }),
  );
  return { commands, assetsDirectory: TMP_DIR };
};

const batchUpdatePhoneNumbers = async (
  updates: GooglePhoneNumberUpdate[],
): Promise<GoogleBatchOperation> => {
  const TMP_DIR = path.resolve(TMP_PATH, 'update-phone-numbers');
  const commands = await Promise.all(
    updates.map(async update => {
      const updateFilename = `email-update-${update.email}.json`;
      const updateFilepath = path.resolve(TMP_DIR, updateFilename);
      await FileSystemUtils.writeJSON(updateFilepath, update.data);
      return GamCommand.updatePhoneNumber(update.email, updateFilepath);
    }),
  );
  return { commands, assetsDirectory: TMP_DIR };
};

const batchSuspendEmails = async (
  emails: string[],
): Promise<GoogleBatchOperation> => {
  const commands = emails.map(email => GamCommand.suspendEmail(email));
  return { commands };
};

const batchTransferDrives = async (
  emails: string[],
  restoreEmail: string,
): Promise<GoogleBatchOperation> => {
  const commands = emails.map(email =>
    GamCommand.transferEmailDriveFilesToAnotherEmail(email, restoreEmail),
  );
  return { commands };
};

const batchRecoverEmailAccounts = async (
  emails: string[],
): Promise<GoogleBatchOperation> => {
  const commands = emails.map(email => GamCommand.undeleteEmailAccount(email));
  return { commands };
};

const batchDeleteEmailAccounts = async (
  emails: string[],
): Promise<GoogleBatchOperation> => {
  const commands = emails.map(email => GamCommand.deleteEmailAccount(email));
  return { commands };
};

const deleteDriveFilesOlderThanNMonths = async (
  retentionEmail: string,
  months: number,
): Promise<string[]> => {
  const today = new Date();
  const startOfRetentionPeriod = new Date();
  startOfRetentionPeriod.setDate(today.getDate() - months * 30);
  const getDriveFilesCommand = GamCommand.getDriveFilesOlderThanStartTime(
    retentionEmail,
    startOfRetentionPeriod,
  );
  const data = await runGamReadCommand(getDriveFilesCommand);
  const commands = String(data)
    .split('\n')
    .reduce((commands: string[], line) => {
      if (!line || line === 'Owner,id') {
        return commands;
      }
      const id = line.split(',')[1];
      const command = GamCommand.deleteDriveFile(retentionEmail, id);
      commands.push(command);
      return commands;
    }, []);
  return commands;
};

const deleteEmailsOlderThanNMonths = async (
  email: string,
  months: number,
): Promise<void> => {
  const command = GamCommand.deleteEmailsOlderThanNMonths(email, months);
  await ShellUtils.runUpdateShellCommand(command);
};

const getMembersOfOrganizationalUnit = async (
  organizationalUnit: string,
): Promise<string[]> => {
  const command =
    GamCommand.getListOfEmailsOfOrganizationalUnit(organizationalUnit);
  const data = await runGamReadCommand(command);
  const emails = String(data)
    .split('\n')
    .filter(item => !item.includes('Got ') && item !== '');
  return emails;
};

const getEmailsInWorkspace = async (): Promise<string[]> => {
  const command = GamCommand.getUsersInWorkspace();
  return String(await runGamReadCommand(command))
    .split('\n')
    .filter(line => line.includes('@'));
};

const getEmployeesOrganizationData = async (): Promise<
  GoogleUserOrganization[]
> => {
  const data = (await runGamReadCommand(GamCommand.getUsersOrganizationData()))
    .split('\n')
    .map(line => line.split(','));
  const emailIndex = data[0].indexOf('primaryEmail');
  const titleIndex = data[0].indexOf('organizations.0.title');
  const departmentIndex = data[0].indexOf('organizations.0.department');
  const costCenterIndex = data[0].indexOf('organizations.0.costCenter');
  const descriptionIndex = data[0].indexOf('organizations.0.description');

  return data.slice(1).map(fields => {
    return {
      email: fields[emailIndex],
      title: fields[titleIndex],
      department: fields[departmentIndex],
      costCenter: fields[costCenterIndex],
      description: fields[descriptionIndex],
    };
  });
};

export const GoogleService = {
  batchAddUserToAssociatedGroups,
  batchUpdateUserPasswords,
  batchUpdatePhoneNumbers,
  batchUpdateManagers,
  batchAddUsersToOrganizationalUnitCommand,
  batchSuspendEmails,
  batchTransferDrives,
  backupMultipleEmailAccountEmailsToAnotherEmail,
  batchDeleteEmailAccounts,
  batchUpdateSignatures,
  deleteDriveFilesOlderThanNMonths,
  deleteEmailsOlderThanNMonths,
  getMembersOfOrganizationalUnit,
  getEmailsInWorkspace,
  batchRecoverEmailAccounts,
  getEmployeesOrganizationData,
};
