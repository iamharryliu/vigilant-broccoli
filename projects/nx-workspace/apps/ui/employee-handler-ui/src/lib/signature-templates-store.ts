import { createSignatureTemplatesStore } from '@vigilant-broccoli/employee-handler';
import { DEFAULT_TEMPLATES } from '../app/dashboard/signatures/signatures.shared';

const store = createSignatureTemplatesStore(DEFAULT_TEMPLATES);

export const listTemplates = store.list;
export const createTemplate = store.create;
export const updateTemplate = store.update;
export const deleteTemplate = store.delete;
