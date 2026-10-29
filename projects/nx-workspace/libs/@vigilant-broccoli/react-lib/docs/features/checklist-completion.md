# Checklist completion

## Behavior

- Completing and reopening rows use a brief collapse and arrival transition in card and dense checklists.
- Existing rows do not animate on initial load; reduced motion disables completion animation.
- Completion counts reflect current data while rows finish moving between sections.
- Write errors keep existing rows visible alongside the error so rollback remains usable.
- Persistence remains optimistic; pending requests prevent repeated toggles and failed requests restore the original state.
- Sortable membership follows the visible active rows without changing task drag payloads.
