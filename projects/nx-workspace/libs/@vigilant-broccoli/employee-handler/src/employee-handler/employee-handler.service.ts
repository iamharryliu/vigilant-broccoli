import { ActiveMaintenanceHandler } from './active-maintenance/active-maintenance.service';
import { EmployeeHandlerConfig } from './employee-handler.models';
import { OffboardHandler } from './offboard/offboard.service';
import { OnboardHandler } from './onboard/onboard.service';
import { PostRetentionHandler } from './post-retention/postRetention.service';

const handleInput = async (
  configuration: EmployeeHandlerConfig,
): Promise<void> => {
  const [, , command] = process.argv;
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

export const EmployeeHandlerService = {
  handleInput,
  ...OnboardHandler,
  ...ActiveMaintenanceHandler,
  ...OffboardHandler,
  ...PostRetentionHandler,
};
