import { EmailTemplateData } from './email.models';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export function getDefaultEmailRequest() {
  return {
    from: `Email Service <${getEnvironmentVariable('MY_EMAIL')}>`,
    to: getEnvironmentVariable('MY_EMAIL'),
    subject: 'Default subject',
    text: 'Default message',
  };
}

export const DEFAULT_TEMPLATE_DATA: EmailTemplateData = {
  text: 'default text',
};
