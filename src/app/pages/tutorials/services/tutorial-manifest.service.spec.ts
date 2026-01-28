import { TestBed } from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import { TutorialManifestService, TutorialManifest } from './tutorial-manifest.service';

describe('TutorialManifestService', () => {
  let service: TutorialManifestService;
  let httpMock: HttpTestingController;

  const basePath = '/assets/tutorials';
  const indexUrl = `${basePath}/index.json`;

  const manifest: TutorialManifest = [
    { author: 'A', id: 'intro', title: 'Intro', subtitle: 'Basics', file: 'intro.md' },
    { author: 'B', id: 'adv', title: 'Advanced', subtitle: 'Deep', file: 'adv.md' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
          provideHttpClientTesting(),
          TutorialManifestService
      ],
    });

    service = TestBed.inject(TutorialManifestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('calls GET index.json in constructor and writes result into manifest$', () => {
    const received: Array<TutorialManifest | null> = [];
    const sub = service.manifest$.subscribe(v => received.push(v));

    expect(received[0]).toBeNull();

    const req = httpMock.expectOne(indexUrl);
    expect(req.request.method).toBe('GET');
    req.flush(manifest);

    expect(received).toEqual([null, manifest]);

    sub.unsubscribe();
  });

  it('getIds() triggers its own GET index.json (separate from constructor request)', async () => {
    const ctorReq = httpMock.expectOne(indexUrl);
    expect(ctorReq.request.method).toBe('GET');

    const idsPromise = service.getIds();

    const idsReq = httpMock.expectOne(indexUrl);
    expect(idsReq.request.method).toBe('GET');

    ctorReq.flush(manifest);
    idsReq.flush(manifest);

    await expect(idsPromise).resolves.toEqual(['intro', 'adv']);
  });

  it('getMarkdown$(file) GETs markdown file as text', (done) => {
    const ctorReq = httpMock.expectOne(indexUrl);
    ctorReq.flush(manifest);

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
