import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';

const onboardIncomingEmployees = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  const incomingUsers =
    await handlerConfig.onboardUtilities.fetchIncomingEmployees();
  if (incomingUsers.length > 0) {
    handlerConfig.onboardUtilities.processIncomingEmployees(incomingUsers);
  }
};

export const OnboardHandler = {
  onboardIncomingEmployees,
};
