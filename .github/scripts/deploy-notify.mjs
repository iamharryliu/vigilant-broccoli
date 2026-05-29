import { io } from 'socket.io-client';

const URL = process.env.SOCKET_SERVER_URL;
const TOKEN = process.env.SHARED_APP_TOKEN;
const CA_B64 = process.env.SOCKET_SERVER_CA_CERT;

const DEPLOY_APP = 'vb-manager-next';
const DEPLOY_RECEIVER_ID = 'deploy';
const TIMEOUT_MS = 10000;

const payload = {
  status: process.env.DEPLOY_STATUS,
  job: process.env.DEPLOY_JOB,
  commit: process.env.DEPLOY_COMMIT,
  workflow: process.env.DEPLOY_WORKFLOW,
  run_url: process.env.DEPLOY_RUN_URL,
};

const tlsOpts = CA_B64
  ? { ca: Buffer.from(CA_B64, 'base64'), checkServerIdentity: () => undefined }
  : {};

const socket = io(URL, {
  auth: { token: TOKEN },
  transports: ['websocket'],
  reconnection: false,
  ...tlsOpts,
});

try {
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('connect timeout')), TIMEOUT_MS);
    socket.once('connect', () => { clearTimeout(t); resolve(); });
    socket.once('connect_error', err => { clearTimeout(t); reject(err); });
  });

  socket.emit('publish', { app: DEPLOY_APP, receiverId: DEPLOY_RECEIVER_ID, payload });
  await new Promise(r => setTimeout(r, 300));
  console.log(`deploy-notify: ${payload.status} sent`);
} catch (err) {
  console.error('deploy-notify failed:', err.message);
  process.exit(1);
} finally {
  socket.close();
}
