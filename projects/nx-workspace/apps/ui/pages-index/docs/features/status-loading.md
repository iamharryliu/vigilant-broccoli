# Status Loading

- All status groups reserve the same sorted service rows, headings, borders and responsive columns while the summary is pending; placeholders are decorative and never link to services or claim availability.
- Vite reads names and URLs directly from the root `.upptimerc.yml`; the YAML parser runs only at build time. Inventory edits restart local Vite and invalidate the Nx build through a content hash.
- Exact loading heights assume the remote summary matches the built inventory. Added or removed remote services can change section heights until the inventory and deployed build catch up.
