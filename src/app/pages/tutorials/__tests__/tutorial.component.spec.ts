import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { createSeoServiceMock } from '@testing/mocks/seo-service';
import { createTutorialManifestServiceMock } from '@testing/mocks/tutorial-manifest-service';
import { MockTutorialManifest } from '@testing/mocks/tutorial-manifest';
import { BehaviorSubject, of } from 'rxjs';
import { mockMarked } from '@testing/libs/marked';
import { MockIntersectionObserver } from '@testing/utils/intersection-observer';
import { createComponent } from '@testing/utils/testbed';
import { SeoService } from '../../../services/seo.service';
import { TutorialContentService } from '../services/tutorial-content.service';
import {
  ManifestItem,
  TutorialManifestService
} from '../services/tutorial-manifest.service';
import * as ReadTime from '../../../utils/read-time';

jest.mock('marked', () => mockMarked());

import {TutorialComponent} from '../tutorial/tutorial.component';

describe('TutorialComponent', () => {
  let fixture: ComponentFixture<TutorialComponent>;
  let component: TutorialComponent;
  let observerMock: MockIntersectionObserver;

  const setupDomElements = (ids: string[]) => {
    ids.forEach(id => {
      const el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
    });
  };

  const cleanupDomElements = (ids: string[]) => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  };

  let seoMock: ReturnType<typeof createSeoServiceMock>;
  let titleMock: { setTitle: jest.Mock };
  let manifestSvcMock: ReturnType<typeof createTutorialManifestServiceMock>;
  let contentSvcMock: { renderMarkdown: jest.Mock };

  const paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ id: 'intro' }));

  const manifest = new MockTutorialManifest();
  const manifestItems = manifest.items;

  const baseProviders = (platformId: 'browser' | 'server') => ([
    { provide: PLATFORM_ID, useValue: platformId },
    { provide: SeoService, useValue: seoMock },
    { provide: Title, useValue: titleMock },
    { provide: TutorialManifestService, useValue: manifestSvcMock },
    { provide: TutorialContentService, useValue: contentSvcMock },
    {
      provide: ActivatedRoute,
      useValue: {
        paramMap: paramMap$.asObservable(),
      } satisfies Partial<ActivatedRoute>,
    },
  ]);

  beforeEach(async () => {
    window.IntersectionObserver = jest.fn().mockImplementation((cb) => {
      observerMock = new MockIntersectionObserver(cb);
      return observerMock;
    }) as any;

    seoMock = createSeoServiceMock();

    titleMock = {
      setTitle: jest.fn(),
    };

    manifestSvcMock = createTutorialManifestServiceMock();

    contentSvcMock = {
      renderMarkdown: jest.fn().mockReturnValue({
        html: '',
        sections: [],
        title: null
      }),
    };

    const result = await createComponent(TutorialComponent, {
      imports: [TutorialComponent],
      providers: baseProviders('browser'),
    });

    fixture = result.fixture;
    component = result.component;
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanupDomElements(['section-1', 'section-2', 'section-3']);
  });

  it('should set item, title, SEO, loads markdown, sets activeSectionId and scrolls to top (browser)', fakeAsync(() => {
    const item: ManifestItem = manifest.getItem(0);
    const md = '# Intro\n\n## Section 1\nText';

    contentSvcMock.renderMarkdown.mockImplementation((_md: string) => ({
      html: '<h1>Intro</h1><h2 id="sec-1">Section 1</h2>',
      sections: [{ id: 'sec-1', title: 'Section 1', level: 2 as const }],
      title: 'Intro',
    }));

    manifestSvcMock.getMarkdown$.mockReturnValue(of(md));
    manifestSvcMock.manifest$.next(manifestItems);

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.item()).toEqual(item);

    expect(titleMock.setTitle).toHaveBeenCalledWith('Tutorial: Intro to GEM');
    expect(seoMock.apply).toHaveBeenCalledWith({
      title: 'Intro to GEM',
      canonicalUrl: 'https://gem-tools.vercel.app/tutorials/intro',
      description: 'Basics',
      ogType: 'article',
      image: '',
      url: 'https://gem-tools.vercel.app/tutorials/intro',
    });
    expect(seoMock.setJsonLd).toHaveBeenCalledWith({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Intro to GEM - GEM-Tools',
      description: 'Basics',
      author: { '@type': 'Person', name: 'Alice' },
    });

    expect(component.markdown()).toBe(md);

    expect(component.activeSectionId()).toBe('sec-1');

    expect(contentSvcMock.renderMarkdown).toHaveBeenCalled();
  }));

  it('should does not scrollTo in server mode', fakeAsync(async () => {
    TestBed.resetTestingModule();

    const result = await createComponent(TutorialComponent, {
      imports: [TutorialComponent],
      providers: baseProviders('server'),
    });
    fixture = result.fixture;
    component = result.component;

    contentSvcMock.renderMarkdown.mockReturnValue({
      html: '<h2 id="sec-1">Section</h2>',
      sections: [{ id: 'sec-1', title: 'Section', level: 2 as const }],
      title: 'T',
    });
    manifestSvcMock.getMarkdown$.mockReturnValue(of('## Section'));

    component.ngOnInit();

    manifestSvcMock.manifest$.next(manifestItems);

    expect(window.scrollTo).not.toHaveBeenCalled();
  }));

  it('should scroll element into view and updates activeSectionId', () => {
    const el = document.createElement('div');
    el.id = 'sec-x';
    const scrollSpy = jest.fn();
    (el as any).scrollIntoView = scrollSpy;
    document.body.appendChild(el);

    component.scrollToSection('sec-x');

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(component.activeSectionId()).toBe('sec-x');

    document.body.removeChild(el);
  });

  it('should remove JSON-LD', () => {
    component.ngOnDestroy();
    expect(seoMock.removeJsonLd).toHaveBeenCalledTimes(1);
  });

  it('should initialize the observer and observe valid targets', () => {
    setupDomElements(['section-1', 'section-2']);
    const toc = [{ id: 'section-1' }, { id: 'section-2' }, { id: 'missing-id' }];

    component['setupIntersectionObserver'](toc);

    expect(window.IntersectionObserver).toHaveBeenCalled();
    expect(observerMock.observe).toHaveBeenCalledTimes(2);
    expect(observerMock.observe).toHaveBeenCalledWith(document.getElementById('section-1'));
  });

  it('should update activeSectionId when an element intersects', () => {
    setupDomElements(['section-1']);
    const toc = [{ id: 'section-1' }];
    component['setupIntersectionObserver'](toc);

    observerMock.trigger([
      {
        target: document.getElementById('section-1')!,
        isIntersecting: true,
        boundingClientRect: { top: 100 } as DOMRectReadOnly
      }
    ]);

    expect(component.activeSectionId()).toBe('section-1');
  });

  it('should pick the topmost element if multiple are visible', () => {
    setupDomElements(['section-1', 'section-2']);
    component['setupIntersectionObserver']([{ id: 'section-1' }, { id: 'section-2' }]);

    observerMock.trigger([
      {
        target: document.getElementById('section-2')!,
        isIntersecting: true,
        boundingClientRect: { top: 500 } as DOMRectReadOnly
      },
      {
        target: document.getElementById('section-1')!,
        isIntersecting: true,
        boundingClientRect: { top: 100 } as DOMRectReadOnly // Winner (closest to top)
      }
    ]);

    expect(component.activeSectionId()).toBe('section-1');
  });

  it('should not update signal if no elements are intersecting', () => {
    setupDomElements(['section-1']);
    component['setupIntersectionObserver']([{ id: 'section-1' }]);

    component.activeSectionId.set('initial-state');

    observerMock.trigger([
      {
        target: document.getElementById('section-1')!,
        isIntersecting: false,
        boundingClientRect: { top: 100 } as DOMRectReadOnly
      }
    ]);

    expect(component.activeSectionId()).toBe('initial-state');
  });

  it('should call estimateReadTimeFromMarkdown with current markdown and exposes its return value', () => {
    const mockReadTimeResult: ReadTime.ReadTimeResult = {
      minutes: 5,
      words: 200,
      images: 0,
      codeBlocks: 0
    }

    jest.spyOn(ReadTime, 'estimateReadTimeFromMarkdown').mockReturnValue(mockReadTimeResult);

    component.markdown.set('# Hello\n\nSome text');

    expect(component.readTime()).toBe(mockReadTimeResult);
  });

  it('should map item.difficulty through difficultyLabels', () => {
    component.item.set(manifest.getItem(0));

    expect(component.difficulty()).toBe('Beginner');
  });

  it('should set difficulty to null', () => {
    component.item.set(manifest.itemWithoutDifficulty);

    expect(component.difficulty()).toBe(null);
  });
});
