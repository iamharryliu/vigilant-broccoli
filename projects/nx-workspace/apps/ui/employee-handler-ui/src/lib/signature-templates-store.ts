import { createSignatureTemplatesStore } from '@vigilant-broccoli/employee-handler';

const store = createSignatureTemplatesStore([]);

export const listTemplates = store.list;
export const createTemplate = store.create;
export const updateTemplate = store.update;
export const deleteTemplate = store.delete;
