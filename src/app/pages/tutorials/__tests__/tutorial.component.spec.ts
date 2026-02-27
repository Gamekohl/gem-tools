import {Clipboard} from "@angular/cdk/clipboard";
import {PLATFORM_ID} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, convertToParamMap, ParamMap} from '@angular/router';
import {mockMarked} from "@testing/libs/marked";
import {createSeoServiceMock} from "@testing/mocks/seo-service";
import {MockTutorialManifest} from "@testing/mocks/tutorial-manifest";
import {createTutorialManifestServiceMock} from "@testing/mocks/tutorial-manifest-service";
import {MockIntersectionObserver} from "@testing/utils/intersection-observer";
import {createComponent} from "@testing/utils/testbed";
import {BehaviorSubject, of} from 'rxjs';
import {SeoService} from "../../../services/seo.service";
import * as ReadTime from '../../../utils/read-time';
import {TutorialContentService} from '../services/tutorial-content.service';
import {TutorialManifestService} from "../services/tutorial-manifest.service";
import {TutorialComponent} from '../tutorial/tutorial.component';
import {TutorialResolved} from "../tutorial/tutorial.resolver";

jest.mock('marked', () => mockMarked());

const spyOn = jest.spyOn;

const template = `
  <div #contentContainer>
    <h2 id="sec-1">
      <div>
        <button type="button" data-action="link-heading">
          <span class="inner">link</span>
        </button>

        <button type="button" data-action="bookmark-heading">
          <span class="inner">bookmark</span>
        </button>
      </div>
    </h2>

    <div id="outside">outside</div>

    <div class="no-id-wrapper">
      <div>
        <button type="button" data-action="link-heading">
          <span class="inner">link-no-id</span>
        </button>
      </div>
    </div>
  </div>
`;

describe('TutorialComponent (browser)', () => {
  let fixture: ComponentFixture<TutorialComponent>;
  let component: TutorialComponent;
  let observerMock: MockIntersectionObserver;

  let seoMock: ReturnType<typeof createSeoServiceMock>;
  let titleMock: { setTitle: jest.Mock };
  let manifestSvcMock: ReturnType<typeof createTutorialManifestServiceMock>;
  let contentSvcMock: { renderMarkdown: jest.Mock };

  const data$ = new BehaviorSubject<{ tutorial?: TutorialResolved }>({});
  const paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ id: 'intro' }));

  const manifest = new MockTutorialManifest();

  const baseProviders = (platformId: 'browser' | 'server') => ([
    { provide: PLATFORM_ID, useValue: platformId },
    { provide: SeoService, useValue: seoMock },
    { provide: Title, useValue: titleMock },
    { provide: TutorialManifestService, useValue: manifestSvcMock },
    { provide: TutorialContentService, useValue: contentSvcMock },
    {
      provide: ActivatedRoute,
      useValue: {
        data: data$.asObservable(),
        paramMap: paramMap$.asObservable(),
        fragment: of(null)
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
        outline: [],
        sections: [],
        title: null
      }),
    };
    data$.next({});

    const result = await createComponent(TutorialComponent, {
      imports: [TutorialComponent],
      providers: baseProviders('browser'),
      override: {
        component: TutorialComponent,
        override: {
          set: {template}
        }
      }
    });

    fixture = result.fixture;
    component = result.component;
  });

  it('sets title + SEO + activeSectionId and scroll when fragment is not present', () => {
    (window as any).scrollTo = jest.fn();

    const item = manifest.getItem(0);
    const md = '## Section';

    contentSvcMock.renderMarkdown.mockReturnValue({
      html: '<h2 id="sec-1">Section</h2>',
      outline: [],
      sections: [{id: 'sec-1', title: 'Section', level: 2 as const}],
      title: 'T',
    });

    data$.next({tutorial: {item, markdown: md}});
    fixture.detectChanges();

    expect(titleMock.setTitle).toHaveBeenCalledWith(`Tutorial: ${item.title}`);

    expect(seoMock.apply).toHaveBeenCalled();
    expect(seoMock.setJsonLd).toHaveBeenCalled();

    expect(component.activeSectionId()).toBe('sec-1');

    expect(window.scrollTo).toHaveBeenCalledWith({top: 0, behavior: 'instant'});
  });

  it('does not scroll when fragment is present', async () => {
    (window as any).scrollTo = jest.fn();

    TestBed.resetTestingModule();

    const result = await createComponent(TutorialComponent, {
      imports: [TutorialComponent],
      providers: baseProviders('server'),
    });
    fixture = result.fixture;
    component = result.component;

    contentSvcMock.renderMarkdown.mockReturnValue({
      html: '<h2 id="sec-1">Section</h2>',
      outline: [],
      sections: [{ id: 'sec-1', title: 'Section', level: 2 as const }],
      title: 'T',
    });

    fixture.detectChanges();

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('should remove JSON-LD', () => {
    component.ngOnDestroy();
    expect(seoMock.removeJsonLd).toHaveBeenCalledTimes(1);
  });

  it('should call estimateReadTimeFromMarkdown with current markdown and exposes its return value', () => {
    const mockReadTimeResult: ReadTime.ReadTimeResult = {
      minutes: 5,
      words: 200,
      images: 0,
      codeBlocks: 0
    }

    spyOn(ReadTime, 'estimateReadTimeFromMarkdown').mockReturnValue(mockReadTimeResult);

    data$.next({
      tutorial: {item: manifest.getItem(0), markdown: '# Hello\n\nSome text'}
    });

    expect(component.readTime()).toBe(mockReadTimeResult);
  });

  it('should map item.difficulty through difficultyLabels', () => {
    data$.next({
      tutorial: {item: manifest.getItem(0), markdown: '# Hello'}
    });

    expect(component.difficulty()).toBe('Beginner');
  });

  /*it('should set difficulty to null', () => {
    component.item.set(manifest.itemWithoutDifficulty);

    expect(component.difficulty()).toBe(null);
  });*/

  it('should copy section link to clipboard', () => {
    data$.next({
      tutorial: {
        item: manifest.getItem(0),
        markdown: '# Intro\n\n## Section 1\nText'
      }
    });

    const clipboardSpy = spyOn(TestBed.inject(Clipboard), 'copy');
    const snackbarSpy = spyOn(TestBed.inject(MatSnackBar), 'open');

    component.copySectionLink('section-1');

    expect(clipboardSpy).toHaveBeenCalledWith('https://gem-tools.vercel.app/tutorials/intro#section-1');
    expect(snackbarSpy).toHaveBeenCalledWith('Link copied.', '', {duration: 2000});
  });

  it('clicking link action calls copySectionLink with heading id', () => {
    const copySpy = spyOn(component, 'copySectionLink').mockImplementation(() => {
    });

    const inner = fixture.nativeElement.querySelector(
        '[data-action="link-heading"] .inner'
    ) as HTMLElement;

    inner.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(copySpy).toHaveBeenCalledTimes(1);
    expect(copySpy).toHaveBeenCalledWith('sec-1');
  });

  it('clicking bookmark action does not call copySectionLink', () => {
    const copySpy = spyOn(component, 'copySectionLink').mockImplementation(() => {
    });

    const inner = fixture.nativeElement.querySelector(
        '[data-action="bookmark-heading"] .inner'
    ) as HTMLElement;

    inner.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(copySpy).not.toHaveBeenCalled();
  });

  it('clicking outside action buttons does nothing', () => {
    const copySpy = spyOn(component, 'copySectionLink').mockImplementation(() => {
    });

    const outside = fixture.nativeElement.querySelector('#outside') as HTMLElement;
    outside.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(copySpy).not.toHaveBeenCalled();
  });

  it('link click without heading id does nothing', () => {
    const copySpy = spyOn(component, 'copySectionLink').mockImplementation(() => {
    });

    const inner = fixture.nativeElement.querySelector(
        '.no-id-wrapper [data-action="link-heading"] .inner'
    ) as HTMLElement;

    inner.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(copySpy).not.toHaveBeenCalled();
  });

});

describe('TutorialComponent (server)', () => {
  let fixture: ComponentFixture<TutorialComponent>;
  let component: TutorialComponent;

  beforeEach(async () => {
    const result = await createComponent(TutorialComponent, {
      imports: [TutorialComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({}),
            fragment: of(null)
          } satisfies Partial<ActivatedRoute>,
        },
        {provide: PLATFORM_ID, useValue: 'server'}
      ],
      override: {
        component: TutorialComponent,
        override: {
          set: {template}
        }
      }
    });

    fixture = result.fixture;
    component = result.component;

    fixture.detectChanges();
  });

  it('should not add event listener to contentContainer', () => {
    const spy = spyOn(component.contentContainer()!.nativeElement, 'addEventListener');

    expect(spy).not.toHaveBeenCalled();
  });
});