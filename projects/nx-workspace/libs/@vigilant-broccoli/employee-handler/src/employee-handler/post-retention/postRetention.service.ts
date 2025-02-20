import { EmployeeHandlerConfig } from '../../employee-handler/employee-handler.models';

const postRetentionCleanup = async (
  handlerConfig: EmployeeHandlerConfig,
): Promise<void> => {
  await handlerConfig.postRetentionUtilities.postRetentionCleanup();
};

export const PostRetentionHandler = {
  postRetentionCleanup,
};
