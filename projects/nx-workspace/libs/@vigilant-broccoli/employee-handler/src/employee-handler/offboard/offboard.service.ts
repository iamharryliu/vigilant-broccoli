import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';

export async function offboardInactiveEmployees(
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> {
  const emails = await handlerConfig.offboardUtilities.getOffboardEmails();
  if (emails.length > 0) {
    await handlerConfig.offboardUtilities.offboardEmployees(emails);
  }
}

export const manualOffboardEmails = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  const emails = process.argv.slice(3);
  if (emails.length === 0) {
    console.warn('No emails provided.');
    return;
  }
  await handlerConfig.offboardUtilities.offboardEmployees(emails);
};

export const recoverUser = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  const emails = process.argv.slice(3);
  if (emails.length === 0) {
    console.warn('No emails provided.');
    return;
  }
  await handlerConfig.activeMaintenanceUtilities.recoverUsers(emails);
};
