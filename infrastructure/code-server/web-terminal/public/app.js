import { CTRL_SHORTCUT, applyModifiers, encodeKey } from './keys.js';

const MESSAGE_TYPE = {
  INPUT: 'input',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  COPY_MODE: 'copy-mode',
};
const BACKOFF = { INITIAL_MS: 500, MAX_MS: 10_000, FACTOR: 2 };
// Failed handshakes without ever connecting usually mean the Access session
// expired; a reload sends the browser back through the Access login.
const RELOAD_AFTER_FAILURES = 3;
const RELOAD_GUARD_KEY = 'shell-reload-at';
const RELOAD_GUARD_MS = 60_000;

const app = document.getElementById('app');
const status = document.getElementById('status');
const toolbar = document.getElementById('toolbar');

const term = new Terminal({
  cursorBlink: true,
  fontSize: 14,
  scrollback: 5000,
  allowProposedApi: true,
  theme: { background: '#111111' },
});
const fit = new FitAddon.FitAddon();
term.loadAddon(fit);
term.open(document.getElementById('terminal'));

const modifiers = { ctrl: false, alt: false };
const toggleButtons = Object.fromEntries(
  [...toolbar.querySelectorAll('[data-toggle]')].map(button => [
    button.dataset.toggle,
    button,
  ]),
);
const setModifier = (name, active) => {
  modifiers[name] = active;
  toggleButtons[name].setAttribute('aria-pressed', String(active));
};
const clearModifiers = () => {
  setModifier('ctrl', false);
  setModifier('alt', false);
};

let socket = null;
const send = message => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};
const sendInput = data => send({ type: MESSAGE_TYPE.INPUT, data });
const sendResize = () =>
  send({ type: MESSAGE_TYPE.RESIZE, cols: term.cols, rows: term.rows });

// Swipes become tmux scroll commands (see server.mjs); a finger moving down
// reveals older output. Taps are left alone so they still focus the terminal.
const terminalElement = document.getElementById('terminal');
let touchY = null;
let pendingLines = 0;
let scrollFrame = null;

const lineHeight = () =>
  (term.element.querySelector('.xterm-screen')?.clientHeight ?? 0) /
    term.rows || 16;

const flushScroll = () => {
  scrollFrame = null;
  const lines = Math.trunc(pendingLines);
  if (lines === 0) return;
  pendingLines -= lines;
  send({ type: MESSAGE_TYPE.SCROLL, lines });
};

terminalElement.addEventListener(
  'touchstart',
  event => {
    touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    pendingLines = 0;
  },
  { passive: true },
);

terminalElement.addEventListener(
  'touchmove',
  event => {
    if (touchY === null || event.touches.length !== 1) return;
    event.preventDefault();
    const { clientY } = event.touches[0];
    pendingLines += (clientY - touchY) / lineHeight();
    touchY = clientY;
    scrollFrame ??= requestAnimationFrame(flushScroll);
  },
  { capture: true, passive: false },
);

terminalElement.addEventListener('touchend', () => {
  touchY = null;
});

const fitTerminal = () => {
  fit.fit();
  sendResize();
};

term.onData(data => {
  sendInput(applyModifiers(data, modifiers));
  clearModifiers();
});

toolbar.addEventListener('pointerdown', event => {
  // Keeps focus (and the soft keyboard) on the terminal instead of the button.
  event.preventDefault();
});

toolbar.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { key, toggle, ctrl, action } = button.dataset;
  if (toggle) {
    setModifier(toggle, !modifiers[toggle]);
  } else if (key) {
    sendInput(
      encodeKey(key, {
        ...modifiers,
        appCursor: term.modes.applicationCursorKeysMode,
      }),
    );
    clearModifiers();
  } else if (ctrl) {
    sendInput(CTRL_SHORTCUT[ctrl.toUpperCase()]);
    clearModifiers();
  } else if (action === 'scroll') {
    send({ type: MESSAGE_TYPE.COPY_MODE });
  } else if (action === 'paste') {
    try {
      term.paste(await navigator.clipboard.readText());
    } catch {
      const text = window.prompt('Paste text');
      if (text) term.paste(text);
    }
  }
  term.focus();
});

const showStatus = text => {
  status.textContent = text ?? '';
  status.hidden = !text;
};

let delay = BACKOFF.INITIAL_MS;
let failures = 0;
let everOpened = false;

const maybeReload = () => {
  const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) ?? 0);
  if (Date.now() - last < RELOAD_GUARD_MS) return;
  sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  location.reload();
};

const connect = () => {
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
  socket = new WebSocket(`${scheme}://${location.host}/ws`);
  let opened = false;

  socket.addEventListener('open', () => {
    opened = true;
    everOpened = true;
    failures = 0;
    delay = BACKOFF.INITIAL_MS;
    showStatus(null);
    // tmux repaints the screen on attach, so start from a clean buffer.
    term.reset();
    fitTerminal();
    term.focus();
  });

  socket.addEventListener('message', event => term.write(event.data));

  socket.addEventListener('close', () => {
    if (!opened) failures += 1;
    if (!everOpened && failures >= RELOAD_AFTER_FAILURES) maybeReload();
    showStatus('Reconnecting…');
    const jitter = Math.random() * 250;
    setTimeout(connect, delay + jitter);
    delay = Math.min(delay * BACKOFF.FACTOR, BACKOFF.MAX_MS);
  });
};

// Shrinks the app to the visible area when the on-screen keyboard opens, so
// the toolbar and prompt are not covered.
const syncViewport = () => {
  const viewport = window.visualViewport;
  if (!viewport) return;
  app.style.height = `${viewport.height}px`;
  app.style.top = `${viewport.offsetTop}px`;
  fitTerminal();
};

window.visualViewport?.addEventListener('resize', syncViewport);
window.visualViewport?.addEventListener('scroll', syncViewport);
window.addEventListener('resize', fitTerminal);
window.addEventListener('online', () => {
  if (socket?.readyState !== WebSocket.OPEN) socket?.close();
});

syncViewport();
connect();
