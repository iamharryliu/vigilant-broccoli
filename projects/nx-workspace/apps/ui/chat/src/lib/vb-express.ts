import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const API_KEY_HEADER = 'x-api-key';

export const vbExpressUrl = (endpoint: string) =>
  `${getEnvironmentVariable('VB_EXPRESS_URL')}/${endpoint}`;

export const vbExpressAuthHeaders = () => ({
  [API_KEY_HEADER]: getEnvironmentVariable('VB_EXPRESS_API_KEY'),
});
