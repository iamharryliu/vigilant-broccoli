// Plain browser page with no build step. Keep the client script free of
// backticks and ${} so it survives inside this template literal.
export const MOCK_UI_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OK-IN Mock</title>
<style>
:root {
  --bg: #ffffff; --bg-soft: #f8f8f8; --text: #1d1c1d; --muted: #616061;
  --border: #dddddd; --side: #3f0e40; --side-text: #e8d9e8; --side-active: #1164a3;
  --mention-bg: #e8f5fa; --mention-text: #1264a3; --primary: #007a5a; --danger: #e01e5a;
  --overlay: rgba(29, 28, 29, 0.6);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1d21; --bg-soft: #222529; --text: #d1d2d3; --muted: #ababad;
    --border: #3a3d42; --side: #19171d; --side-text: #cfc3cf; --side-active: #1164a3;
    --mention-bg: #12334a; --mention-text: #1d9bd1; --primary: #2bac76; --danger: #ff5a8b;
  }
}
* { box-sizing: border-box; }
body { margin: 0; font: 15px/1.46 -apple-system, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); }
.app { display: grid; grid-template-columns: 270px 1fr; min-height: 100vh; }
.side { background: var(--side); color: var(--side-text); padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.side h1 { font-size: 18px; margin: 0; color: #fff; }
.side label { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; opacity: .75; display: block; margin-bottom: 6px; }
.side select { width: 100%; padding: 8px; border-radius: 6px; border: 0; font: inherit; }
.who { display: flex; gap: 10px; align-items: center; margin-top: 10px; }
.who small { opacity: .75; display: block; }
.nav button { width: 100%; text-align: left; background: none; border: 0; color: inherit; padding: 8px 10px; border-radius: 6px; font: inherit; cursor: pointer; }
.nav button.active { background: var(--side-active); color: #fff; }
.badge { background: var(--danger); color: #fff; border-radius: 10px; padding: 0 7px; font-size: 12px; margin-left: 6px; }
.spacer { flex: 1; }
.note { font-size: 12px; opacity: .7; }
.side .reset { background: transparent; border: 1px solid rgba(255,255,255,.35); color: inherit; border-radius: 6px; padding: 8px; cursor: pointer; font: inherit; }
.main { padding: 24px 16px 64px; }
.page { max-width: 760px; margin: 0 auto; }
.avatar { width: 34px; height: 34px; border-radius: 6px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex: none; }
h2.header { font-size: 22px; margin: 4px 0 8px; }
hr { border: 0; border-top: 1px solid var(--border); margin: 14px 0; }
.section { display: flex; gap: 16px; justify-content: space-between; align-items: flex-start; margin: 6px 0; }
.section .text { flex: 1; min-width: 0; }
.accessory { max-width: 48%; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; align-items: flex-start; }
.ctx { color: var(--muted); font-size: 13px; }
.mention { background: var(--mention-bg); color: var(--mention-text); border-radius: 4px; padding: 0 3px; }
.btn { border: 1px solid var(--border); background: var(--bg); color: var(--text); border-radius: 6px; padding: 6px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.btn:hover { background: var(--bg-soft); }
.btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.btn.danger { border-color: var(--danger); color: var(--danger); }
.btn.danger:hover { background: var(--danger); color: #fff; }
.options label { display: flex; gap: 8px; align-items: flex-start; padding: 3px 0; cursor: pointer; }
.options small { display: block; color: var(--muted); }
.options { max-height: 340px; overflow: auto; }
select.field, input.field, textarea.field { width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font: inherit; }
.input-block { margin: 14px 0; }
.input-block > .lbl { font-weight: 700; display: block; margin-bottom: 4px; }
.input-block.invalid .field, .input-block.invalid .options { outline: 2px solid var(--danger); border-radius: 6px; }
.err { color: var(--danger); font-size: 13px; display: none; }
.invalid .err { display: block; }
.overlay { position: fixed; inset: 0; background: var(--overlay); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10; }
.dialog { background: var(--bg); border-radius: 12px; width: 100%; max-width: 560px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,.4); }
.dialog > header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); font-size: 18px; font-weight: 800; }
.dialog > header button { background: none; border: 0; color: var(--muted); font-size: 22px; cursor: pointer; }
.dialog .body { padding: 4px 20px 12px; overflow: auto; }
.dialog > footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border); }
.card { border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; margin: 10px 0; background: var(--bg-soft); }
.card .meta { color: var(--muted); font-size: 12px; margin-bottom: 4px; }
.tag { border: 1px solid var(--border); border-radius: 4px; padding: 0 6px; font-size: 11px; margin-left: 6px; }
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #1d1c1d; color: #fff; padding: 10px 16px; border-radius: 8px; z-index: 20; max-width: 90vw; }
.toast.error { background: var(--danger); }
.empty { color: var(--muted); padding: 24px 0; text-align: center; }
@media (max-width: 760px) {
  .app { grid-template-columns: 1fr; }
  .section { flex-direction: column; }
  .accessory { max-width: 100%; width: 100%; }
}
</style>
</head>
<body>
<div class="app">
  <aside class="side">
    <h1 id="appName">OK-IN</h1>
    <div>
      <label for="userSelect">Viewing as</label>
      <select id="userSelect"></select>
      <div class="who" id="who"></div>
    </div>
    <nav class="nav">
      <button id="navHome" class="active">🏠 Home</button>
      <button id="navMessages">💬 Messages<span id="unread"></span></button>
    </nav>
    <div class="spacer"></div>
    <div class="note">Local mock of the Slack app. Data lives in memory and resets when the server restarts. Switch users to see what teammates see.</div>
    <button class="reset" id="reset">Reset demo data</button>
  </aside>
  <main class="main"><div class="page" id="page"></div></main>
</div>
<div id="modalRoot"></div>
<div id="toastRoot"></div>
<script>
var S = { data: null, user: null, tab: 'home', seen: {}, modalSig: '' };
var page = document.getElementById('page');

function esc(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function userById(id) {
  var users = (S.data && S.data.users) || [];
  for (var i = 0; i < users.length; i++) if (users[i].id === id) return users[i];
  return null;
}
function userName(id) { var u = userById(id); return u ? u.realName : id; }
function initials(name) {
  return name.split(' ').map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase();
}
function avatar(user) {
  return '<span class="avatar" style="background:' + (user.color || '#4a154b') + '">' + esc(initials(user.realName)) + '</span>';
}
function inline(t) {
  return t
    .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
    .replace(/(^|[\s(|])_([^_\n]+)_/g, '$1<i>$2</i>');
}
function fmt(text, markup) {
  var parts = String(text).split(/<@(\w+)>/);
  var out = '';
  for (var i = 0; i < parts.length; i++) {
    if (i % 2 === 1) out += '<span class="mention">@' + esc(userName(parts[i])) + '</span>';
    else out += markup ? inline(esc(parts[i])) : esc(parts[i]);
  }
  return out.replace(/\n/g, '<br>');
}
function textOf(obj) { return obj ? fmt(obj.text, obj.type === 'mrkdwn') : ''; }

function node(html) {
  var d = document.createElement('div');
  d.innerHTML = html;
  return d.firstElementChild;
}

function toast(message, isError) {
  var t = node('<div class="toast' + (isError ? ' error' : '') + '">' + esc(message) + '</div>');
  document.getElementById('toastRoot').appendChild(t);
  setTimeout(function () { t.remove(); }, 3500);
}

function api(path, body) {
  var payload = Object.assign({ user: S.user }, body || {});
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function (r) {
    return r.json().then(function (j) {
      if (!r.ok) throw new Error(j.error || 'Request failed');
      return j;
    });
  });
}
function update(path, body) {
  var before = unreadCount();
  return api(path, body).then(function (d) {
    S.data = d;
    render();
    if (unreadCount() > before && S.tab !== 'messages') toast('New message from ' + d.appName);
  }).catch(function (e) { toast(e.message, true); });
}
function unreadCount() {
  var seen = S.seen[S.user] || 0;
  return ((S.data && S.data.messages) || []).filter(function (m) { return m.id > seen; }).length;
}

function fireAction(action) {
  return update('/api/action', { action: action });
}

function renderElement(e, blockId, inModal) {
  var wrap = document.createElement('div');
  wrap.dataset.el = e.type;
  wrap.dataset.action = e.action_id || '';
  wrap.dataset.block = blockId || '';
  if (e.type === 'button') {
    var b = document.createElement('button');
    b.className = 'btn' + (e.style ? ' ' + e.style : '');
    b.innerHTML = textOf(e.text);
    b.onclick = function () {
      if (e.confirm && !window.confirm(e.confirm.text.text.replace(/\*/g, ''))) return;
      fireAction({ type: 'button', action_id: e.action_id, block_id: blockId, value: e.value });
    };
    return b;
  }
  if (e.type === 'checkboxes' || e.type === 'radio_buttons') {
    var isRadio = e.type === 'radio_buttons';
    var initial = (isRadio ? [e.initial_option] : e.initial_options || []).filter(Boolean).map(function (o) { return o.value; });
    var group = 'g' + Math.random().toString(36).slice(2);
    wrap.className = 'options';
    (e.options || []).forEach(function (o) {
      var label = document.createElement('label');
      var input = document.createElement('input');
      input.type = isRadio ? 'radio' : 'checkbox';
      input.name = group;
      input.value = o.value;
      input.checked = initial.indexOf(o.value) >= 0;
      var span = document.createElement('span');
      span.innerHTML = textOf(o.text) + (o.description ? '<small>' + textOf(o.description) + '</small>' : '');
      label.appendChild(input);
      label.appendChild(span);
      wrap.appendChild(label);
    });
    if (!inModal && !isRadio) {
      wrap.onchange = function () {
        var picked = Array.prototype.slice.call(wrap.querySelectorAll('input:checked')).map(function (i) { return { value: i.value }; });
        fireAction({ type: 'checkboxes', action_id: e.action_id, block_id: blockId, selected_options: picked });
      };
    }
    return wrap;
  }
  if (e.type === 'static_select') {
    var sel = document.createElement('select');
    sel.className = 'field';
    var hasInitial = !!e.initial_option;
    if (!hasInitial) {
      var ph = document.createElement('option');
      ph.value = '';
      ph.textContent = e.placeholder ? e.placeholder.text : 'Select an item';
      sel.appendChild(ph);
    }
    (e.options || []).forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.text.text;
      opt.selected = hasInitial && e.initial_option.value === o.value;
      sel.appendChild(opt);
    });
    if (!inModal) {
      sel.onchange = function () {
        fireAction({
          type: 'static_select', action_id: e.action_id, block_id: blockId,
          selected_option: sel.value ? { value: sel.value } : null
        });
      };
    }
    wrap.appendChild(sel);
    return wrap;
  }
  if (e.type === 'plain_text_input') {
    var field = document.createElement(e.multiline ? 'textarea' : 'input');
    field.className = 'field';
    if (e.multiline) field.rows = 3;
    if (e.max_length) field.maxLength = e.max_length;
    field.value = e.initial_value || '';
    wrap.appendChild(field);
    return wrap;
  }
  if (e.type === 'multi_users_select') {
    wrap.className = 'options';
    var picked = e.initial_users || [];
    ((S.data && S.data.users) || []).filter(function (u) { return u.id !== S.data.botUserId; }).forEach(function (u) {
      var label = document.createElement('label');
      label.innerHTML = '<input type="checkbox" value="' + esc(u.id) + '"' + (picked.indexOf(u.id) >= 0 ? ' checked' : '') + '><span>' + esc(u.realName) + '<small>' + esc(u.title) + '</small></span>';
      wrap.appendChild(label);
    });
    return wrap;
  }
  wrap.className = 'ctx';
  wrap.textContent = '[unsupported element: ' + e.type + ']';
  return wrap;
}

function renderBlock(b, inModal, index) {
  var blockId = b.block_id || 'block_' + index;
  var el;
  if (b.type === 'header') {
    el = node('<h2 class="header">' + textOf(b.text) + '</h2>');
  } else if (b.type === 'divider') {
    el = document.createElement('hr');
  } else if (b.type === 'section') {
    el = node('<div class="section"><div class="text">' + textOf(b.text) + '</div></div>');
    if (b.accessory) {
      var acc = document.createElement('div');
      acc.className = 'accessory';
      acc.appendChild(renderElement(b.accessory, blockId, inModal));
      el.appendChild(acc);
    }
  } else if (b.type === 'actions') {
    el = node('<div class="actions"></div>');
    b.elements.forEach(function (e) { el.appendChild(renderElement(e, blockId, inModal)); });
  } else if (b.type === 'context') {
    el = node('<div class="ctx">' + b.elements.map(textOf).join(' ') + '</div>');
  } else if (b.type === 'input') {
    el = node('<div class="input-block' + (b.optional ? ' optional' : '') + '"><span class="lbl">' + textOf(b.label) + (b.optional ? ' <span class="ctx">(optional)</span>' : '') + '</span></div>');
    el.appendChild(renderElement(b.element, blockId, true));
    el.appendChild(node('<div class="err">You must fill this in.</div>'));
  } else {
    el = node('<div class="ctx">[unsupported block: ' + esc(b.type) + ']</div>');
  }
  return el;
}

function renderBlocks(container, blocks, inModal) {
  blocks.forEach(function (b, i) { container.appendChild(renderBlock(b, inModal, i)); });
}

function renderHome() {
  page.innerHTML = '';
  var home = S.data.home;
  if (!home) { page.innerHTML = '<div class="empty">Loading…</div>'; return; }
  renderBlocks(page, home.blocks, false);
}

function renderMessages() {
  page.innerHTML = '<h2 class="header">Messages</h2><div class="actions"><button class="btn" id="previewReminder">Run /preview-reminder</button></div>';
  document.getElementById('previewReminder').onclick = function () { update('/api/preview-reminder'); };
  var messages = S.data.messages;
  if (!messages.length) {
    page.appendChild(node('<div class="empty">No messages yet. Try “Ask about lunch” or /preview-reminder.</div>'));
    return;
  }
  messages.forEach(function (m) {
    page.appendChild(node('<div class="card"><div class="meta"><b>' + esc(S.data.appName) + '</b> · ' + esc(m.channelLabel) + (m.ephemeral ? '<span class="tag">only you</span>' : '') + '</div>' + fmt(m.text, true) + '</div>'));
  });
}

function collectState(root) {
  var values = {};
  var valid = true;
  root.querySelectorAll('[data-el]').forEach(function (el) {
    var type = el.dataset.el;
    var block = el.dataset.block;
    var action = el.dataset.action;
    var state;
    if (type === 'checkboxes') {
      state = { type: type, selected_options: Array.prototype.slice.call(el.querySelectorAll('input:checked')).map(function (i) { return { value: i.value }; }) };
    } else if (type === 'radio_buttons') {
      var r = el.querySelector('input:checked');
      state = { type: type, selected_option: r ? { value: r.value } : null };
    } else if (type === 'static_select') {
      var s = el.querySelector('select').value;
      state = { type: type, selected_option: s ? { value: s } : null };
    } else if (type === 'plain_text_input') {
      state = { type: type, value: el.querySelector('.field').value || null };
    } else if (type === 'multi_users_select') {
      state = { type: type, selected_users: Array.prototype.slice.call(el.querySelectorAll('input:checked')).map(function (i) { return i.value; }) };
    } else {
      return;
    }
    (values[block] = values[block] || {})[action] = state;
    var inputBlock = el.closest('.input-block');
    if (inputBlock) {
      var filled = state.selected_options ? state.selected_options.length > 0 : state.selected_users ? state.selected_users.length > 0 : state.selected_option !== undefined ? !!state.selected_option : !!(state.value && state.value.trim());
      var bad = !inputBlock.classList.contains('optional') && !filled;
      inputBlock.classList.toggle('invalid', bad);
      if (bad) valid = false;
    }
  });
  return { values: values, valid: valid };
}

function renderModal() {
  var root = document.getElementById('modalRoot');
  var stack = S.data ? S.data.modals : [];
  var top = stack[stack.length - 1];
  var sig = JSON.stringify(top || null) + stack.length;
  if (sig === S.modalSig) return;
  S.modalSig = sig;
  root.innerHTML = '';
  if (!top) return;
  var overlay = node('<div class="overlay"><div class="dialog"><header><span>' + textOf(top.title) + '</span><button aria-label="Close">×</button></header><div class="body"></div><footer></footer></div></div>');
  var body = overlay.querySelector('.body');
  renderBlocks(body, top.blocks, true);
  var close = function () { update('/api/close-modal'); };
  overlay.querySelector('header button').onclick = close;
  var footer = overlay.querySelector('footer');
  if (top.close) {
    var c = node('<button class="btn">' + textOf(top.close) + '</button>');
    c.onclick = close;
    footer.appendChild(c);
  }
  if (top.submit && top.callback_id) {
    var s = node('<button class="btn primary">' + textOf(top.submit) + '</button>');
    s.onclick = function () {
      var state = collectState(body);
      if (!state.valid) return;
      update('/api/submit', { callbackId: top.callback_id, state: { values: state.values } });
    };
    footer.appendChild(s);
  }
  root.appendChild(overlay);
}

function renderSidebar() {
  var select = document.getElementById('userSelect');
  if (!select.options.length) {
    S.data.users.filter(function (u) { return u.id !== S.data.botUserId; }).forEach(function (u) {
      var o = document.createElement('option');
      o.value = u.id;
      o.textContent = u.realName + (u.homeOffice ? ' (' + u.homeOffice + ')' : '');
      select.appendChild(o);
    });
  }
  select.value = S.user;
  var me = userById(S.user);
  document.getElementById('who').innerHTML = avatar(me) + '<div><b>' + esc(me.realName) + '</b><small>' + esc(me.title) + '</small></div>';
  document.getElementById('appName').textContent = S.data.appName + ' (mock)';
  document.title = S.data.appName + ' Mock';
  var unread = S.tab === 'messages' ? 0 : unreadCount();
  document.getElementById('unread').innerHTML = unread ? '<span class="badge">' + unread + '</span>' : '';
  document.getElementById('navHome').classList.toggle('active', S.tab === 'home');
  document.getElementById('navMessages').classList.toggle('active', S.tab === 'messages');
}

function render() {
  var scroll = window.scrollY;
  if (S.tab === 'messages') {
    var latest = S.data.messages.reduce(function (m, x) { return Math.max(m, x.id); }, 0);
    S.seen[S.user] = latest;
  }
  renderSidebar();
  if (S.tab === 'home') renderHome(); else renderMessages();
  renderModal();
  window.scrollTo(0, scroll);
}

function switchUser(id) {
  S.user = id;
  S.modalSig = '';
  try { localStorage.setItem('okin-mock-user', id); } catch (e) { /* storage unavailable */ }
  return update('/api/state');
}

document.getElementById('userSelect').onchange = function (e) { switchUser(e.target.value); };
document.getElementById('navHome').onclick = function () { S.tab = 'home'; render(); };
document.getElementById('navMessages').onclick = function () { S.tab = 'messages'; render(); };
document.getElementById('reset').onclick = function () {
  if (window.confirm('Reset all demo data to the starting team?')) {
    S.seen = {};
    S.modalSig = '';
    update('/api/reset').then(function () { toast('Demo data reset'); });
  }
};

var saved = null;
try { saved = localStorage.getItem('okin-mock-user'); } catch (e) { /* storage unavailable */ }
var DEFAULT_USER = 'U_DEMO_ASTRID';
S.user = saved || DEFAULT_USER;
// A saved id can name a seeded member a later roster dropped; fall back to the default user.
api('/api/state').catch(function () {
  S.user = DEFAULT_USER;
  return api('/api/state');
}).then(function (d) {
  S.data = d;
  if (!userById(S.user) || S.user === d.botUserId) S.user = d.users[0].id;
  render();
}).catch(function (e) { toast(e.message, true); });
</script>
</body>
</html>`;
