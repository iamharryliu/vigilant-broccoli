/// <reference types="@cloudflare/workers-types" />

import { AngularAppEngine } from '@angular/ssr';

const angularApp = new AngularAppEngine();

export default {
  async fetch(request: Request): Promise<Response> {
    const response = await angularApp.handle(request);
    return response ?? new Response('Page not found', { status: 404 });
  },
} satisfies ExportedHandler;
