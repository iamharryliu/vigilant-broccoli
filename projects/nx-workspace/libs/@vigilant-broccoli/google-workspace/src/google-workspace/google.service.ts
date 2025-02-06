import path from 'path';
import { GAMCommand, runGAMReadCommand } from './gam.api';
import { EMAIL_BACKUP_DIRECTORY } from './google.consts';
import {
  EmailSignature,
  GoogleUserOrganization,
  IncomingUser,
} from './google.model';
import { FileSystemUtils, ShellUtils } from '@vigilant-broccoli/common-node';
import { getEmailSignatureFilepath } from './google.utils';

const getEmailBackupFilepath = (email: string): string => {
  return path.resolve(EMAIL_BACKUP_DIRECTORY, email);
};

const restoreBackupToEmail = async (
  backupFilepath: string,
  retentionEmail: string,
): Promise<void> => {
  const restoreCommand = GAMCommand.restoreEmailsFromBackup(
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
    GAMCommand.backupEmailsNewerThanNMonthsToLocalBackupFilepath(
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
): Promise<string[]> => {
  const commands = users
    .map(user =>
      user.groups.map(group => GAMCommand.addEmailToGroup(user.email, group)),
    )
    .flat();
  return commands;
};

const batchUpdateUserPasswords = async (
  users: IncomingUser[],
): Promise<string[]> => {
  const commands = users.map(user =>
    GAMCommand.updateEmailPassword(user.email, user.password),
  );
  return commands;
};

const batchAddUsersToOrganizationalUnitCommand = async (
  users: IncomingUser[],
): Promise<string[]> => {
  const commands = users.map(user =>
    GAMCommand.addUserToOrganizationalUnit(user.email, user.organizationalUnit),
  );
  return commands;
};

const batchUpdateSignatures = async (
  signatures: EmailSignature[],
): Promise<string[]> => {
  const commands = await Promise.all(
    signatures.map(async signature => {
      const emailSignatureFilepath = getEmailSignatureFilepath(signature.email);
      await FileSystemUtils.writeFile(
        emailSignatureFilepath,
        signature.signatureString,
      );
      return GAMCommand.setEmailSignature(
        signature.email,
        emailSignatureFilepath,
      );
    }),
  );
  return commands;
};

const batchSuspendEmails = async (emails: string[]): Promise<string[]> => {
  const commands = emails.map(email => GAMCommand.suspendEmail(email));
  return commands;
};

const batchTransferDrives = async (
  emails: string[],
  restoreEmail: string,
): Promise<string[]> => {
  const commands = emails.map(email =>
    GAMCommand.transferEmailDriveFilesToAnotherEmail(email, restoreEmail),
  );
  return commands;
};

const batchRecoverEmailAccounts = async (
  emails: string[],
): Promise<string[]> => {
  const commands = emails.map(email => GAMCommand.undeleteEmailAccount(email));
  return commands;
};

const batchDeleteEmailAccounts = async (
  emails: string[],
): Promise<string[]> => {
  const commands = emails.map(email => GAMCommand.deleteEmailAccount(email));
  return commands;
};

const deleteDriveFilesOlderThanNMonths = async (
  retentionEmail: string,
  months: number,
): Promise<string[]> => {
  const today = new Date();
  const startOfRetentionPeriod = new Date();
  startOfRetentionPeriod.setDate(today.getDate() - months * 30);
  const getDriveFilesCommand = GAMCommand.getDriveFilesOlderThanStartTime(
    retentionEmail,
    startOfRetentionPeriod,
  );
  const data = await runGAMReadCommand(getDriveFilesCommand);
  const commands = String(data)
    .split('\n')
    .reduce((commands: string[], line) => {
      if (!line || line === 'Owner,id') {
        return commands;
      }
      const id = line.split(',')[1];
      const command = GAMCommand.deleteDriveFile(retentionEmail, id);
      commands.push(command);
      return commands;
    }, []);
  return commands;
};

const deleteEmailsOlderThanNMonths = async (
  email: string,
  months: number,
): Promise<void> => {
  const command = GAMCommand.deleteEmailsOlderThanNMonths(email, months);
  await ShellUtils.runUpdateShellCommand(command);
};

const getMembersOfOrganizationalUnit = async (
  organizationalUnit: string,
): Promise<string[]> => {
  const command =
    GAMCommand.getListOfEmailsOfOrganizationalUnit(organizationalUnit);
  const data = await runGAMReadCommand(command);
  const emails = String(data)
    .split('\n')
    .filter(item => !item.includes('Got ') && item !== '');
  return emails;
};

const getEmailsInWorkspace = async (): Promise<string[]> => {
  const command = GAMCommand.getUsersInWorkspace();
  return String(await runGAMReadCommand(command))
    .split('\n')
    .filter(line => line.includes('@'));
};

const getEmployeesOrganizationData = async (): Promise<
  GoogleUserOrganization[]
> => {
  const data = (await runGAMReadCommand(GAMCommand.getUsersOrganizationData()))
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
