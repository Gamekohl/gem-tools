import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild, Inject, PLATFORM_ID, OnInit, OnDestroy,
} from '@angular/core';
import {isPlatformBrowser, NgClass} from '@angular/common';
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {NgIconComponent, provideIcons} from "@ng-icons/core";
import {tablerArrowLeft, tablerBrandGithub} from "@ng-icons/tabler-icons";
import {filter, distinctUntilChanged, switchMap, tap} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {map} from "rxjs/operators";
import {SeoService} from "../../../services/seo.service";
import {TutorialContentService} from "../services/tutorial-content.service";
import {
  ManifestItem,
  TutorialManifest,
  TutorialManifestService
} from "../services/tutorial-manifest.service";

@Component({
  selector: 'gem-tutorial',
  standalone: true,
  imports: [RouterLink, NgIconComponent, NgClass],
  templateUrl: './tutorial.component.html',
  viewProviders: [
      provideIcons({ tablerArrowLeft, tablerBrandGithub })
  ]
})
export class TutorialComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly manifestSvc = inject(TutorialManifestService);
  private readonly contentSvc = inject(TutorialContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  readonly contentHost = viewChild<ElementRef<HTMLElement>>('contentHost');

  private readonly isBrowser = signal<boolean>(false);
  readonly id = signal<string | null>(null);
  readonly manifest = signal<TutorialManifest | null>(null);
  readonly markdown = signal<string>('');
  readonly activeSectionId = signal<string>('');
  readonly item = signal<ManifestItem | null>(null);

  readonly rendered = computed(() => this.contentSvc.renderMarkdown(this.markdown()));

  readonly tutorialHtml = computed(() => this.rendered().html);
  readonly toc = computed(() => this.rendered().sections);

  private io: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser.set(isPlatformBrowser(this.platformId));

    effect(() => {
      const html = this.tutorialHtml();
      const toc = this.toc();
      const host = this.contentHost()?.nativeElement;

      this.disconnectObserver();

      if (!host || !html || toc.length === 0) return;

      if(this.isBrowser())
        queueMicrotask(() => this.setupIntersectionObserver(toc));
    });
  }

  ngOnInit(): void {
    this.manifestSvc.manifest$.asObservable().pipe(
        tap(manifest => this.manifest.set(manifest)),
        switchMap(() => this.route.paramMap),
        map(params => params.get('id') ?? null),
        filter((id): id is string => !!id),
        distinctUntilChanged(),
        map(id => this.findItemById(id)),
        filter((item): item is ManifestItem => !!item),
        tap(item => {
          this.item.set(item);
          this.titleService.setTitle(`Tutorial: ${item.title}`);
          this.setSeo();
        }),
        switchMap(({ file }) => this.manifestSvc.getMarkdown$(file)),
        takeUntilDestroyed(this.destroyRef)
    )
        .subscribe({
          next: (md: any) => {
            this.markdown.set(md);
            const firstSec = this.contentSvc.renderMarkdown(md).sections[0]?.id ?? '';
            this.activeSectionId.set(firstSec);

            if(this.isBrowser())
              queueMicrotask(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
          }
        });
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd();
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeSectionId.set(id);
  }

  private setupIntersectionObserver(toc: { id: string }[]): void {
    const targets = toc
        .map((s) => document.getElementById(s.id))
        .filter((el): el is HTMLElement => !!el);

    if (targets.length === 0) return;

    this.io = new IntersectionObserver(
        (entries) => {
          const visible = entries
              .filter((e) => e.isIntersecting)
              .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));

          if (visible.length) {
            const id = (visible[0].target as HTMLElement).id;
            if (id) this.activeSectionId.set(id);
          }
        },
        {
          threshold: [0.2, 0.4, 0.7],
          rootMargin: '-20% 0px -70% 0px',
        }
    );

    targets.forEach((el) => this.io!.observe(el));
  }

  private disconnectObserver(): void {
    if (this.io) {
      this.io.disconnect();
      this.io = null;
    }
  }

  private findItemById(id: string): ManifestItem | null {
    const manifest = this.manifest();

    const items = manifest ?? [];

    for (const item of items) {
      if (item.id === id) return item;
    }

    return null;
  }

  private setSeo(): void {
    const t = this.item();

    if (!t)
      return;

    this.seo.apply({
      title: t.title,
      canonicalUrl: `https://gem-tools.vercel.app/tutorials/${t.id}`,
      description: t.subtitle,
      ogType: 'article',
      image: '',
      url: `https://gem-tools.vercel.app/tutorials/${t.id}`
    });

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${t.title} - GEM-Tools`,
      description: t.subtitle,
      author: { '@type': 'Person', name: t.author }
    });
  }
}
