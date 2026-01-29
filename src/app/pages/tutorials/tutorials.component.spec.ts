import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PageEvent} from "@angular/material/paginator";
import {BehaviorSubject} from 'rxjs';
import {tutorialManifestMock} from "../../../testing/data/manifest";

import {SeoService} from '../../services/seo.service';
import {Difficulty, TutorialManifest, TutorialManifestService,} from './services/tutorial-manifest.service';
import {TutorialsComponent} from './tutorials.component';

describe('TutorialsComponent', () => {
  let fixture: ComponentFixture<TutorialsComponent>;
  let component: TutorialsComponent;

  let seoMock: { apply: jest.Mock; setJsonLd: jest.Mock };
  let manifestSvcMock: { manifest$: BehaviorSubject<TutorialManifest | null> };

  const manifest = tutorialManifestMock;
  const manifestItems = manifest.items;

  beforeEach(async () => {
    seoMock = {
      apply: jest.fn(),
      setJsonLd: jest.fn(),
    };

    manifestSvcMock = {
      manifest$: new BehaviorSubject<TutorialManifest | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [TutorialsComponent],
      providers: [
        { provide: SeoService, useValue: seoMock },
        { provide: TutorialManifestService, useValue: manifestSvcMock },
      ],
    })
        .overrideComponent(TutorialsComponent, {
          set: { template: `<div></div>` },
        })
        .compileComponents();

    fixture = TestBed.createComponent(TutorialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.clearAllMocks());

  it('applies SEO + JSON-LD in constructor', () => {
    expect(seoMock.apply).toHaveBeenCalledWith({
      title: 'Tutorials',
      canonicalUrl: 'https://gem-tools.vercel.app/tutorials',
      description:
          'Tutorials for the GEM-Editor: Learn how to use GEM-Editor to create maps, missions and more.',
      ogType: 'website',
      image: '',
      url: 'https://gem-tools.vercel.app/tutorials',
    });

    expect(seoMock.setJsonLd).toHaveBeenCalledWith({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      headline: 'Tutorials - GEM-Tools',
      description:
          'Tutorials for the GEM-Editor: Learn how to use GEM-Editor to create maps, missions and more.',
      author: { '@type': 'Organization', name: 'GEM-Tools' },
    });
  });

  it('filteredItems returns [] while manifest is null', () => {
    expect(component.manifest()).toBeNull();
    expect(component.filteredItems()).toEqual([]);
    expect(component.stats().total).toBeUndefined(); // because `this.manifest()?.length`
    expect(component.stats().shown).toBe(0);
  });

  it('filteredItems returns all items when difficulty=All and query empty', () => {
    manifestSvcMock.manifest$.next(manifestItems);
    fixture.detectChanges();

    component.query.set('');
    component.difficulty.set(0);

    expect(component.filteredItems().map((i) => i.id)).toEqual([
      'intro',
      'ai',
      'perf',
      'nodiff',
    ]);
  });

  it('filters by difficulty (Beginner)', () => {
    manifestSvcMock.manifest$.next(manifestItems);
    fixture.detectChanges();

    component.setDifficulty(Difficulty.Beginner);

    expect(component.filteredItems().map((i) => i.id)).toEqual(['intro']);
  });

  it('filters by query across title, subtitle, and tags (case-insensitive)', () => {
    manifestSvcMock.manifest$.next(manifestItems);
    fixture.detectChanges();

    component.difficulty.set(0);

    component.query.set('triggers');
    expect(component.filteredItems().map((i) => i.id)).toEqual(['ai']);

    component.query.set('PERFORMANCE');
    expect(component.filteredItems().map((i) => i.id)).toEqual(['perf']);

    component.query.set('overview'); // tag
    expect(component.filteredItems().map((i) => i.id)).toEqual(['intro']);
  });

  it('combines difficulty + query filtering', () => {
    manifestSvcMock.manifest$.next(manifestItems);
    fixture.detectChanges();

    component.setDifficulty(Difficulty.Intermediate);
    component.query.set('logic');

    expect(component.filteredItems().map((i) => i.id)).toEqual(['ai']);

    component.query.set('overview');
    expect(component.filteredItems()).toEqual([]);
  });

  it('stats returns total, shown, and counts by difficulty', () => {
    manifestSvcMock.manifest$.next(manifestItems);
    fixture.detectChanges();

    // baseline (All)
    component.query.set('');
    component.difficulty.set(0);

    const s1 = component.stats();
    expect(s1.total).toBe(4);
    expect(s1.shown).toBe(4);
    expect(s1.counts).toEqual({ Beginner: 1, Intermediate: 1, Advanced: 1 });

    // after filtering (Beginner)
    component.difficulty.set(Difficulty.Beginner);

    const s2 = component.stats();
    expect(s2.total).toBe(4);
    expect(s2.shown).toBe(1);
    expect(s2.counts).toEqual({ Beginner: 1, Intermediate: 1, Advanced: 1 }); // counts are based on full manifest
  });

  it('setDifficulty updates the difficulty signal', () => {
    expect(component.difficulty()).toBe(0);
    component.setDifficulty(Difficulty.Advanced);
    expect(component.difficulty()).toBe(Difficulty.Advanced);
  });

  it('gets pagedItems()', () => {
    manifestSvcMock.manifest$.next(manifestItems);
    fixture.detectChanges();

    expect(component.pagedItems()).toEqual(manifestItems);
  });

  it('gets pagedItems() with page size 2', () => {
    manifestSvcMock.manifest$.next(manifestItems);
    fixture.detectChanges();

    component.pageSize.set(2);
    expect(component.pagedItems()).toEqual([manifest.getItem(0), manifest.getItem(1)]);
  });

  it('sets pageIndex and pageSize based on PageEvent', () => {
    const mockPageEvent = {
      pageIndex: 1,
      pageSize: 2,
    } as PageEvent;

    component.onPage(mockPageEvent);

    expect(component.pageIndex()).toBe(1);
    expect(component.pageSize()).toBe(2);
  });
});
