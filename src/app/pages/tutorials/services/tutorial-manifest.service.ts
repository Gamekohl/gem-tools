import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';

export type TutorialManifest = ManifestItem[];

export type ManifestItem = {
  author: string;
  id: string;
  title: string;
  subtitle: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  etaMinutes?: number;
  tags?: string[];
  file: string;
};

@Injectable({ providedIn: 'root' })
export class TutorialManifestService {
  private readonly basePath = '/assets/tutorials';

  manifest$ = new BehaviorSubject<TutorialManifest | null>(null);

  constructor(private http: HttpClient) {
    this.getIndex().subscribe({
      next: manifest => this.manifest$.next(manifest)
    });
  }

  getIds(): Promise<string[]> {
    return firstValueFrom(
        this.getIndex().pipe(
            map(manifest => manifest.map(item => item.id))
        )
    );
  }

  getMarkdown$(file: string): Observable<string> {
    return this.http.get(`${this.basePath}/${file}`, { responseType: 'text' });
  }

  private getIndex(): Observable<TutorialManifest> {
    return this.http.get<TutorialManifest>(`${this.basePath}/index.json`);
  }
}
