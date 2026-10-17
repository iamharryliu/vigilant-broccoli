# Agent Context — setup/dotfiles

## Table of Contents

- [Nuances](#nuances)
  - [A trailing `cmd && ...` in an rc file makes sourcing it return non-zero](#a-trailing-cmd---in-an-rc-file-makes-sourcing-it-return-non-zero)

## Nuances

### A trailing `cmd && ...` in an rc file makes sourcing it return non-zero

If an rc file ends with `command -v mise && ...`, missing mise makes `source` return 1 and aborts callers using `set -e`, including machine-setup smoke checks. Guard optional activations with `if command -v x; then ...; fi` so the rc file returns success when the tool is absent.
