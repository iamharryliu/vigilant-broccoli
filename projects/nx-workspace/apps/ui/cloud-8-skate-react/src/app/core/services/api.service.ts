import { HONEYPOT_FIELD_NAME } from '@vigilant-broccoli/common-js';
import {
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
  type MessageRequest,
} from '@vigilant-broccoli/personal-common-js';
import { ENVIRONMENT } from '../../../environments/environment';

export const SEND_MESSAGE_ERROR = {
  NETWORK: 'NETWORK',
  SERVER: 'SERVER',
} as const;

export type ContactRequest = MessageRequest & {
  recaptchaToken: string;
} & Partial<Record<typeof HONEYPOT_FIELD_NAME, string>>;

export const sendMessage = async (request: ContactRequest): Promise<void> => {
  const response = await fetch(
    `${ENVIRONMENT.API_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
  ).catch(() => {
    throw new Error(SEND_MESSAGE_ERROR.NETWORK);
  });

  if (!response.ok) throw new Error(SEND_MESSAGE_ERROR.SERVER);
};
