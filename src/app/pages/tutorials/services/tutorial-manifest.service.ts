import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';

export type TutorialManifest = ManifestItem[];

export enum Difficulty {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export type ManifestItem = {
  author: string;
  id: string;
  title: string;
  subtitle: string;
  difficulty?: Difficulty; // 1 = Beginner, 2 = Intermediate, 3 = Advanced
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
