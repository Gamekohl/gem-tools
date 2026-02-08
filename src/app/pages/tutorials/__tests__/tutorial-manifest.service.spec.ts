import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {makeStateKey, PLATFORM_ID, TransferState} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {TutorialManifest, TutorialManifestService} from '../services/tutorial-manifest.service';

const basePath = '/assets/tutorials';
const indexUrl = `${basePath}/index.json`;

const manifest: TutorialManifest = [
    {author: 'A', id: 'intro', title: 'Intro', subtitle: 'Basics', file: 'intro.md'},
    {author: 'B', id: 'adv', title: 'Advanced', subtitle: 'Deep', file: 'adv.md'},
];

describe('TutorialManifestService (browser)', () => {
    let service: TutorialManifestService;
    let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
          provideHttpClientTesting(),
          TransferState,
          {provide: PLATFORM_ID, useValue: 'browser'},
          TutorialManifestService
      ],
    });

    service = TestBed.inject(TutorialManifestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

    it('manifest$ GETs index.json and replays to multiple subscribers', () => {
        const received1: TutorialManifest[] = [];
        const received2: TutorialManifest[] = [];

        const sub1 = service.manifest$.subscribe(v => received1.push(v));
        const sub2 = service.manifest$.subscribe(v => received2.push(v));

    const req = httpMock.expectOne(indexUrl);
    expect(req.request.method).toBe('GET');
    req.flush(manifest);

        expect(received1).toEqual([manifest]);
        expect(received2).toEqual([manifest]);

        sub1.unsubscribe();
        sub2.unsubscribe();
  });

    it('getIds() reads ids from manifest$ with a single request', async () => {
    const idsPromise = service.getIds();

        const req = httpMock.expectOne(indexUrl);
        expect(req.request.method).toBe('GET');
        req.flush(manifest);

    await expect(idsPromise).resolves.toEqual(['intro', 'adv']);
  });

  it('getMarkdown$(file) GETs markdown file as text', (done) => {
    const file = 'intro.md';
    const url = `${basePath}/${file}`;
    const md = '# Hello';

    service.getMarkdown$(file).subscribe(res => {
      expect(res).toBe(md);
      done();
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush(md);
  });
});

describe('TutorialManifestService (server)', () => {
    let service: TutorialManifestService;
    let httpMock: HttpTestingController;
    let transferState: TransferState;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClientTesting(),
                TransferState,
                {provide: PLATFORM_ID, useValue: 'server'},
                TutorialManifestService
            ],
        });

        service = TestBed.inject(TutorialManifestService);
        httpMock = TestBed.inject(HttpTestingController);
        transferState = TestBed.inject(TransferState);
    });

    afterEach(() => httpMock.verify());

    it('getMarkdown$(file) GETs markdown file and stores it in TransferState when running on server', (done) => {
        const setSpy = jest.spyOn(transferState, 'set');

        const file = 'intro.md';
        const url = `${basePath}/${file}`;
        const md = '# Hello';

        service.getMarkdown$(file).subscribe(res => {
            expect(res).toBe(md);
            done();
        });

        const req = httpMock.expectOne(url);
        req.flush(md);

        const expectedKey = makeStateKey<string>('tutorial-md:intro.md');

        expect(setSpy).toHaveBeenCalledTimes(1);
        expect(setSpy).toHaveBeenCalledWith(expectedKey, md);
    });

    it('stores manifest in TransferState when running on server', () => {
        const setSpy = jest.spyOn(transferState, 'set');

        service.manifest$.subscribe();

        const req = httpMock.expectOne(indexUrl);
        req.flush(manifest);

        const expectedKey = makeStateKey<TutorialManifest>('tutorial-manifest');

        expect(setSpy).toHaveBeenCalledTimes(1);
        expect(setSpy).toHaveBeenCalledWith(expectedKey, manifest);
    });
});
