import { ENVIRONMENT } from '../../../environments/environment';

const SEND_MESSAGE_ENDPOINT = '/api/send-message';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Check your connection and try again.";
const SERVER_ERROR_MESSAGE =
  'Something went wrong sending your message. Please try again, or reach out on one of the links here if it keeps failing.';

export type MessageRequest = {
  name: string;
  email: string;
  message: string;
  appName?: string;
  recaptchaToken?: string;
};

export async function sendMessage(request: MessageRequest): Promise<void> {
  const response = await fetch(
    `${ENVIRONMENT.API_URL}${SEND_MESSAGE_ENDPOINT}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
  ).catch(() => {
    throw new Error(NETWORK_ERROR_MESSAGE);
  });

  if (!response.ok) throw new Error(SERVER_ERROR_MESSAGE);
}
