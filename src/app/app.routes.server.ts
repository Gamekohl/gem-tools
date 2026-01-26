import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'search/resources',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'search/animations',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'changelog',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
