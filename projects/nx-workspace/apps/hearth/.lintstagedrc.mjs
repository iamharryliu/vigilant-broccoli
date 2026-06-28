export default {
  '**/*.{ts,tsx}': () => 'tsc --noEmit -p tsconfig.json',
};
