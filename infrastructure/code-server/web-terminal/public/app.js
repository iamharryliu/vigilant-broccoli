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
// Fast swipes scroll further per pixel (up to MAX_GAIN), and a flick keeps
// gliding after release, decaying by FRICTION per 16ms frame.
const SCROLL = {
  GAIN_PER_PX_MS: 1.2,
  MAX_GAIN: 4,
  FRICTION: 0.95,
  MIN_FLING_LINES_PER_MS: 0.01,
  FRAME_MS: 16,
};

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
let touchTime = 0;
let velocity = 0; // lines per ms, positive reveals older output
let pendingLines = 0;
let scrollFrame = null;
let flingFrame = null;

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

const queueScroll = lines => {
  pendingLines += lines;
  scrollFrame ??= requestAnimationFrame(flushScroll);
};

const stopFling = () => {
  if (flingFrame !== null) cancelAnimationFrame(flingFrame);
  flingFrame = null;
};

const fling = last => {
  flingFrame = requestAnimationFrame(now => {
    const elapsed = now - last;
    velocity *= SCROLL.FRICTION ** (elapsed / SCROLL.FRAME_MS);
    if (Math.abs(velocity) < SCROLL.MIN_FLING_LINES_PER_MS) {
      flingFrame = null;
      return;
    }
    queueScroll(velocity * elapsed);
    fling(now);
  });
};

terminalElement.addEventListener(
  'touchstart',
  event => {
    stopFling();
    touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    touchTime = event.timeStamp;
    velocity = 0;
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
    const elapsed = Math.max(event.timeStamp - touchTime, 1);
    const deltaPx = clientY - touchY;
    const gain = Math.min(
      1 + (Math.abs(deltaPx) / elapsed) * SCROLL.GAIN_PER_PX_MS,
      SCROLL.MAX_GAIN,
    );
    const lines = (deltaPx / lineHeight()) * gain;
    // Smoothed so a single jittery sample does not decide the fling speed.
    velocity = 0.7 * velocity + 0.3 * (lines / elapsed);
    touchY = clientY;
    touchTime = event.timeStamp;
    queueScroll(lines);
  },
  { capture: true, passive: false },
);

terminalElement.addEventListener('touchend', event => {
  const wasTracking = touchY !== null;
  touchY = null;
  // A pause before release means the finger stopped, so no fling.
  if (wasTracking && event.timeStamp - touchTime < 80) {
    fling(performance.now());
  }
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
