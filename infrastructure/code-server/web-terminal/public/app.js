import { CTRL_SHORTCUT, applyModifiers, encodeKey } from './keys.js';

const MESSAGE_TYPE = {
  INPUT: 'input',
  RESIZE: 'resize',
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

const fitTerminal = () => {
  fit.fit();
  sendResize();
};

term.onData(data => {
  sendInput(applyModifiers(data, modifiers));
  clearModifiers();
});

const DISMISS_KEYBOARD_KEYS = new Set(['pageUp', 'pageDown']);
const REPEAT_KEYS = new Set(['pageUp', 'pageDown']);
const REPEAT = { DELAY_MS: 400, INTERVAL_MS: 100 };
let terminalWasFocused = false;
let repeatTimer = null;
// Set once a hold has sent keys, so the click that ends it adds no extra key.
let repeated = false;

const sendKey = key =>
  sendInput(
    encodeKey(key, {
      ...modifiers,
      appCursor: term.modes.applicationCursorKeysMode,
    }),
  );

const startRepeat = key => {
  const tick = delayMs => {
    repeatTimer = setTimeout(() => {
      repeated = true;
      sendKey(key);
      tick(REPEAT.INTERVAL_MS);
    }, delayMs);
  };
  tick(REPEAT.DELAY_MS);
};

const stopRepeat = () => {
  clearTimeout(repeatTimer);
  repeatTimer = null;
  // A hold released off the button gets no click, so modifiers are cleared here.
  if (repeated) clearModifiers();
};

toolbar.addEventListener('pointerdown', event => {
  // Keeps focus (and the soft keyboard) on the terminal instead of the button.
  // Focus is only restored if it was there, so keys don't open a closed keyboard.
  // PgUp/PgDn blur instead, dismissing the keyboard to give scrolling more rows.
  terminalWasFocused = document.activeElement === term.textarea;
  event.preventDefault();
  stopRepeat();
  repeated = false;
  const key = event.target.closest('button')?.dataset.key;
  if (REPEAT_KEYS.has(key)) startRepeat(key);
});

// pointercancel also fires when a touch turns into a toolbar scroll.
['pointerup', 'pointercancel', 'pointerout'].forEach(type =>
  toolbar.addEventListener(type, stopRepeat),
);
toolbar.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('visibilitychange', stopRepeat);

toolbar.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { key, toggle, ctrl, action } = button.dataset;
  if (toggle) {
    setModifier(toggle, !modifiers[toggle]);
  } else if (key) {
    if (!repeated) sendKey(key);
    repeated = false;
    clearModifiers();
  } else if (ctrl) {
    sendInput(CTRL_SHORTCUT[ctrl.toUpperCase()]);
    clearModifiers();
  } else if (action === 'paste') {
    try {
      term.paste(await navigator.clipboard.readText());
    } catch {
      const text = window.prompt('Paste text');
      if (text) term.paste(text);
    }
  }
  if (DISMISS_KEYBOARD_KEYS.has(key)) term.blur();
  else if (terminalWasFocused) term.focus();
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
