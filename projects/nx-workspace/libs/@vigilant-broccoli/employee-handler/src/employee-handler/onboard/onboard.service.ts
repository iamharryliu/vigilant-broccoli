import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';

export const onboardIncomingEmployees = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  const incomingUsers =
    await handlerConfig.onboardUtilities.getIncomingEmployees();
  if (incomingUsers.length > 0) {
    handlerConfig.onboardUtilities.onboardUsers(incomingUsers);
  }
};
