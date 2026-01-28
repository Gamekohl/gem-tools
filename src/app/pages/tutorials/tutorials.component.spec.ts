import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TutorialsComponent } from './tutorials.component';

import { SeoService } from '../../services/seo.service';
import {
  TutorialManifestService,
  TutorialManifest,
} from './services/tutorial-manifest.service';

describe('TutorialsComponent', () => {
  let fixture: ComponentFixture<TutorialsComponent>;
  let component: TutorialsComponent;

  let seoMock: { apply: jest.Mock; setJsonLd: jest.Mock };
  let manifestSvcMock: { manifest$: BehaviorSubject<TutorialManifest | null> };

  const manifest: TutorialManifest = [
    {
      author: 'Alice',
      id: 'intro',
      title: 'Intro to GEM',
      subtitle: 'Basics',
      difficulty: 'Beginner',
      etaMinutes: 5,
      tags: ['start', 'overview'],
      file: 'intro.md',
    },
    {
      author: 'Bob',
      id: 'ai',
      title: 'AI Scripting',
      subtitle: 'Triggers and logic',
      difficulty: 'Intermediate',
      etaMinutes: 20,
      tags: ['scripting', 'logic'],
      file: 'ai.md',
    },
    {
      author: 'Cara',
      id: 'perf',
      title: 'Performance',
      subtitle: 'Optimizations',
      difficulty: 'Advanced',
      etaMinutes: 30,
      tags: ['performance'],
      file: 'perf.md',
    },
    {
      author: 'Dan',
      id: 'nodiff',
      title: 'No Difficulty',
      subtitle: 'No diff set',
      // difficulty omitted
      tags: ['misc'],
      file: 'no.md',
    },
  ];

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
    manifestSvcMock.manifest$.next(manifest);
    fixture.detectChanges();

    component.query.set('');
    component.difficulty.set('All');

    expect(component.filteredItems().map((i) => i.id)).toEqual([
      'intro',
      'ai',
      'perf',
      'nodiff',
    ]);
  });

  it('filters by difficulty (Beginner)', () => {
    manifestSvcMock.manifest$.next(manifest);
    fixture.detectChanges();

    component.setDifficulty('Beginner');

    expect(component.filteredItems().map((i) => i.id)).toEqual(['intro']);
  });

  it('filters by query across title, subtitle, and tags (case-insensitive)', () => {
    manifestSvcMock.manifest$.next(manifest);
    fixture.detectChanges();

    component.difficulty.set('All');

    component.query.set('triggers');
    expect(component.filteredItems().map((i) => i.id)).toEqual(['ai']);

    component.query.set('PERFORMANCE');
    expect(component.filteredItems().map((i) => i.id)).toEqual(['perf']);

    component.query.set('overview'); // tag
    expect(component.filteredItems().map((i) => i.id)).toEqual(['intro']);
  });

  it('combines difficulty + query filtering', () => {
    manifestSvcMock.manifest$.next(manifest);
    fixture.detectChanges();

    component.setDifficulty('Intermediate');
    component.query.set('logic');

    expect(component.filteredItems().map((i) => i.id)).toEqual(['ai']);

    component.query.set('overview');
    expect(component.filteredItems()).toEqual([]);
  });

  it('stats returns total, shown, and counts by difficulty', () => {
    manifestSvcMock.manifest$.next(manifest);
    fixture.detectChanges();

    // baseline (All)
    component.query.set('');
    component.difficulty.set('All');

    const s1 = component.stats();
    expect(s1.total).toBe(4);
    expect(s1.shown).toBe(4);
    expect(s1.counts).toEqual({ Beginner: 1, Intermediate: 1, Advanced: 1 });

    // after filtering (Beginner)
    component.difficulty.set('Beginner');

    const s2 = component.stats();
    expect(s2.total).toBe(4);
    expect(s2.shown).toBe(1);
    expect(s2.counts).toEqual({ Beginner: 1, Intermediate: 1, Advanced: 1 }); // counts are based on full manifest
  });

  it('setDifficulty updates the difficulty signal', () => {
    expect(component.difficulty()).toBe('All');
    component.setDifficulty('Advanced');
    expect(component.difficulty()).toBe('Advanced');
  });
});
