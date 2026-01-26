import { isPlatformBrowser } from '@angular/common';
import {
    Injectable,
    PLATFORM_ID,
    effect,
    inject,
    signal,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesStore {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    private readonly storageKey = 'gemtools:favorites:v1';

    private readonly _favorites = signal<Set<string>>(new Set());

    favorites = this._favorites.asReadonly();

    constructor() {
        if (this.isBrowser) {
            this._favorites.set(this.readFromStorage());
        }

        effect(() => {
            if (!this.isBrowser) return;

            const set = this._favorites();
            const arr = Array.from(set.values()).sort();
            localStorage.setItem(this.storageKey, JSON.stringify(arr));
        });
    }

    isFavorite(id: string): boolean {
        return this._favorites().has(id);
    }

    toggle(id: string): void {
        const next = new Set(this._favorites());
        if (next.has(id)) next.delete(id);
        else next.add(id);
        this._favorites.set(next);
    }

    private readFromStorage(): Set<string> {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return new Set();

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return new Set();

            // keep only strings
            return new Set(parsed.filter((x) => typeof x === 'string'));
        } catch {
            return new Set();
        }
    }
}
