import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';

export const postRetentionCleanup = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  await handlerConfig.postRetentionUtilities.postRetentionCleanup();
};
