import {
  offboardInactiveEmployees,
  manualOffboardEmails,
} from './offboard/offboard.service';
import { onboardIncomingEmployees } from './onboard/onboard.service';
import { postRetentionCleanup } from './post-retention/postRetention.service';
import {
  emailZippedSignatures,
  generateLocalSignatures,
  manualRecoverUsers,
  syncData,
  applyEmailSignatureUpdates,
} from './active-maintenance/active-maintenance.service';
import { EmployeeHandlerConfig } from './employee-handler.models';

const handleInput = async (
  configuration: EmployeeHandlerConfig,
  command: string,
): Promise<void> => {
  const COMMAND =
    (EmployeeHandlerService[command]
      ? EmployeeHandlerService[command]
      : undefined) ||
    (configuration.customFunctions && configuration.customFunctions[command]
      ? configuration.customFunctions[command]
      : undefined);
  if (COMMAND) {
    try {
      await COMMAND(configuration);
    } catch (error) {
      throw `Script(${command}) failed with following error:\n${error}`;
    }
  } else {
    throw 'Invalid command.';
  }
};

const OnboardHandler = {
  onboardIncomingEmployees,
};

const ActiveMaintenanceHandler = {
  applyEmailSignatureUpdates,
  generateLocalSignatures,
  emailZippedSignatures,
  manualRecoverUsers,
  syncData,
};

const OffboardHandler = {
  offboardInactiveEmployees,
  manualOffboardEmails,
};

const PostRetentionhandler = {
  postRetentionCleanup,
};

export const EmployeeHandlerService = {
  handleInput,
  ...OnboardHandler,
  ...ActiveMaintenanceHandler,
  ...OffboardHandler,
  ...PostRetentionhandler,
};
