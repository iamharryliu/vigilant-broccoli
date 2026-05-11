import { google } from 'googleapis';
export { GOOGLE_TOKEN_EXPIRED } from './api-errors';

export const isExpiredError = (error: unknown) =>
  (error as { status?: number; response?: { status?: number } })?.status ===
    401 ||
  (error as { response?: { status?: number } })?.response?.status === 401;

export const createTasksClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.tasks({ version: 'v1', auth: oauth2Client });
};
