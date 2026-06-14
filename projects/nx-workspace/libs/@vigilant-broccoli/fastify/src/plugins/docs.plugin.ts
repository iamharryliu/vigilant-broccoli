import { FastifyPluginAsync } from 'fastify';
import { CONTENT_TYPE_HEADER } from '@vigilant-broccoli/common-js';
import { DOCS_PATH, swaggerUiCdnOptions } from '../swagger';

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

const buildHtml = (specUrl: string, title: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<link rel="icon" type="image/png" href="${swaggerUiCdnOptions.customfavIcon}" sizes="32x32" />
<link rel="stylesheet" href="${swaggerUiCdnOptions.customCssUrl}" />
</head>
<body>
<div id="swagger-ui"></div>
${swaggerUiCdnOptions.customJs.map(src => `<script src="${src}" crossorigin></script>`).join('\n')}
<script>
window.onload = () => {
  window.ui = SwaggerUIBundle({
    url: '${specUrl}',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout',
  });
};
</script>
</body>
</html>`;

export const createDocsPlugin =
  (spec: unknown, title = 'API Docs'): FastifyPluginAsync =>
  async app => {
    app.get(`${DOCS_PATH}/json`, async () => spec);
    app.get(DOCS_PATH, async (_req, reply) => {
      reply.header(CONTENT_TYPE_HEADER, HTML_CONTENT_TYPE);
      return buildHtml(`${DOCS_PATH}/json`, title);
    });
  };
