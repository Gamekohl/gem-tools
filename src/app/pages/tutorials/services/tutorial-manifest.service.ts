import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, shareReplay} from 'rxjs/operators';
import {firstValueFrom, Observable} from 'rxjs';

export type TutorialManifest = {
  groups: ManifestGroup[];
};

export type ManifestGroup = {
  title: string;
  items: ManifestItem[];
};

export type ManifestItem = {
  id: string;
  title: string;
  subtitle: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  etaMinutes?: number;
  tags?: string[];
  file: string; // e.g. "tiles-layers-brushes.md"
};

@Injectable({ providedIn: 'root' })
export class TutorialManifestService {
  private readonly basePath = '/assets/tutorials';

  constructor(private http: HttpClient) {}

  getIds(): Promise<string[]> {
    return firstValueFrom(
        this.getManifest$().pipe(
            map(manifest => manifest.groups.flatMap(g => g.items).map(i => i.id))
        )
    );
  }

  getManifest$(): Observable<TutorialManifest> {
    return this.http
        .get<TutorialManifest>(`${this.basePath}/index.json`)
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getMarkdown$(file: string): Observable<string> {
    return this.http.get(`${this.basePath}/${file}`, { responseType: 'text' });
  }
}
