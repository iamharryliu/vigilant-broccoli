import { z } from 'zod/v4';
import {
  API_KEY_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import {
  API_BASE_PATH,
  EMPLOYEE_HANDLER_ROUTES,
} from './employee-handler.contract';

const OPENAPI_VERSION = '3.0.0';
const API_KEY_SCHEME = 'ApiKeyAuth';
const EXPRESS_PARAM_PATTERN = /:(\w+)/g;
const SCHEMA_KEY = '$schema';
const NO_CONTENT_DESCRIPTION = 'No content';
const SUCCESS_DESCRIPTION = 'Success';
const NO_CONTENT_STATUS = 204;

type AnyRoute = {
  method: string;
  path: string;
  summary: string;
  status: number;
  body?: z.ZodType;
  response?: z.ZodType;
  binaryContentType?: string;
};

const toJsonSchema = (schema: z.ZodType) => {
  const jsonSchema: Record<string, unknown> = z.toJSONSchema(schema);
  delete jsonSchema[SCHEMA_KEY];
  return jsonSchema;
};

const jsonContent = (schema: z.ZodType) => ({
  [JSON_CONTENT_TYPE]: { schema: toJsonSchema(schema) },
});

const buildOperation = (route: AnyRoute) => {
  const pathParams = [...route.path.matchAll(EXPRESS_PARAM_PATTERN)].map(
    ([, name]) => ({
      name,
      in: 'path',
      required: true,
      schema: { type: 'string' },
    }),
  );
  const content = route.response
    ? jsonContent(route.response)
    : route.binaryContentType
      ? {
          [route.binaryContentType]: {
            schema: { type: 'string', format: 'binary' },
          },
        }
      : undefined;
  return {
    summary: route.summary,
    ...(pathParams.length ? { parameters: pathParams } : {}),
    ...(route.body
      ? { requestBody: { required: true, content: jsonContent(route.body) } }
      : {}),
    responses: {
      [route.status]: {
        description:
          route.status === NO_CONTENT_STATUS
            ? NO_CONTENT_DESCRIPTION
            : SUCCESS_DESCRIPTION,
        ...(content ? { content } : {}),
      },
    },
  };
};

export const createEmployeeHandlerOpenApiSpec = () => {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const route of Object.values(EMPLOYEE_HANDLER_ROUTES) as AnyRoute[]) {
    const openApiPath = `${API_BASE_PATH}${route.path.replace(EXPRESS_PARAM_PATTERN, '{$1}')}`;
    paths[openApiPath] = {
      ...paths[openApiPath],
      [route.method.toLowerCase()]: buildOperation(route),
    };
  }
  return {
    openapi: OPENAPI_VERSION,
    info: {
      title: 'Employee Handler API',
      version: '1.0.0',
      description:
        'HTTP contract between employee-handler-ui and an employee-handler upstream. Generated from the zod route definitions in @vigilant-broccoli/employee-handler.',
    },
    components: {
      securitySchemes: {
        [API_KEY_SCHEME]: {
          type: 'apiKey',
          in: 'header',
          name: API_KEY_HEADER,
        },
      },
    },
    security: [{ [API_KEY_SCHEME]: [] }],
    paths,
  };
};
