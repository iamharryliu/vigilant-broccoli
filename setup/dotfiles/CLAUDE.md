# CLAUDE — setup/dotfiles

## Table of Contents

- [Nuances](#nuances)
  - [A trailing `cmd && ...` in an rc file makes sourcing it return non-zero](#a-trailing-cmd---in-an-rc-file-makes-sourcing-it-return-non-zero)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../docs/nuance-pattern.md) is the convention.

### A trailing `cmd && ...` in an rc file makes sourcing it return non-zero

`.rc.bash` ended with `command -v mise >/dev/null && eval "$(mise activate
bash)"`. On a machine without mise (every Linux box — mise is only in the mac
`Brewfile`) the `command -v` fails, so the last statement of the file returns
1, and therefore so does `source .rc.bash`. Nothing is printed; the file did
exactly what it was told.

That broke `test-smoke-machine-setup`'s "Verify the rc chain sources cleanly"
step, whose whole point is to source the file under `set -e`. The failure was
opaque: because stderr was redirected to a log the step only inspects _after_
the source, `set -e` aborted first and the step failed with no output at all.

Guard optional activations with `if command -v x; then ... fi` (the form
`.rc.zsh` already uses) rather than an `&&` one-liner, so the file always ends
on a zero status. The same trap applies to any rc file: a non-zero exit leaks
into `$?` at the start of every shell and aborts any `set -e` script that
sources it.
