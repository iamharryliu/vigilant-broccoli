import { CR, CTRL_SHORTCUT, encodeKey } from './keys.js';

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
const FONT_SIZE = { MIN: 8, MAX: 20, DESKTOP: 14, MOBILE: 11, STEP: 1 };
const FONT_SIZE_KEY = 'shell-font-size';
const MOBILE_QUERY = '(max-width: 600px)';

// Storage can throw in private mode; the default size is used instead.
const readStoredFontSize = () => {
  try {
    return Number(localStorage.getItem(FONT_SIZE_KEY)) || null;
  } catch {
    return null;
  }
};

const storeFontSize = size => {
  try {
    localStorage.setItem(FONT_SIZE_KEY, String(size));
  } catch {
    // Size still applies for this page load.
  }
};

const defaultFontSize = () =>
  window.matchMedia(MOBILE_QUERY).matches
    ? FONT_SIZE.MOBILE
    : FONT_SIZE.DESKTOP;

const app = document.getElementById('app');
const status = document.getElementById('status');
const toolbar = document.getElementById('toolbar');

const term = new Terminal({
  cursorBlink: true,
  fontSize: readStoredFontSize() ?? defaultFontSize(),
  scrollback: 5000,
  allowProposedApi: true,
  theme: { background: '#111111' },
});
const fit = new FitAddon.FitAddon();
term.loadAddon(fit);
term.open(document.getElementById('terminal'));

const keysSheet = document.getElementById('keys-sheet');
const keysList = document.getElementById('keys-list');
const keysSearch = document.getElementById('keys-search');
const keysTabs = document.getElementById('keys-tabs');
const keysEmpty = document.getElementById('keys-empty');
const keysFontSize = document.getElementById('keys-font-size');
const KEYS_ACTION = {
  OPEN: 'keys',
  CLOSE: 'close',
  PASTE: 'paste',
  FONT_DOWN: 'font-down',
  FONT_UP: 'font-up',
};
const FONT_STEP_BY_ACTION = {
  [KEYS_ACTION.FONT_DOWN]: -FONT_SIZE.STEP,
  [KEYS_ACTION.FONT_UP]: FONT_SIZE.STEP,
};
const KEYS_PAGE = { CLAUDE: 'claude', DEV: 'dev' };
const SUBMIT_DELAY_MS = 50;
let activePage = KEYS_PAGE.CLAUDE;

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

const renderFontSize = () => {
  keysFontSize.textContent = `${term.options.fontSize}px`;
};

// Refits after the change so the shell and TUIs reflow to the new grid.
const changeFontSize = step => {
  const size = Math.min(
    FONT_SIZE.MAX,
    Math.max(FONT_SIZE.MIN, term.options.fontSize + step),
  );
  term.options.fontSize = size;
  storeFontSize(size);
  renderFontSize();
  fitTerminal();
};

renderFontSize();

term.onData(sendInput);

const DISMISS_KEYBOARD_KEYS = new Set(['pageUp', 'pageDown']);
const REPEAT_KEYS = new Set(['pageUp', 'pageDown']);
const REPEAT = { DELAY_MS: 400, INTERVAL_MS: 100 };
let terminalWasFocused = false;
let repeatTimer = null;
// Set once a hold has sent keys, so the click that ends it adds no extra key.
let repeated = false;

const sendKey = key =>
  sendInput(
    encodeKey(key, { appCursor: term.modes.applicationCursorKeysMode }),
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

// Built from the toolbar buttons so the two cannot drift apart.
keysList.replaceChildren(
  ...[...toolbar.querySelectorAll('button')]
    .filter(
      button =>
        button.dataset.action !== KEYS_ACTION.OPEN &&
        !('barOnly' in button.dataset),
    )
    .map(button => {
      const item = button.cloneNode(true);
      const label = document.createElement('span');
      label.textContent = item.textContent.trim();
      const description = document.createElement('small');
      description.textContent = item.dataset.desc ?? '';
      item.replaceChildren(label, description);
      return item;
    }),
);

// A query searches every page; without one the list shows the active page.
const renderKeysList = () => {
  const query = keysSearch.value.trim().toLowerCase();
  let visible = 0;
  keysList.querySelectorAll('button').forEach(item => {
    const matches = query
      ? `${item.firstChild.textContent} ${item.dataset.desc}`
          .toLowerCase()
          .includes(query)
      : item.dataset.page === activePage;
    item.hidden = !matches;
    if (matches) visible += 1;
  });
  keysTabs
    .querySelectorAll('button')
    .forEach(tab =>
      tab.setAttribute(
        'aria-selected',
        String(!query && tab.dataset.pageTab === activePage),
      ),
    );
  keysEmpty.hidden = visible > 0;
};

const setKeysPage = page => {
  activePage = page;
  keysSearch.value = '';
  renderKeysList();
  keysList.scrollTop = 0;
};

keysSearch.addEventListener('input', renderKeysList);
renderKeysList();

const setKeysSheetOpen = open => {
  keysSheet.hidden = !open;
};

const handleButton = async button => {
  const { key, ctrl, text, action } = button.dataset;
  if (action === KEYS_ACTION.OPEN) {
    // Blurred to dismiss the soft keyboard; terminalWasFocused (set by the
    // toolbar pointerdown) is kept so closing the sheet can restore it.
    setKeysSheetOpen(true);
    term.blur();
  } else if (key) {
    if (!repeated) sendKey(key);
    repeated = false;
  } else if (ctrl) {
    sendInput(CTRL_SHORTCUT[ctrl.toUpperCase()]);
  } else if (text) {
    sendInput(text);
    // Without data-submit there is no Enter, so arguments can be added first.
    // Enter is its own write so a TUI reads it as a keypress, not as the tail
    // of pasted text.
    if ('submit' in button.dataset) {
      setTimeout(() => sendInput(CR), SUBMIT_DELAY_MS);
    }
  } else if (action === KEYS_ACTION.PASTE) {
    try {
      term.paste(await navigator.clipboard.readText());
    } catch {
      const text = window.prompt('Paste text');
      if (text) term.paste(text);
    }
  }
  if (DISMISS_KEYBOARD_KEYS.has(key)) term.blur();
  else if (terminalWasFocused && keysSheet.hidden) term.focus();
};

toolbar.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button) handleButton(button);
});

// Same pointerdown handling as the toolbar, without hold-to-repeat. The search
// field is exempt so it can take focus and show the soft keyboard.
keysSheet.addEventListener('pointerdown', event => {
  if (event.target !== keysSearch) event.preventDefault();
});

const closeKeysSheet = () => {
  setKeysSheetOpen(false);
  keysSearch.value = '';
  renderKeysList();
  if (terminalWasFocused) term.focus();
};
keysSheet.addEventListener('contextmenu', event => {
  if (event.target !== keysSearch) event.preventDefault();
});

keysSheet.addEventListener('click', event => {
  const tab = event.target.closest('[data-page-tab]');
  if (tab) {
    setKeysPage(tab.dataset.pageTab);
    return;
  }
  const button = event.target.closest('button');
  if (button?.dataset.action === KEYS_ACTION.CLOSE) {
    closeKeysSheet();
    return;
  }
  // Keeps the sheet open so several taps can adjust the size.
  if (button?.dataset.action in FONT_STEP_BY_ACTION) {
    changeFontSize(FONT_STEP_BY_ACTION[button.dataset.action]);
    return;
  }
  if (!button) return;
  handleButton(button);
  closeKeysSheet();
});

// Capture phase so the terminal does not also receive the Escape.
document.addEventListener(
  'keydown',
  event => {
    if (event.key !== 'Escape' || keysSheet.hidden) return;
    event.preventDefault();
    event.stopPropagation();
    closeKeysSheet();
  },
  true,
);

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
