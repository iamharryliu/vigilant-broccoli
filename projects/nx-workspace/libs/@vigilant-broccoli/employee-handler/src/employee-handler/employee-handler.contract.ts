import { z } from 'zod/v4';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const API_BASE_PATH = '/api';

const emailsBodySchema = z.object({ emails: z.array(z.string()) });

export const employeeSchema = z.object({
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedInURL: z.string().optional(),
  resumeUrl: z.string().optional(),
});

export const signatureSchema = z.object({
  email: z.string(),
  signatureString: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const signatureTemplateSchema = z.object({
  id: z.string(),
  label: z.string(),
  template: z.string(),
});

export const employeeAbsenceSchema = z.object({
  id: z.string(),
  employeeEmail: z.string(),
  employeeName: z.string(),
  type: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export const employeeMetadataUpdateSchema = z.object({
  email: z.string(),
  githubUrl: z.string().optional(),
  linkedInURL: z.string().optional(),
  resumeUrl: z.string().optional(),
});

export const uiConfigSchema = z.object({
  supabaseUrl: z.string(),
  supabasePublishableKey: z.string(),
});

type RouteDefinition<
  Body extends z.ZodType | undefined,
  Response extends z.ZodType | undefined,
> = {
  method: (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
  path: string;
  summary: string;
  status: number;
  body?: Body;
  response?: Response;
  binaryContentType?: string;
};

const defineRoute = <
  Body extends z.ZodType | undefined = undefined,
  Response extends z.ZodType | undefined = undefined,
>(
  route: RouteDefinition<Body, Response>,
) => route;

const { OK, CREATED, NO_CONTENT } = HTTP_STATUS_CODES;
export const ZIP_CONTENT_TYPE = 'application/zip';

export const EMPLOYEE_HANDLER_ROUTES = {
  employeesIncoming: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/employees/incoming',
    summary: 'List incoming employees',
    status: OK,
    response: z.object({
      employees: z.array(z.record(z.string(), z.unknown())),
    }),
  }),
  employeesActive: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/employees/active',
    summary: 'List active employees with their email signatures',
    status: OK,
    response: z.object({ employees: z.array(signatureSchema) }),
  }),
  employeesInactive: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/employees/inactive',
    summary: 'List inactive employee emails',
    status: OK,
    response: z.object({ employees: z.array(z.string()) }),
  }),
  employeesMetadata: defineRoute({
    method: HTTP_METHOD.PATCH,
    path: '/employees/metadata',
    summary: 'Update an employee’s GitHub, LinkedIn and resume links',
    status: OK,
    body: employeeMetadataUpdateSchema,
    response: z.object({ employee: employeeSchema }),
  }),
  absences: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/absences',
    summary: 'List employee absences',
    status: OK,
    response: z.object({ absences: z.array(employeeAbsenceSchema) }),
  }),
  onboard: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/onboard',
    summary: 'Onboard all incoming employees',
    status: NO_CONTENT,
  }),
  manualOnboard: defineRoute({
    method: HTTP_METHOD.POST,
    path: '/onboard/manualOnboard',
    summary: 'Onboard the given emails',
    status: NO_CONTENT,
    body: emailsBodySchema,
  }),
  offboard: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/offboard',
    summary: 'Offboard all inactive employees',
    status: NO_CONTENT,
  }),
  manualOffboard: defineRoute({
    method: HTTP_METHOD.POST,
    path: '/offboard/manualOffboard',
    summary: 'Offboard the given emails',
    status: NO_CONTENT,
    body: emailsBodySchema,
  }),
  recover: defineRoute({
    method: HTTP_METHOD.POST,
    path: '/recover',
    summary: 'Recover the given emails',
    status: NO_CONTENT,
    body: emailsBodySchema,
  }),
  sync: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/sync',
    summary: 'Run the data sync',
    status: NO_CONTENT,
  }),
  birthdaysSync: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/birthdays/sync',
    summary: 'Sync birthdays to the calendar target',
    status: NO_CONTENT,
  }),
  leavesSync: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/leaves/sync',
    summary: 'Sync leaves to the calendar target',
    status: NO_CONTENT,
  }),
  postRetentionCleanup: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/postRetentionCleanup',
    summary: 'Run the post-retention cleanup',
    status: NO_CONTENT,
  }),
  signatureList: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/signature/list',
    summary: 'List email signatures',
    status: OK,
    response: z.object({ signatures: z.array(signatureSchema) }),
  }),
  signatureUpdate: defineRoute({
    method: HTTP_METHOD.POST,
    path: '/signature/update',
    summary: 'Set one employee’s email signature',
    status: NO_CONTENT,
    body: z.object({ email: z.string().min(1), template: z.string() }),
  }),
  signatureUpdateAll: defineRoute({
    method: HTTP_METHOD.POST,
    path: '/signature/updateAll',
    summary: 'Set every employee’s email signature',
    status: NO_CONTENT,
    body: z.object({ template: z.string() }),
  }),
  signatureUpdateEmailSignatures: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/signature/updateEmailSignatures',
    summary: 'Push generated signatures to the mail provider',
    status: NO_CONTENT,
  }),
  signatureEmailZipped: defineRoute({
    method: HTTP_METHOD.POST,
    path: '/signature/emailZippedSignatures',
    summary: 'Email the zipped signatures to the given addresses',
    status: NO_CONTENT,
    body: emailsBodySchema,
  }),
  signatureDownloadZipped: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/signature/downloadZippedSignatures',
    summary: 'Download the generated signatures as a zip',
    status: OK,
    binaryContentType: ZIP_CONTENT_TYPE,
  }),
  signatureTemplatesList: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/signature-templates',
    summary: 'List signature templates',
    status: OK,
    response: z.object({ templates: z.array(signatureTemplateSchema) }),
  }),
  signatureTemplatesCreate: defineRoute({
    method: HTTP_METHOD.POST,
    path: '/signature-templates',
    summary: 'Create a signature template',
    status: CREATED,
    body: signatureTemplateSchema.extend({ id: z.string().min(1) }),
    response: signatureTemplateSchema,
  }),
  signatureTemplatesUpdate: defineRoute({
    method: HTTP_METHOD.PATCH,
    path: '/signature-templates/:id',
    summary: 'Update a signature template',
    status: OK,
    body: signatureTemplateSchema.omit({ id: true }).partial(),
    response: signatureTemplateSchema,
  }),
  signatureTemplatesDelete: defineRoute({
    method: HTTP_METHOD.DELETE,
    path: '/signature-templates/:id',
    summary: 'Delete a signature template',
    status: NO_CONTENT,
  }),
} as const;

/** Served by the UI itself; an upstream backend does not implement it. */
export const EMPLOYEE_HANDLER_UI_ROUTES = {
  config: defineRoute({
    method: HTTP_METHOD.GET,
    path: '/config',
    summary: 'Public client configuration for the UI',
    status: OK,
    response: uiConfigSchema,
  }),
} as const;

export type EmployeeHandlerRouteId = keyof typeof EMPLOYEE_HANDLER_ROUTES;

type InferSchema<Schema> = [NonNullable<Schema>] extends [never]
  ? undefined
  : NonNullable<Schema> extends z.ZodType
    ? z.infer<NonNullable<Schema>>
    : undefined;

type RouteBody<Id extends EmployeeHandlerRouteId> = InferSchema<
  (typeof EMPLOYEE_HANDLER_ROUTES)[Id]['body']
>;

type RouteResponse<Id extends EmployeeHandlerRouteId> = InferSchema<
  (typeof EMPLOYEE_HANDLER_ROUTES)[Id]['response']
>;

export type EmployeeHandlerRouteBody<Id extends EmployeeHandlerRouteId> =
  RouteBody<Id>;
export type EmployeeHandlerRouteResponse<Id extends EmployeeHandlerRouteId> =
  RouteResponse<Id>;

export type EmailsBody = z.infer<typeof emailsBodySchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type Signature = z.infer<typeof signatureSchema>;
export type EmployeeMetadataUpdate = z.infer<
  typeof employeeMetadataUpdateSchema
>;

export const apiPath = (route: { path: string }): string =>
  `${API_BASE_PATH}${route.path}`;
