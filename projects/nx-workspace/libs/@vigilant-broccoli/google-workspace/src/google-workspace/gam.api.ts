function createCalendar(calendarOwnerEmail: string, calendarName: string) {
  return `gam user ${calendarOwnerEmail} create calendar summary "${calendarName}"`;
}

// function createCalendarEvent(
//   calendarId: string,
//   name: string,
//   startDate: string,
//   endDate: string,
//   attendees: string[],
// ) {
//   let cmd =
//     `gam calendar ${calendarId} add event summary ` +
//     `"${name}" ` +
//     `start "${startDate}" ` +
//     `end "${endDate}"`;

//   if (attendees && attendees.length > 0) {
//     cmd += ` selectattendees ${attendees.join(',')}`;
//   }
//   return cmd;
// }
function createCalendarEvent(
  calendarId: string,
  name: string,
  startDate: string,
  endDate: string,
  attendees: string[],
  allday?: boolean,
) {
  // helper to format yyyy-mm-dd
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  let cmd =
    `gam calendar ${calendarId} add event summary "${name}" ` +
    `start ${allday ? 'allday ' : ''}"${formattedStart}" ` +
    `end ${allday ? 'allday ' : ''}"${formattedEnd}"`;

  if (attendees && attendees.length > 0) {
    cmd += ` selectattendees ${attendees.join(',')}`;
  }

  return cmd;
}

function updateCalendarEvent(
  calendarId: string,
  calendarEventId: string,
  name: string,
) {
  return `gam calendar ${calendarId} update event id ${calendarEventId} summary "${name}"`;
}

function deleteCalendarEvent(calendarId: string, calendarEventId: string) {
  return `gam calendar ${calendarId} delete events id ${calendarEventId} doit`;
}

export const GamCommand = {
  getListOfEmailsOfOrganizationalUnit: (organizationalUnit: string): string =>
    `gam info org ${organizationalUnit} | grep -E -o "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" | sort`,
  setEmailSignature: (email: string, signaturePath: string): string =>
    `gam user '${email}' signature file '${signaturePath}'`,
  addEmailToGroup: (email: string, group: string): string =>
    `gam update group ${group} add member user ${email}`,
  updateEmailPassword: (email: string, password: string): string => {
    return `gam update user ${email} password ${password}`;
  },
  updateManager: (email: string, managerEmail: string): string =>
    `gam update user ${email} relation manager ${managerEmail}`,
  updateOrganization: (
    email: string,
    department: string,
    title: string,
    costCenter: string,
  ): string => {
    return `gam update user ${email} organization department "${department}" title "${title}" costCenter "${costCenter}" primary`;
  },
  addUserToOrganizationalUnit: (
    email: string,
    organizationalUnit: string,
  ): string => `gam update org ${organizationalUnit} add ${email}`,
  suspendEmail: (email: string): string =>
    `gam update user ${email} suspended on`,
  transferEmailDriveFilesToAnotherEmail: (
    fromEmail: string,
    toEmail: string,
  ): string =>
    `gam create datatransfer ${fromEmail} gdrive ${toEmail} privacy_level shared,private`,
  backupEmailsNewerThanNMonthsToLocalBackupFilepath: (
    email: string,
    backupFilepath: string,
    numberOfMonths: number,
    memoryLimit = 50,
  ): string =>
    `~/bin/gyb/gyb --email ${email} --action backup --local-folder ${backupFilepath} --spam-trash --search newer_than:${numberOfMonths}m --memory-limit ${memoryLimit} --service-account`,
  restoreEmailsFromBackup: (email: string, backupFilepath: string): string =>
    `~/bin/gyb/gyb --email ${email} --action restore --local-folder ${backupFilepath} --service-account`,
  deleteEmailAccount: (email: string): string => `gam delete user ${email}`,
  undeleteEmailAccount: (email: string): string => `gam undelete user ${email}`,
  getDriveFilesOlderThanStartTime: (email: string, startTime: Date): string => {
    return `gam user ${email} show filelist query "modifiedDate < '${getDateInISOFormat(
      startTime,
    )}'" id`;
  },
  deleteDriveFile: (email: string, id: string): string => {
    return `gam user ${email} delete drivefile ${id}`;
  },
  deleteEmailsOlderThanNMonths: (
    email: string,
    numberOfMonths: number,
  ): string =>
    `~/bin/gyb/gyb --email ${email} --action purge --spam-trash --search older_than:${numberOfMonths}m --service-account`,

  getListOfGroups: (): string => `gam print groups members`,
  getUsersInWorkspace: (): string => {
    return 'gam print users';
  },
  getUsersOrganizationData: (): string => {
    return 'gam print users organization';
  },
  getUsersCustomData: (): string => {
    return 'gam print users custom all';
  },
  batchExecute: (filepath: string): string => {
    return `~/bin/gam7/gam batch ${filepath}`;
  },
  updatePhoneNumber: (
    email: string,
    phoneNumberJsonFilepath: string,
  ): string => {
    return `gam update user ${email} json file '${phoneNumberJsonFilepath}'`;
  },
  createCalendar,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUserCalendars: (email: string) => {
    return `gam user ${email} show calendars`;
  },
  addCalendarToUser: (email: string, calendar: string) => {
    return `gam user ${email} add calendar ${calendar}`;
  },
  removeCalendarFromUser: (email: string, calendar: string) => {
    return `gam user ${email} delete calendar ${calendar}`;
  },
};

export function getDateInISOFormat(date: Date): string {
  return date.toISOString().split('T')[0] + 'T00:00:00';
}
