import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'resources',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'animations',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'changelog',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'maps',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
