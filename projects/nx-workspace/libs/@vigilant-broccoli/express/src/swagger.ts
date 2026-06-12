import { API_KEY_HEADER } from '@vigilant-broccoli/common-js';

const OPENAPI_VERSION = '3.0.0';
const DEFAULT_VERSION = '1.0.0';

export const API_KEY_SCHEME = 'ApiKeyAuth';
export const DOCS_PATH = '/docs';

const apiKeySecuritySchemes = {
  [API_KEY_SCHEME]: {
    type: 'apiKey',
    in: 'header',
    name: API_KEY_HEADER,
  },
};

type SwaggerSpecOptions = {
  title: string;
  description: string;
  version?: string;
  paths: Record<string, unknown>;
  globalSecurity?: boolean;
};

export const createSwaggerSpec = ({
  title,
  description,
  version = DEFAULT_VERSION,
  paths,
  globalSecurity = false,
}: SwaggerSpecOptions) => ({
  openapi: OPENAPI_VERSION,
  info: { title, version, description },
  components: { securitySchemes: apiKeySecuritySchemes },
  ...(globalSecurity ? { security: [{ [API_KEY_SCHEME]: [] }] } : {}),
  paths,
});
