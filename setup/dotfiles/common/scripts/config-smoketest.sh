#!/usr/bin/env bash
# Regression test for setup/dotfiles/.config/nvim/init.lua and setup/dotfiles/.tmux.conf:
# catches accidental breakage of custom keymaps/options on future config edits.

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)
NVIM_INIT="$REPO_ROOT/setup/dotfiles/.config/nvim/init.lua"
TMUX_CONF="$REPO_ROOT/setup/dotfiles/.tmux.conf"

WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

FAIL=0

report() {
  while IFS='|' read -r status name actual expected; do
    [ -z "$status" ] && continue
    if [ "$status" = "PASS" ]; then
      echo "PASS: $name"
    else
      echo "FAIL: $name (expected [$expected], got [$actual])"
      FAIL=1
    fi
  done < "$1"
}

# ---- nvim, simulating Neovide (vim.g.neovide = true) ----
cat > "$WORKDIR/check_neovide.lua" <<'LUA'
local results = {}

local function mapping(mode, lhs)
  local m = vim.fn.maparg(lhs, mode, false, true)
  if not m or not m.lhs then return nil end
  if m.callback then return "<function>" end
  return m.rhs
end

local function check(name, actual, expected)
  local pass
  if expected == "<present>" then
    pass = actual ~= nil
  elseif expected == "<absent>" then
    pass = actual == nil
  else
    pass = actual == expected
  end
  table.insert(results, string.format("%s|%s|%s|%s", pass and "PASS" or "FAIL", name, tostring(actual), tostring(expected)))
end

check("neovide n <D-c>", mapping("n", "<D-c>"), '"+y')
check("neovide v <D-c>", mapping("v", "<D-c>"), '"+y')
check("neovide n <D-v>", mapping("n", "<D-v>"), '"+p')
check("neovide i <D-v>", mapping("i", "<D-v>"), "<C-r>+")
check("neovide c <D-v>", mapping("c", "<D-v>"), "<C-r>+")
check("neovide t <D-v>", mapping("t", "<D-v>"), [[<C-\><C-n>"+pi]])
check("neovide n <D-s>", mapping("n", "<D-s>"), "<cmd>write<CR>")
check("neovide i <D-s>", mapping("i", "<D-s>"), "<cmd>write<CR>")
check("neovide t <D-s> (forwards Ctrl-S into terminal)", mapping("t", "<D-s>"), "<present>")
check("neovide n <D-w>", mapping("n", "<D-w>"), "<cmd>bdelete<CR>")
check("neovide n <D-z>", mapping("n", "<D-z>"), "u")
check("neovide n <D-S-z>", mapping("n", "<D-S-z>"), "<C-r>")
check("neovide n <D-t>", mapping("n", "<D-t>"), "<cmd>tabnew<CR>")
check("global n <C-s>", mapping("n", "<C-s>"), "<cmd>write<CR>")
check("global i <C-s>", mapping("i", "<C-s>"), "<cmd>write<CR>")

check("mapleader", vim.g.mapleader, " ")
check("opt clipboard", vim.o.clipboard, "unnamedplus")
check("opt mouse", vim.o.mouse, "a")
check("opt number", vim.o.number, true)
check("opt relativenumber", vim.o.relativenumber, true)
check("opt signcolumn", vim.o.signcolumn, "yes")
check("opt tabstop", vim.o.tabstop, 2)
check("opt shiftwidth", vim.o.shiftwidth, 2)
check("opt expandtab", vim.o.expandtab, true)
check("opt ignorecase", vim.o.ignorecase, true)
check("opt smartcase", vim.o.smartcase, true)
check("opt undofile", vim.o.undofile, true)
check("opt scrolloff", vim.o.scrolloff, 8)

-- TermOpen autocmd: local options + buffer-local terminal-mode keymaps
vim.cmd("terminal")
vim.wait(400)
check("term local number", vim.wo.number, false)
check("term local relativenumber", vim.wo.relativenumber, false)
check("term local signcolumn", vim.wo.signcolumn, "no")
check("term buffer <M-Left>", mapping("t", "<M-Left>"), "<Esc>b")
check("term buffer <M-Right>", mapping("t", "<M-Right>"), "<Esc>f")
check("term buffer <M-BS>", mapping("t", "<M-BS>"), "<C-w>")

local f = io.open(os.getenv("SMOKETEST_OUT"), "w")
for _, line in ipairs(results) do
  f:write(line .. "\n")
end
f:close()
vim.cmd("qa!")
LUA

SMOKETEST_OUT="$WORKDIR/neovide_results.txt" NVIM_SMOKETEST=1 nvim --headless \
  --cmd 'lua vim.g.neovide = true' \
  -u "$NVIM_INIT" \
  -S "$WORKDIR/check_neovide.lua" 2>"$WORKDIR/neovide_stderr.txt"
report "$WORKDIR/neovide_results.txt"
if [ -s "$WORKDIR/neovide_stderr.txt" ]; then
  echo "FAIL: init.lua produced stderr output with vim.g.neovide=true"
  cat "$WORKDIR/neovide_stderr.txt"
  FAIL=1
fi

# ---- End-to-end: <D-s> pressed while attached to a terminal (e.g. a tmuxvb pane) must
# actually forward a working Ctrl-S byte to whatever nvim is running inside it, not just
# have *a* mapping registered (the "<present>" check above only proves that). This needs
# a real --listen server + a separate --remote-send client: nvim_input()/:startinsert
# called from within the same headless -S script never actually enters active Terminal
# mode (mode() stays "nt"), since there's no attached UI client driving it.
E2E_SOCK="$WORKDIR/e2e.sock"
E2E_MARKER="$WORKDIR/e2e_marker.txt"
E2E_RC="$WORKDIR/e2e_rc.lua"
cat > "$E2E_RC" <<LUA
vim.keymap.set("n", "<C-s>", function()
  local f = io.open("$E2E_MARKER", "w")
  f:write("saved")
  f:close()
end, {})
LUA

NVIM_SMOKETEST=1 nvim --headless --listen "$E2E_SOCK" --cmd 'lua vim.g.neovide = true' -u "$NVIM_INIT" >/dev/null 2>&1 &
E2E_PID=$!

waited=0
while [ ! -S "$E2E_SOCK" ] && [ "$waited" -lt 5000 ]; do
  sleep 0.1
  waited=$((waited + 100))
done

nvim --server "$E2E_SOCK" --remote-expr "execute('terminal nvim --clean -u $E2E_RC')" >/dev/null 2>&1
sleep 1.5
nvim --server "$E2E_SOCK" --remote-expr "execute('startinsert')" >/dev/null 2>&1
sleep 0.5
nvim --server "$E2E_SOCK" --remote-send '<D-s>' >/dev/null 2>&1

waited=0
while [ ! -f "$E2E_MARKER" ] && [ "$waited" -lt 5000 ]; do
  sleep 0.1
  waited=$((waited + 100))
done

if [ -f "$E2E_MARKER" ]; then
  echo "PASS: end-to-end <D-s> forwards Ctrl-S to a nested nvim inside the terminal"
else
  echo "FAIL: end-to-end <D-s> forwards Ctrl-S to a nested nvim inside the terminal"
  FAIL=1
fi

kill "$E2E_PID" 2>/dev/null
wait "$E2E_PID" 2>/dev/null

# ---- nvim, plain (no Neovide): D-* mappings must NOT leak out of the neovide gate ----
cat > "$WORKDIR/check_plain.lua" <<'LUA'
local results = {}

local function mapping(mode, lhs)
  local m = vim.fn.maparg(lhs, mode, false, true)
  if not m or not m.lhs then return nil end
  return true
end

local function check(name, actual, expected)
  local pass = (expected == "<absent>") == (actual == nil)
  table.insert(results, string.format("%s|%s|%s|%s", pass and "PASS" or "FAIL", name, tostring(actual), tostring(expected)))
end

check("plain n <D-s> absent", mapping("n", "<D-s>"), "<absent>")
check("plain n <D-w> absent", mapping("n", "<D-w>"), "<absent>")
check("plain n <D-z> absent", mapping("n", "<D-z>"), "<absent>")
check("plain n <D-t> absent", mapping("n", "<D-t>"), "<absent>")
check("plain n <C-s> present (must work in nested/plain nvim)", mapping("n", "<C-s>"), "<present>")

local f = io.open(os.getenv("SMOKETEST_OUT"), "w")
for _, line in ipairs(results) do
  f:write(line .. "\n")
end
f:close()
vim.cmd("qa!")
LUA

SMOKETEST_OUT="$WORKDIR/plain_results.txt" NVIM_SMOKETEST=1 nvim --headless \
  -u "$NVIM_INIT" \
  -S "$WORKDIR/check_plain.lua" 2>"$WORKDIR/plain_stderr.txt"
report "$WORKDIR/plain_results.txt"
if [ -s "$WORKDIR/plain_stderr.txt" ]; then
  echo "FAIL: init.lua produced stderr output without vim.g.neovide"
  cat "$WORKDIR/plain_stderr.txt"
  FAIL=1
fi

# ---- tmux: config must load cleanly, and custom prefix/bindings must be registered ----
TMUX_SOCK="$WORKDIR/tmux.sock"
if tmux -S "$TMUX_SOCK" -f "$TMUX_CONF" new-session -d -s smoketest 2>"$WORKDIR/tmux_stderr.txt"; then
  echo "PASS: tmux config loads without error"
else
  echo "FAIL: tmux config failed to load"
  cat "$WORKDIR/tmux_stderr.txt"
  FAIL=1
fi

if [ -s "$WORKDIR/tmux_stderr.txt" ]; then
  echo "FAIL: tmux config produced stderr output"
  cat "$WORKDIR/tmux_stderr.txt"
  FAIL=1
fi

PREFIX=$(tmux -S "$TMUX_SOCK" show-options -g prefix 2>/dev/null | awk '{print $2}')
if [ "$PREFIX" = "C-Space" ]; then
  echo "PASS: tmux prefix is C-Space"
else
  echo "FAIL: tmux prefix expected C-Space, got [$PREFIX]"
  FAIL=1
fi

for key in '|' '-' h j k l; do
  if tmux -S "$TMUX_SOCK" list-keys -T prefix 2>/dev/null | grep -qF " $key "; then
    echo "PASS: tmux prefix binding for '$key' registered"
  else
    echo "FAIL: tmux prefix binding for '$key' missing"
    FAIL=1
  fi
done

tmux -S "$TMUX_SOCK" kill-server 2>/dev/null

if [ "$FAIL" -eq 0 ]; then
  echo "All config smoke tests passed."
else
  echo "Config smoke tests FAILED."
fi
exit $FAIL
