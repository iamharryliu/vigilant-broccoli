import { API_KEY_HEADER } from '@vigilant-broccoli/common-js';

const OPENAPI_VERSION = '3.0.0';
const DEFAULT_VERSION = '1.0.0';
const SWAGGER_UI_CDN_VERSION = '5.17.14';
const SWAGGER_UI_CDN_BASE = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_CDN_VERSION}`;

export const API_KEY_SCHEME = 'ApiKeyAuth';
export const DOCS_PATH = '/docs';

export const swaggerUiCdnOptions = {
  customCssUrl: `${SWAGGER_UI_CDN_BASE}/swagger-ui.css`,
  customJs: [
    `${SWAGGER_UI_CDN_BASE}/swagger-ui-bundle.js`,
    `${SWAGGER_UI_CDN_BASE}/swagger-ui-standalone-preset.js`,
  ],
  customfavIcon: `${SWAGGER_UI_CDN_BASE}/favicon-32x32.png`,
};

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
