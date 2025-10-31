import { getEnvironmentVariable } from '../utils';

export const DEFAULT_TEXT_MESSAGE = {
  body: 'Default text message',
  from: getEnvironmentVariable('TWILIO_PHONE_NUMBER'),
  to: getEnvironmentVariable('TWILIO_DEFAULT_TO_NUMBER'),
};
