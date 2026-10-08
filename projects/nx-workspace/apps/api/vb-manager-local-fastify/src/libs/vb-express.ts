import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const getVbExpressApiKey = () =>
  getEnvironmentVariable('VB_EXPRESS_API_KEY');
