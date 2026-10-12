---
name: update-feature-documentation
description: In vigilant-broccoli, create or update the slim docs/features note under the affected app for this conversation's changes.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Create or update `docs/features/<feature>/` under the owning app/lib for this conversation's changes; only cross-app features belong at workspace level.

Use headings and bullets, one line per behavior. Omit code-obvious details, file/env inventories and key-file tables unless essential to usage or a non-obvious constraint. Verify the note against the implementation.
