import {
  DEFAULT_TEMPLATES,
  SignatureTemplate,
} from '../app/dashboard/signatures/signatures.shared';

const GLOBAL_KEY = '__signatureTemplatesStore__';
type GlobalWithStore = typeof globalThis & {
  [GLOBAL_KEY]?: Map<string, SignatureTemplate>;
};
const globalScope = globalThis as GlobalWithStore;

const initStore = () => {
  const store = new Map<string, SignatureTemplate>();
  for (const template of DEFAULT_TEMPLATES) {
    store.set(template.id, template);
  }
  return store;
};

const getStore = (): Map<string, SignatureTemplate> => {
  if (!globalScope[GLOBAL_KEY]) {
    globalScope[GLOBAL_KEY] = initStore();
  }
  return globalScope[GLOBAL_KEY];
};

export const listTemplates = (): SignatureTemplate[] =>
  Array.from(getStore().values());

export const createTemplate = (
  template: SignatureTemplate,
): SignatureTemplate => {
  getStore().set(template.id, template);
  return template;
};

export const updateTemplate = (
  id: string,
  patch: Partial<SignatureTemplate>,
): SignatureTemplate | undefined => {
  const store = getStore();
  const existing = store.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch, id: existing.id };
  store.set(id, updated);
  return updated;
};

export const deleteTemplate = (id: string): boolean => getStore().delete(id);
