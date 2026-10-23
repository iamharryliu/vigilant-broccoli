import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import pty from 'node-pty';
import { WebSocketServer } from 'ws';

// Standalone package inside the code-server image: the Nx workspace libs
// (@vigilant-broccoli/common-js, common-node) are not installed there, so the
// HTTP and environment helpers are mirrored locally.
const HTTP_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
};
const HTTP_METHOD = { GET: 'GET', HEAD: 'HEAD' };
const ACCESS_JWT_HEADER = 'cf-access-jwt-assertion';

const getEnvironmentVariable = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
};

const MESSAGE_TYPE = {
  INPUT: 'input',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  COPY_MODE: 'copy-mode',
};
const MAX_SCROLL_LINES = 500;
const WS_PATH = '/ws';
const PUBLIC_DIR = fileURLToPath(new URL('./public/', import.meta.url));
const VENDOR_DIR = fileURLToPath(new URL('./node_modules/', import.meta.url));
const VENDOR_FILES = {
  '/vendor/xterm.js': '@xterm/xterm/lib/xterm.js',
  '/vendor/xterm.css': '@xterm/xterm/css/xterm.css',
  '/vendor/addon-fit.js': '@xterm/addon-fit/lib/addon-fit.js',
};
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

const PORT = Number(getEnvironmentVariable('TERMINAL_PORT', '7681'));
const TEAM_DOMAIN = getEnvironmentVariable('CF_ACCESS_TEAM_DOMAIN');
const AUDIENCE = getEnvironmentVariable('CF_ACCESS_AUD');
const TMUX_SESSION = getEnvironmentVariable('TERMINAL_TMUX_SESSION', 'web');
const HOME_DIR = getEnvironmentVariable('TERMINAL_HOME', '/config');
const START_DIR = getEnvironmentVariable(
  'TERMINAL_CWD',
  `${HOME_DIR}/vigilant-broccoli`,
);
const KEEPALIVE_MS = 25_000;

const ISSUER = `https://${TEAM_DOMAIN}`;
const jwks = createRemoteJWKSet(new URL(`${ISSUER}/cdn-cgi/access/certs`));

// Cloudflare Access already gates the hostname at the edge, but this port is a
// root-equivalent shell, so the signed assertion is re-checked here and any
// failure (missing, expired, wrong issuer or audience) is a rejection.
const isAuthorized = async req => {
  const token = req.headers[ACCESS_JWT_HEADER];
  if (typeof token !== 'string' || token === '') return false;
  try {
    await jwtVerify(token, jwks, { issuer: ISSUER, audience: AUDIENCE });
    return true;
  } catch {
    return false;
  }
};

// Browsers send cookies on cross-site WebSocket handshakes, so a page on
// another origin could ride the user's Access session without this check.
const isSameOrigin = req => {
  const { origin, host } = req.headers;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const resolveStaticFile = pathname => {
  if (VENDOR_FILES[pathname]) return join(VENDOR_DIR, VENDOR_FILES[pathname]);
  const relative = normalize(pathname === '/' ? '/index.html' : pathname);
  if (relative.includes('..')) return null;
  return join(PUBLIC_DIR, relative);
};

const respond = (res, status, body = '', headers = {}) => {
  res.writeHead(status, headers);
  res.end(body);
};

const server = createServer(async (req, res) => {
  if (![HTTP_METHOD.GET, HTTP_METHOD.HEAD].includes(req.method)) {
    return respond(res, HTTP_STATUS_CODES.METHOD_NOT_ALLOWED);
  }
  if (!(await isAuthorized(req))) {
    return respond(res, HTTP_STATUS_CODES.UNAUTHORIZED);
  }
  const { pathname } = new URL(req.url, 'http://localhost');
  const file = resolveStaticFile(pathname);
  if (!file) return respond(res, HTTP_STATUS_CODES.BAD_REQUEST);
  try {
    const body = await readFile(file);
    respond(res, HTTP_STATUS_CODES.OK, body, {
      'Content-Type':
        CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
  } catch {
    respond(res, HTTP_STATUS_CODES.NOT_FOUND);
  }
});

// Scrolling drives tmux directly rather than sending its prefix key, which the
// dotfiles remap. tmux mouse mode would scroll on wheel events, but mobile
// browsers never emit those for touch, and the outer xterm.js buffer has no
// history of its own because tmux owns the screen.
const runTmux = args => execFile('tmux', args, () => {});

const scrollPane = lines => {
  const count = Math.min(Math.abs(Math.trunc(lines)), MAX_SCROLL_LINES);
  if (!Number.isFinite(count) || count === 0) return;
  const scroll = [
    'send-keys',
    '-t',
    TMUX_SESSION,
    '-X',
    '-N',
    String(count),
    lines > 0 ? 'scroll-up' : 'scroll-down',
  ];
  // -e leaves copy mode once scrolled back to the bottom; scrolling down
  // outside copy mode fails harmlessly.
  runTmux(
    lines > 0
      ? ['copy-mode', '-e', '-t', TMUX_SESSION, ';', ...scroll]
      : scroll,
  );
};

const attachShell = ws => {
  // The server already runs as abc (s6-setuidgid), so the shell inherits that
  // user. tmux keeps the session alive across dropped mobile connections;
  // killing this client only detaches.
  const shell = pty.spawn(
    'tmux',
    ['new-session', '-A', '-s', TMUX_SESSION, ';', 'set', '-g', 'mouse', 'on'],
    {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: START_DIR,
      env: { ...process.env, HOME: HOME_DIR, TERM: 'xterm-256color' },
    },
  );

  shell.onData(data => ws.send(data));
  shell.onExit(() => ws.close());

  ws.on('message', raw => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (
      message.type === MESSAGE_TYPE.INPUT &&
      typeof message.data === 'string'
    ) {
      shell.write(message.data);
    } else if (message.type === MESSAGE_TYPE.RESIZE) {
      const cols = Math.max(1, Math.floor(message.cols));
      const rows = Math.max(1, Math.floor(message.rows));
      if (Number.isFinite(cols) && Number.isFinite(rows)) {
        shell.resize(cols, rows);
      }
    } else if (
      message.type === MESSAGE_TYPE.SCROLL &&
      typeof message.lines === 'number'
    ) {
      scrollPane(message.lines);
    } else if (message.type === MESSAGE_TYPE.COPY_MODE) {
      runTmux(['copy-mode', '-t', TMUX_SESSION]);
    }
  });

  // Cloudflare drops idle WebSockets, and a half-open mobile connection never
  // fires 'close', so unanswered pings terminate the socket.
  let alive = true;
  ws.on('pong', () => {
    alive = true;
  });
  const keepalive = setInterval(() => {
    if (!alive) return ws.terminate();
    alive = false;
    ws.ping();
  }, KEEPALIVE_MS);

  ws.on('close', () => {
    clearInterval(keepalive);
    shell.kill();
  });
};

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', async (req, socket, head) => {
  const reject = status => {
    socket.write(`HTTP/1.1 ${status} Rejected\r\nConnection: close\r\n\r\n`);
    socket.destroy();
  };
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname !== WS_PATH) return reject(HTTP_STATUS_CODES.NOT_FOUND);
  if (!isSameOrigin(req)) return reject(HTTP_STATUS_CODES.FORBIDDEN);
  if (!(await isAuthorized(req))) return reject(HTTP_STATUS_CODES.UNAUTHORIZED);
  wss.handleUpgrade(req, socket, head, attachShell);
});

server.listen(PORT, () => console.log(`web-terminal listening on :${PORT}`));
