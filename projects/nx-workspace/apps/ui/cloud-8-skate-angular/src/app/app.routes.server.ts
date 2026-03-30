import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'calendar', renderMode: RenderMode.Prerender },
  { path: 'faq', renderMode: RenderMode.Prerender },
  { path: 'more', renderMode: RenderMode.Prerender },
  { path: 'more/:id', renderMode: RenderMode.Server },
  { path: 'playlists', renderMode: RenderMode.Prerender },
  { path: 'skate-terminology', renderMode: RenderMode.Prerender },
  { path: 'gallery', renderMode: RenderMode.Prerender },
  { path: 'gallery/:albumSlug', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
