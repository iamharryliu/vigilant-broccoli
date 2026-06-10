import { ENVIRONMENT } from '../../../environments/environment';

const SEND_MESSAGE_ENDPOINT = '/api/send-message';

export type MessageRequest = {
  name: string;
  email: string;
  message: string;
  appName?: string;
  recaptchaToken?: string;
};

const showError = (msg: string) => alert(msg);
const showSuccess = (msg: string) => alert(msg);

export async function sendMessage(request: MessageRequest): Promise<any> {
  try {
    const res = await fetch(`${ENVIRONMENT.API_URL}${SEND_MESSAGE_ENDPOINT}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      showError(`This is a server side error:\n${text}`);
      throw new Error(text);
    }
    const body = await res.json().catch(() => ({}));
    if (body?.message) showSuccess(body.message);
    return body;
  } catch (err) {
    if (err instanceof TypeError) {
      showError(`This is a client side error: ${err.message}`);
    }
    throw err;
  }
}
