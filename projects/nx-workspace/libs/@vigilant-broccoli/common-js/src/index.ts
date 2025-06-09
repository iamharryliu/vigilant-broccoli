export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
} as const;

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE];

// LLM
export * from './lib/llm/llm.consts';
export * from './lib/llm/llm.types';

// JSON Placeholder
export * from './lib/jsonplaceholder/jsonplaceholder.services';

// Utils
export * from './lib/utils/json.utils';
export * from './lib/utils/string.utils';
