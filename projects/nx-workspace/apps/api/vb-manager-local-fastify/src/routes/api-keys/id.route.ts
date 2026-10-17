import { getVbExpressApiKey } from '../../libs/vb-express';
import {
  API_KEY_HEADER,
  HTTP_HEADERS,
  HTTP_STATUS_CODES,
  VB_EXPRESS_ADMIN_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

type RouteContext = { params: { id: string } };

const adminApiKeyUrl = (id: string) =>
  `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ADMIN_ENDPOINT.API_KEYS}/${id}`;

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = params;
  const body = await request.json();
  const res = await fetch(adminApiKeyUrl(id), {
    method: 'PATCH',
    headers: {
      ...HTTP_HEADERS.CONTENT_TYPE.JSON,
      [API_KEY_HEADER]: getVbExpressApiKey(),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = params;
  const res = await fetch(adminApiKeyUrl(id), {
    method: 'DELETE',
    headers: { [API_KEY_HEADER]: getVbExpressApiKey() },
  });
  if (res.status === HTTP_STATUS_CODES.NO_CONTENT) {
    return new Response(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
  }
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
