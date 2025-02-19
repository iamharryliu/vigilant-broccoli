import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';

export async function offboardInactiveEmployees(
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> {
  const emails = await handlerConfig.offboardUtilities.fetchInactiveEmployees();
  if (emails.length > 0) {
    await handlerConfig.offboardUtilities.processInactiveEmployees(emails);
  }
}

export const manualOffboardEmails = async (
  handlerConfig: EmployeeHandlerConfig,
  emails = process.argv.slice(3),
): Promise<void> => {
  if (emails.length === 0) {
    console.warn('No emails provided.');
    return;
  }
  await handlerConfig.offboardUtilities.processInactiveEmployees(emails);
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
