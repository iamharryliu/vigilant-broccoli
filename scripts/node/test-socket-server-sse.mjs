import { io } from 'socket.io-client';

const URL = process.env.SOCKET_SERVER_URL;
const TOKEN = process.env.SHARED_APP_TOKEN;

const APP = 'ci';
const EVENTS_PATH = '/events';
const PUBLISH_PATH = '/publish';
const SSE_MESSAGE_EVENT = 'message';
const SSE_FRAME_SEPARATOR = '\n\n';
const TIMEOUT_MS = 10000;
const SUBSCRIBE_SETTLE_MS = 300;

if (!URL || !TOKEN) {
  console.error('FAIL: missing SOCKET_SERVER_URL or SHARED_APP_TOKEN');
  process.exit(2);
}

let receiverIdCounter = 0;
const nextReceiverId = () => `ci-sse-${Date.now()}-${++receiverIdCounter}`;

const withTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`timeout waiting for ${label}`)),
        TIMEOUT_MS,
      ),
    ),
  ]);

const parseFrame = frame => {
  const lines = frame.split('\n');
  const event = lines.find(l => l.startsWith('event: '))?.slice(7);
  const data = lines.find(l => l.startsWith('data: '))?.slice(6);
  return { event, data };
};

// Node has no EventSource, so read the stream with fetch and split frames by hand.
const openSse = async receiverId => {
  const controller = new AbortController();
  const params = new URLSearchParams({ app: APP, receiverId });
  const res = await fetch(`${URL}${EVENTS_PATH}?${params}`, {
    signal: controller.signal,
  });
  if (res.status !== 200) throw new Error(`/events returned ${res.status}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  const nextMessage = async () => {
    for (;;) {
      const end = buffer.indexOf(SSE_FRAME_SEPARATOR);
      if (end !== -1) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + SSE_FRAME_SEPARATOR.length);
        const { event, data } = parseFrame(frame);
        if (event === SSE_MESSAGE_EVENT) return JSON.parse(data);
        continue;
      }
      const { value, done } = await reader.read();
      if (done) throw new Error('stream ended');
      buffer += value;
    }
  };
  return { nextMessage, close: () => controller.abort() };
};

const publish = (token, body) =>
  fetch(`${URL}${PUBLISH_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

const assertPayload = (msg, expected) => {
  const got = JSON.stringify(msg?.payload);
  const want = JSON.stringify(expected);
  if (got !== want)
    throw new Error(`payload mismatch: got ${got}, want ${want}`);
};

const runCheck = async (name, fn) => {
  process.stdout.write(`  ${name}... `);
  try {
    await fn();
    console.log('OK');
    return true;
  } catch (err) {
    console.log(`FAIL — ${err.message}`);
    return false;
  }
};

const checks = [
  [
    'SSE round-trip: POST /publish reaches an /events subscriber',
    async () => {
      const receiverId = nextReceiverId();
      const expected = { hello: 'from-ci-sse', ts: Date.now() };
      const sse = await openSse(receiverId);
      try {
        const res = await publish(TOKEN, {
          app: APP,
          receiverId,
          payload: expected,
        });
        const ack = await res.json();
        if (!ack.ok || ack.receivers < 1) {
          throw new Error(`publish ack ${JSON.stringify(ack)}`);
        }
        assertPayload(
          await withTimeout(sse.nextMessage(), 'SSE message'),
          expected,
        );
      } finally {
        sse.close();
      }
    },
  ],
  [
    'cross-transport: POST /publish reaches a Socket.IO subscriber',
    async () => {
      const receiverId = nextReceiverId();
      const expected = { hello: 'http-to-socket', ts: Date.now() };
      const socket = io(URL, {
        transports: ['websocket'],
        reconnection: false,
      });
      try {
        await withTimeout(
          new Promise((resolve, reject) => {
            socket.once('connect', resolve);
            socket.once('connect_error', reject);
          }),
          'socket connect',
        );
        const message = withTimeout(
          new Promise(resolve => socket.once('message', resolve)),
          'socket message',
        );
        socket.emit('subscribe', { app: APP, receiverId });
        await new Promise(r => setTimeout(r, SUBSCRIBE_SETTLE_MS));
        const res = await publish(TOKEN, {
          app: APP,
          receiverId,
          payload: expected,
        });
        if (res.status !== 200)
          throw new Error(`publish returned ${res.status}`);
        assertPayload(await message, expected);
      } finally {
        socket.close();
      }
    },
  ],
  [
    'POST /publish without a token is rejected with 401',
    async () => {
      const res = await publish(undefined, {
        app: APP,
        receiverId: nextReceiverId(),
        payload: {},
      });
      if (res.status !== 401) throw new Error(`got ${res.status}`);
    },
  ],
  [
    'POST /publish with a wrong token is rejected with 403',
    async () => {
      const res = await publish('totally-not-the-real-token', {
        app: APP,
        receiverId: nextReceiverId(),
        payload: {},
      });
      if (res.status !== 403) throw new Error(`got ${res.status}`);
    },
  ],
];

console.log(`Testing socket-server SSE transport: ${URL}`);
let failed = 0;
for (const [name, fn] of checks) {
  if (!(await runCheck(name, fn))) failed++;
}
if (failed > 0) {
  console.log(`✗ ${failed} SSE check(s) failed`);
  process.exit(1);
}
console.log('✓ All SSE checks passed');
process.exit(0);
