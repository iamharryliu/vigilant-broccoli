# Agent Context — .github

Read [workflow-conventions.md](../docs/ci/workflow-conventions.md) before workflow changes.

## Table of Contents

- [Nuances](#nuances)
  - [A double-quoted font family silently kills the whole `style="..."` attribute](#a-double-quoted-font-family-silently-kills-the-whole-style-attribute)

## Nuances

### A double-quoted font family silently kills the whole `style="..."` attribute

In `.github/scripts/agentic-solve-email.mjs`, font stacks are interpolated into double-quoted HTML `style` attributes. Double quotes around a font name terminate the attribute, silently discarding later styles. Use single quotes for names such as `'Segoe UI'`; the same stack also works in `<style>` blocks.
