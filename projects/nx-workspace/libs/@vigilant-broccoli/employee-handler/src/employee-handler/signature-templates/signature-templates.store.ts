export type SignatureTemplate = {
  id: string;
  label: string;
  template: string;
};

const GLOBAL_KEY = '__signatureTemplatesStore__';
type GlobalWithStore = typeof globalThis & {
  [GLOBAL_KEY]?: Map<string, SignatureTemplate>;
};
const globalScope = globalThis as GlobalWithStore;

const getStore = (
  seed: SignatureTemplate[],
): Map<string, SignatureTemplate> => {
  if (!globalScope[GLOBAL_KEY]) {
    const store = new Map<string, SignatureTemplate>();
    for (const template of seed) store.set(template.id, template);
    globalScope[GLOBAL_KEY] = store;
  }
  return globalScope[GLOBAL_KEY];
};

export const createSignatureTemplatesStore = (seed: SignatureTemplate[]) => ({
  list: (): SignatureTemplate[] => Array.from(getStore(seed).values()),
  create: (template: SignatureTemplate): SignatureTemplate => {
    getStore(seed).set(template.id, template);
    return template;
  },
  update: (
    id: string,
    patch: Partial<SignatureTemplate>,
  ): SignatureTemplate | undefined => {
    const store = getStore(seed);
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, id: existing.id };
    store.set(id, updated);
    return updated;
  },
  delete: (id: string): boolean => getStore(seed).delete(id),
});

export type SignatureTemplatesStore = ReturnType<
  typeof createSignatureTemplatesStore
>;
