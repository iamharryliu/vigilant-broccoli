import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';

const offboardInactiveEmployees = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  const emails = await handlerConfig.offboardUtilities.fetchInactiveEmployees();
  if (emails.length > 0) {
    await handlerConfig.offboardUtilities.processInactiveEmployees(emails);
  }
};

const manualOffboardEmails = async (
  handlerConfig: EmployeeHandlerConfig,
  emails = process.argv.slice(3),
): Promise<void> => {
  if (emails.length === 0) {
    console.warn('No emails provided.');
    return;
  }
  await handlerConfig.offboardUtilities.processInactiveEmployees(emails);
};

export const OffboardHandler = {
  offboardInactiveEmployees,
  manualOffboardEmails,
};
