import { io } from 'socket.io-client';

const URL = process.env.SOCKET_SERVER_URL;
const CA_B64 = process.env.SOCKET_SERVER_CA_CERT;

const APP = 'security-check';
const PAYLOAD = { canary: 'should-not-be-delivered', ts: Date.now() };

let receiverIdCounter = 0;
const nextReceiverId = () => `sec-${Date.now()}-${++receiverIdCounter}`;

const SILENT_DROP_WINDOW_MS = 2000;
const SUBSCRIBE_SETTLE_MS = 300;

const EVENT_CONNECT = 'connect';
const EVENT_CONNECT_ERROR = 'connect_error';
const EVENT_MESSAGE = 'message';
const EVENT_SUBSCRIBE = 'subscribe';
const EVENT_PUBLISH = 'publish';

if (!URL || !CA_B64) {
  console.error('FAIL: missing one of SOCKET_SERVER_URL, SOCKET_SERVER_CA_CERT');
  process.exit(2);
}

const tlsOpts = {
  ca: Buffer.from(CA_B64, 'base64'),
  checkServerIdentity: () => undefined,
};

const baseOpts = {
  transports: ['websocket'],
  reconnection: false,
  ...tlsOpts,
};

const awaitConnect = sock =>
  new Promise((resolve, reject) => {
    const fail = err => reject(new Error(`connect failed: ${err.message}`));
    sock.once(EVENT_CONNECT, () => {
      sock.off(EVENT_CONNECT_ERROR, fail);
      resolve();
    });
    sock.once(EVENT_CONNECT_ERROR, fail);
  });

const expectNoMessage = (sock, windowMs) =>
  new Promise(resolve => {
    let received = null;
    const onMsg = msg => {
      received = msg;
    };
    sock.on(EVENT_MESSAGE, onMsg);
    setTimeout(() => {
      sock.off(EVENT_MESSAGE, onMsg);
      resolve(received);
    }, windowMs);
  });

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

const setupReceiver = async receiverId => {
  const receiver = io(URL, baseOpts);
  await awaitConnect(receiver);
  receiver.emit(EVENT_SUBSCRIBE, { app: APP, receiverId });
  await new Promise(r => setTimeout(r, SUBSCRIBE_SETTLE_MS));
  return receiver;
};

const attemptPublishAs = async (auth, receiverId, payload) => {
  const sender = io(URL, { ...baseOpts, auth });
  await awaitConnect(sender);
  sender.emit(EVENT_PUBLISH, { app: APP, receiverId, payload });
  return sender;
};

let failed = 0;

console.log(`Testing socket-server security: ${URL}`);
console.log('');

console.log('Test 1: publish without auth token is silently dropped');
{
  const receiverId = nextReceiverId();
  const receiver = await setupReceiver(receiverId);
  const sender = await attemptPublishAs(undefined, receiverId, PAYLOAD);
  const ok = await runCheck('no message delivered to receiver', async () => {
    const msg = await expectNoMessage(receiver, SILENT_DROP_WINDOW_MS);
    if (msg) throw new Error(`unauthorized publish delivered: ${JSON.stringify(msg.payload)}`);
  });
  if (!ok) failed++;
  sender.close();
  receiver.close();
}
console.log('');

console.log('Test 2: publish with invalid auth token is silently dropped');
{
  const receiverId = nextReceiverId();
  const receiver = await setupReceiver(receiverId);
  const sender = await attemptPublishAs({ token: 'totally-not-the-real-token' }, receiverId, PAYLOAD);
  const ok = await runCheck('no message delivered to receiver', async () => {
    const msg = await expectNoMessage(receiver, SILENT_DROP_WINDOW_MS);
    if (msg) throw new Error(`invalid-token publish delivered: ${JSON.stringify(msg.payload)}`);
  });
  if (!ok) failed++;
  sender.close();
  receiver.close();
}
console.log('');

if (failed > 0) {
  console.log(`✗ ${failed} security check(s) failed`);
  process.exit(1);
}
console.log('✓ All security checks passed');
process.exit(0);
