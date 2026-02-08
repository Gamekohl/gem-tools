import {isPlatformServer} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Inject, inject, Injectable, makeStateKey, PLATFORM_ID, TransferState} from '@angular/core';
import {defer, firstValueFrom, Observable, shareReplay, tap} from 'rxjs';
import {map} from 'rxjs/operators';

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
    preview?: string;
    featured?: boolean
};

@Injectable({providedIn: 'root'})
export class TutorialManifestService {
    private readonly http = inject(HttpClient);
    private readonly transferState = inject(TransferState);

    private readonly basePath = '/assets/tutorials';
    private readonly manifestKey = makeStateKey<TutorialManifest>('tutorial-manifest');

    readonly manifest$ = defer(() => {
        return this.getIndex().pipe(
            tap(manifest => {
                if (isPlatformServer(this.platformId)) {
                    this.transferState.set(this.manifestKey, manifest);
                }
            })
        );
    }).pipe(shareReplay({bufferSize: 1, refCount: false}));

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    }

    getIds(): Promise<string[]> {
        return firstValueFrom(
            this.manifest$.pipe(
                map(manifest => manifest.map(item => item.id))
            )
        );
    }

    getMarkdown$(file: string): Observable<string> {
        const key = makeStateKey<string>(`tutorial-md:${file}`);

        return defer(() => {
            return this.http.get(`${this.basePath}/${file}`, {responseType: 'text'}).pipe(
                tap(markdown => {
                    if (isPlatformServer(this.platformId)) {
                        this.transferState.set(key, markdown);
                    }
                })
            );
        });
    }

    private getIndex(): Observable<TutorialManifest> {
        return this.http.get<TutorialManifest>(`${this.basePath}/index.json`);
    }
}
