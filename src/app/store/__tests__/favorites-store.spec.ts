import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import {FavoritesStore} from "../favorites-store";

describe('FavoritesStore', () => {
    const storageKey = 'gemtools:favorites:v1';

    let getItemSpy: jest.SpyInstance;
    let setItemSpy: jest.SpyInstance;

    beforeEach(() => {
        getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
        setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

        localStorage.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        getItemSpy.mockRestore();
        setItemSpy.mockRestore();
    });

    describe('browser platform', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    FavoritesStore,
                    { provide: PLATFORM_ID, useValue: 'browser' },
                ],
            });
        });

        it('initializes favorites from localStorage (filters to strings)', () => {
            localStorage.setItem(storageKey, JSON.stringify(['b', 1, null, 'a', { x: 1 }, 'c']));

            const store = TestBed.inject(FavoritesStore);

            expect(store.favorites().has('a')).toBe(true);
            expect(store.favorites().has('b')).toBe(true);
            expect(store.favorites().has('c')).toBe(true);
            expect(store.favorites().has('1')).toBe(false);

            expect(getItemSpy).toHaveBeenCalledWith(storageKey);
        });

        it('falls back to empty set when localStorage value is missing', () => {
            getItemSpy.mockReturnValueOnce(null);

            const store = TestBed.inject(FavoritesStore);

            expect(store.favorites().size).toBe(0);
        });

        it('falls back to empty set when localStorage contains invalid JSON', () => {
            getItemSpy.mockReturnValueOnce('{ not json');

            const store = TestBed.inject(FavoritesStore);

            expect(store.favorites().size).toBe(0);
        });

        it('falls back to empty set when localStorage JSON is not an array', () => {
            localStorage.setItem(storageKey, JSON.stringify({ a: 1 }));

            const store = TestBed.inject(FavoritesStore);

            expect(store.favorites().size).toBe(0);
        });

        it('toggle() adds/removes favorites; isFavorite reflects state', () => {
            const store = TestBed.inject(FavoritesStore);

            expect(store.isFavorite('x')).toBe(false);

            store.toggle('x');
            expect(store.isFavorite('x')).toBe(true);

            store.toggle('x');
            expect(store.isFavorite('x')).toBe(false);
        });

        it('persists favorites as sorted array JSON on changes', fakeAsync(() => {
            const store = TestBed.inject(FavoritesStore);

            flush();
            setItemSpy.mockClear();

            store.toggle('b');
            store.toggle('a');
            store.toggle('c');

            flush();

            expect(setItemSpy).toHaveBeenCalled();

            const lastCall = setItemSpy.mock.calls.at(-1)!;
            expect(lastCall[0]).toBe(storageKey);
            expect(lastCall[1]).toBe(JSON.stringify(['a', 'b', 'c']));
        }));

        it('persists deletion as well', fakeAsync(() => {
            const store = TestBed.inject(FavoritesStore);

            flush();
            setItemSpy.mockClear();

            store.toggle('b');
            store.toggle('a');
            store.toggle('c');
            flush();

            store.toggle('b');// remove
            flush();

            const lastCall = setItemSpy.mock.calls.at(-1)!;
            expect(lastCall[0]).toBe(storageKey);
            expect(lastCall[1]).toBe(JSON.stringify(['a', 'c']));
        }));
    });

    describe('server platform', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    FavoritesStore,
                    { provide: PLATFORM_ID, useValue: 'server' },
                ],
            });
        });

        it('does not read from localStorage in constructor', () => {
            TestBed.inject(FavoritesStore);

            expect(getItemSpy).not.toHaveBeenCalled();
        });

        it('does not write to localStorage when toggling', () => {
            const store = TestBed.inject(FavoritesStore);

            store.toggle('a');
            store.toggle('b');

            expect(setItemSpy).not.toHaveBeenCalled();
            expect(store.isFavorite('a')).toBe(true);
        });
    });
});
