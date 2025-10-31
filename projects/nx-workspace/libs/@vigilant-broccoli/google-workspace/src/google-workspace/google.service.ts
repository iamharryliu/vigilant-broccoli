import path from 'path';
import { GamCommand } from './gam.api';
import { EMAIL_BACKUP_DIRECTORY } from './google.consts';
import {
  GoogleBatchCommandPayload,
  WorkspaceEmailSignatureUpdate,
  WorkspaceManagerUpdate,
  WorkspacePhoneNumberUpdate,
  GoogleUserOrganization,
  IncomingUser,
  GoogleBatchCommandFactory,
  WorkspaceCalendarAdd,
  WorkspaceCalendarEvent,
  WorkspaceCalendar,
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

const batchUpdateGroups = async (
  users: IncomingUser[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = users
    .map(user =>
      user.groups.map(group => GamCommand.addEmailToGroup(user.email, group)),
    )
    .flat();
  return { commands };
};

const batchUpdateManagers = async (
  updates: WorkspaceManagerUpdate[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = updates.map(update =>
    GamCommand.updateManager(update.email, update.managerEmail),
  );
  return { commands };
};

const batchUpdatePasswords = async (
  users: IncomingUser[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = users.map(user =>
    GamCommand.updateEmailPassword(user.email, user.password),
  );
  return { commands };
};

const batchUpdateOrganizationalUnitCommand = async (
  users: IncomingUser[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = users.map(user =>
    GamCommand.addUserToOrganizationalUnit(user.email, user.organizationalUnit),
  );
  return { commands };
};

async function batchUpdateSignatures(
  signatures: WorkspaceEmailSignatureUpdate[],
): Promise<GoogleBatchCommandPayload> {
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
}

const batchUpdatePhoneNumbers = async (
  updates: WorkspacePhoneNumberUpdate[],
): Promise<GoogleBatchCommandPayload> => {
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
): Promise<GoogleBatchCommandPayload> => {
  const commands = emails.map(email => GamCommand.suspendEmail(email));
  return { commands };
};

const batchTransferDrives = async (
  emails: string[],
  restoreEmail: string,
): Promise<GoogleBatchCommandPayload> => {
  const commands = emails.map(email =>
    GamCommand.transferEmailDriveFilesToAnotherEmail(email, restoreEmail),
  );
  return { commands };
};

const batchRecoverEmailAccounts = async (
  emails: string[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = emails.map(email => GamCommand.undeleteEmailAccount(email));
  return { commands };
};

const batchDeleteEmailAccounts = async (
  emails: string[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = emails.map(email => GamCommand.deleteEmailAccount(email));
  return { commands };
};

const batchAddUserToCalendar = async (
  updates: WorkspaceCalendarAdd[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = updates.map(update =>
    GamCommand.addCalendarToUser(update.email, update.calendarId),
  );
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

function formatGoogleBatchOperation<T>(
  batchCommand: (args: T) => Promise<GoogleBatchCommandPayload>,
  args: T,
): GoogleBatchCommandFactory<T> {
  return {
    batchCommand,
    args,
  };
}

function getBatchUpdateGroupCommands(
  updates: IncomingUser[],
): GoogleBatchCommandFactory<IncomingUser[]> {
  return formatGoogleBatchOperation(batchUpdateGroups, updates);
}

function getBatchUpdatePasswordCommands(
  updates: IncomingUser[],
): GoogleBatchCommandFactory<IncomingUser[]> {
  return formatGoogleBatchOperation(batchUpdatePasswords, updates);
}

function getBatchUpdateOrganizationalUnitCommands(
  updates: IncomingUser[],
): GoogleBatchCommandFactory<IncomingUser[]> {
  return formatGoogleBatchOperation(
    batchUpdateOrganizationalUnitCommand,
    updates,
  );
}

function getBatchUpdateManagerCommands(
  updates: WorkspaceManagerUpdate[],
): GoogleBatchCommandFactory<WorkspaceManagerUpdate[]> {
  return formatGoogleBatchOperation(batchUpdateManagers, updates);
}

function getBatchUpdateEmailSignatureCommands(
  updates: WorkspaceEmailSignatureUpdate[],
): GoogleBatchCommandFactory<WorkspaceEmailSignatureUpdate[]> {
  return formatGoogleBatchOperation(batchUpdateSignatures, updates);
}

function getBatchUpdatePhoneNumberCommands(
  updates: WorkspacePhoneNumberUpdate[],
): GoogleBatchCommandFactory<WorkspacePhoneNumberUpdate[]> {
  return formatGoogleBatchOperation(batchUpdatePhoneNumbers, updates);
}

function getBatchAddUsersToCalendarCommands(
  updates: WorkspaceCalendarAdd[],
): GoogleBatchCommandFactory<WorkspaceCalendarAdd[]> {
  return formatGoogleBatchOperation(batchAddUserToCalendar, updates);
}

async function createCalendar(
  calendarOwnerEmail: string,
  calendarName: string,
): Promise<string> {
  const createCalendarCommand = GamCommand.createCalendar(
    calendarOwnerEmail,
    calendarName,
  );
  const res = await runGamReadCommand(createCalendarCommand);
  const match = res.match(/Calendar:\s*([^,]+)/);
  if (!match) {
    throw new Error('Failed to extract calendar ID from response');
  }
  const calendarId = match[1].trim();
  return calendarId;
}

async function createCalendarEvent(
  calendarId: string,
  name: string,
  startDate: string,
  endDate: string,
  attendees: string[],
  allday?: boolean,
): Promise<string> {
  function parseEventId(logLine: string): string | null {
    const match = logLine.match(/Event:\s*([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
  const createCalendarCommand = GamCommand.createCalendarEvent(
    calendarId,
    name,
    startDate,
    endDate,
    attendees,
    allday,
  );
  const res = await runGamReadCommand(createCalendarCommand);
  const calendarEventId = parseEventId(res);
  if (!calendarEventId) {
    throw new Error('Failed to extract calendar event ID from response');
  }
  return calendarEventId;
}

async function batchCreateCalendarEvent(
  events: WorkspaceCalendarEvent[],
): Promise<GoogleBatchCommandPayload> {
  const commands = events.map(event =>
    GamCommand.createCalendarEvent(
      event.id,
      event.name,
      event.startDate,
      event.endDate,
      event.attendees,
    ),
  );
  return { commands };
}

const batchCreateCalendar = async (
  items: WorkspaceCalendar[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = items.map(item =>
    GamCommand.createCalendar(item.calendarOwnerEmail, item.name),
  );
  return { commands };
};

const batchUpdateCalendarEvent = async (
  items: {
    calendarId: string;
    calendarEventId: string;
    name: string;
  }[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = items.map(item =>
    GamCommand.updateCalendarEvent(
      item.calendarId,
      item.calendarEventId,
      item.name,
    ),
  );
  return { commands };
};

const batchDeleteCalendarEvent = async (
  items: {
    calendarId: string;
    calendarEventId: string;
  }[],
): Promise<GoogleBatchCommandPayload> => {
  const commands = items.map(item =>
    GamCommand.deleteCalendarEvent(item.calendarId, item.calendarEventId),
  );
  return { commands };
};

function getBatchCreateCalendarCommands(calendars: WorkspaceCalendar[]) {
  return formatGoogleBatchOperation(batchCreateCalendar, calendars);
}

function getBatchCreateCalendarEventCommands(events: WorkspaceCalendarEvent[]) {
  return formatGoogleBatchOperation(batchCreateCalendarEvent, events);
}

function getBatchUpdateCalendarEventCommands(
  events: {
    calendarId: string;
    calendarEventId: string;
    name: string;
  }[],
) {
  return formatGoogleBatchOperation(batchUpdateCalendarEvent, events);
}

function getBatchDeleteCalendarEventCommands(
  events: {
    calendarId: string;
    calendarEventId: string;
  }[],
) {
  return formatGoogleBatchOperation(batchDeleteCalendarEvent, events);
}

export const GoogleService = {
  // CREATE
  createCalendar,
  createCalendarEvent,
  getBatchCreateCalendarCommands,
  getBatchCreateCalendarEventCommands,
  // READ
  getMembersOfOrganizationalUnit,
  getEmailsInWorkspace,
  getEmployeesOrganizationData,
  // UPDATE
  getBatchUpdateGroupCommands,
  getBatchUpdatePasswordCommands,
  getBatchUpdateOrganizationalUnitCommands,
  getBatchUpdateManagerCommands,
  getBatchUpdateEmailSignatureCommands,
  getBatchUpdatePhoneNumberCommands,
  getBatchAddUsersToCalendarCommands,
  getBatchUpdateCalendarEventCommands,
  // DELETE
  getBatchDeleteCalendarEventCommands,
  // Offboard
  batchSuspendEmails,
  batchDeleteEmailAccounts,
  // Retention
  batchTransferDrives,
  backupMultipleEmailAccountEmailsToAnotherEmail,
  // Post-Retention
  deleteEmailsOlderThanNMonths,
  deleteDriveFilesOlderThanNMonths,
  batchRecoverEmailAccounts,
};
