export default {
  '**/*.{ts,tsx}': () => 'pnpm nx run hearth:typecheck',
};
