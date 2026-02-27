import {ActivatedRoute, convertToParamMap, Data, ParamMap, UrlSegment} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';

type Params = Record<string, string | number | boolean | null | undefined>;

export type ActivatedRouteMock = ActivatedRoute & {
    setParams: (params: Params) => void;
    setQueryParams: (params: Params) => void;
    setData: (data: Data) => void;
    setFragment: (fragment: string | null) => void;
    setUrl: (segments: UrlSegment[]) => void;
    getSnapshotParamMap: () => ParamMap;
    getSnapshotQueryParamMap: () => ParamMap;
};

export function provideActivatedRouteMock(options?: {
    params?: Params;
    queryParams?: Params;
    data?: Data;
    fragment?: string | null;
    url?: UrlSegment[];
}): ActivatedRouteMock {
    const params$ = new BehaviorSubject<Params>(options?.params ?? {});
    const queryParams$ = new BehaviorSubject<Params>(options?.queryParams ?? {});
    const data$ = new BehaviorSubject<Data>(options?.data ?? {});
    const fragment$ = new BehaviorSubject<string | null>(options?.fragment ?? null);
    const url$ = new BehaviorSubject<UrlSegment[]>(options?.url ?? []);

    let snapshotParamMap: ParamMap = convertToParamMap(params$.value);
    let snapshotQueryParamMap: ParamMap = convertToParamMap(queryParams$.value);

    params$.subscribe((p) => (snapshotParamMap = convertToParamMap(p)));
    queryParams$.subscribe((p) => (snapshotQueryParamMap = convertToParamMap(p)));

    const snapshot: ActivatedRoute['snapshot'] = {
        params: params$.value as any,
        queryParams: queryParams$.value as any,
        data: data$.value,
        fragment: fragment$.value,
        url: url$.value,
        paramMap: snapshotParamMap,
        queryParamMap: snapshotQueryParamMap,
    } as any;

    const route: Partial<ActivatedRouteMock> = {
        snapshot,

        params: params$.asObservable() as Observable<any>,
        queryParams: queryParams$.asObservable() as Observable<any>,
        data: data$.asObservable(),
        fragment: fragment$.asObservable(),
        url: url$.asObservable(),

        paramMap: params$.asObservable() as any,
        queryParamMap: queryParams$.asObservable() as any,

        setParams: (p) => {
            params$.next(p);
            (snapshot as any).params = p;
            (snapshot as any).paramMap = snapshotParamMap;
        },
        setQueryParams: (p) => {
            queryParams$.next(p);
            (snapshot as any).queryParams = p;
            (snapshot as any).queryParamMap = snapshotQueryParamMap;
        },
        setData: (d) => {
            data$.next(d);
            (snapshot as any).data = d;
        },
        setFragment: (f) => {
            fragment$.next(f);
            (snapshot as any).fragment = f;
        },
        setUrl: (u) => {
            url$.next(u);
            (snapshot as any).url = u;
        },

        getSnapshotParamMap: () => snapshotParamMap,
        getSnapshotQueryParamMap: () => snapshotQueryParamMap,
    };

    return route as ActivatedRouteMock;
}