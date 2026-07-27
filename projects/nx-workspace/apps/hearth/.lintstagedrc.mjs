export default {
  '**/*.{ts,tsx}': () => 'pnpm exec tsc --noEmit -p tsconfig.json',
};
