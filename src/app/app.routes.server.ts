import {inject} from "@angular/core";
import {RenderMode, ServerRoute} from '@angular/ssr';
import {TutorialManifestService} from "./pages/tutorials/services/tutorial-manifest.service";

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
    path: 'tutorials',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'tutorials/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const tutorialManifestService = inject(TutorialManifestService);
      const ids = await tutorialManifestService.getIds();

      return ids.map(id => ({ id }));
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
