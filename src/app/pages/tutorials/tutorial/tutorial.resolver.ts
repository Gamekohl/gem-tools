import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import type {ManifestItem} from '../services/tutorial-manifest.service';
import {TutorialManifestService} from '../services/tutorial-manifest.service';

export type TutorialResolved = {
  item: ManifestItem;
  markdown: string;
};

export const tutorialResolver: ResolveFn<TutorialResolved | null> = (route) => {
  const manifestSvc = inject(TutorialManifestService);
  const id = route.paramMap.get('id');

  if (!id) {
    return of(null);
  }

  return manifestSvc.manifest$.pipe(
    map(manifest => manifest.find(item => item.id === id) ?? null),
    switchMap(item =>
      item
        ? manifestSvc.getMarkdown$(item.file).pipe(
          map(markdown => ({ item, markdown })),
          catchError(() => of(null))
        )
        : of(null)
    ),
    catchError(() => of(null))
  );
};
