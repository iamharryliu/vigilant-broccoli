import { App, Receiver, ReceiverEvent, verifySlackRequest } from '@slack/bolt';

const SIGNATURE_HEADER = 'x-slack-signature';
const TIMESTAMP_HEADER = 'x-slack-request-timestamp';
const RETRY_NUM_HEADER = 'x-slack-retry-num';
const RETRY_REASON_HEADER = 'x-slack-retry-reason';

const JSON_CONTENT_TYPE = 'application/json';
const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

// Slack gives up after 3s and retries; answer just before so a slow handler never
// leaves the request hanging (a late ack() is then a no-op).
const ACK_DEADLINE_MS = 2500;
const SEEN_EVENT_LIMIT = 1000;

export type SlackHttpRequest = {
  headers: Record<string, string | string[] | undefined>;
  // Signature verification needs the exact bytes Slack signed, not re-serialised JSON.
  rawBody: string;
};

export type SlackHttpResponse = {
  status: number;
  contentType?: string;
  body?: string;
};

const EMPTY_OK: SlackHttpResponse = { status: 200 };

const firstHeader = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const jsonResponse = (payload: unknown): SlackHttpResponse => ({
  status: 200,
  contentType: JSON_CONTENT_TYPE,
  body: JSON.stringify(payload),
});

const toAckResponse = (response: unknown): SlackHttpResponse => {
  if (response === undefined || response === null || response === '') {
    return EMPTY_OK;
  }
  return typeof response === 'string'
    ? { status: 200, contentType: 'text/plain', body: response }
    : jsonResponse(response);
};

const parseBody = (
  contentType: string,
  rawBody: string,
): Record<string, unknown> => {
  if (contentType.startsWith(FORM_CONTENT_TYPE)) {
    const form = new URLSearchParams(rawBody);
    const payload = form.get('payload');
    // Interactivity wraps JSON in `payload`; slash commands are plain form fields.
    return payload ? JSON.parse(payload) : Object.fromEntries(form.entries());
  }
  return JSON.parse(rawBody);
};

// Receiver for Bolt that is driven by the host web server instead of owning a
// port, so one Fastify instance serves Slack, the demo API and /docs.
export function createSlackHttpReceiver(signingSecret: string) {
  let app: App | undefined;
  const seenEventIds = new Set<string>();

  const isDuplicateEvent = (body: Record<string, unknown>) => {
    const eventId = body.event_id;
    if (typeof eventId !== 'string') return false;
    if (seenEventIds.has(eventId)) return true;
    seenEventIds.add(eventId);
    if (seenEventIds.size > SEEN_EVENT_LIMIT) {
      seenEventIds.delete(seenEventIds.values().next().value as string);
    }
    return false;
  };

  const isAuthentic = ({ headers, rawBody }: SlackHttpRequest) => {
    try {
      verifySlackRequest({
        signingSecret,
        body: rawBody,
        headers: {
          'x-slack-signature': firstHeader(headers[SIGNATURE_HEADER]) ?? '',
          'x-slack-request-timestamp': Number(
            firstHeader(headers[TIMESTAMP_HEADER]),
          ),
        },
      });
      return true;
    } catch {
      return false;
    }
  };

  const receiver: Receiver = {
    init: boltApp => {
      app = boltApp;
    },
    start: async () => undefined,
    stop: async () => undefined,
  };

  // Resolves as soon as the request is acknowledged; the handler keeps running
  // afterwards, exactly as with Bolt's own receivers.
  const handleRequest = async (
    request: SlackHttpRequest,
  ): Promise<SlackHttpResponse> => {
    const boltApp = app;
    if (!boltApp) throw new Error('Receiver is not attached to a Bolt app');
    if (!isAuthentic(request)) {
      return { status: 401, body: 'Invalid Slack signature' };
    }

    const contentType = firstHeader(request.headers['content-type']) ?? '';
    let body: Record<string, unknown>;
    try {
      body = parseBody(contentType, request.rawBody);
    } catch {
      return { status: 400, body: 'Malformed request body' };
    }

    if (body.ssl_check) return EMPTY_OK;
    if (body.type === 'url_verification') {
      return {
        status: 200,
        contentType: 'text/plain',
        body: String(body.challenge),
      };
    }

    // A retry means the first delivery was already accepted (possibly still
    // running after a slow resume); running it again would repeat its effects.
    const retryNum = firstHeader(request.headers[RETRY_NUM_HEADER]);
    if (retryNum !== undefined || isDuplicateEvent(body)) return EMPTY_OK;

    return new Promise<SlackHttpResponse>(resolve => {
      const event: ReceiverEvent = {
        body,
        retryReason: firstHeader(request.headers[RETRY_REASON_HEADER]),
        ack: async response => resolve(toAckResponse(response)),
      };
      const deadline = setTimeout(() => resolve(EMPTY_OK), ACK_DEADLINE_MS);
      boltApp
        .processEvent(event)
        .catch(error => {
          console.error('[slack] handler failed', error);
          resolve({ status: 500 });
        })
        .finally(() => clearTimeout(deadline));
    });
  };

  return { receiver, handleRequest };
}
