import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser, NgClass, NgTemplateOutlet} from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    OnDestroy,
    PLATFORM_ID,
    signal,
    viewChild,
} from '@angular/core';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {NgIconComponent, provideIcons} from "@ng-icons/core";
import {
    tablerArrowLeft,
    tablerBrandGithub,
    tablerGitPullRequest,
    tablerInfoCircle,
    tablerLink
} from "@ng-icons/tabler-icons";
import {auditTime, combineLatest, distinctUntilChanged} from "rxjs";
import {filter, map} from "rxjs/operators";
import {environment} from "../../../../environments/environment";
import {SeoService} from "../../../services/seo.service";
import {estimateReadTimeFromMarkdown} from "../../../utils/read-time";
import {TutorialContentService, TutorialSection} from "../services/tutorial-content.service";
import {Difficulty, ManifestItem} from "../services/tutorial-manifest.service";
import {TutorialResolved} from "./tutorial.resolver";

@Component({
    selector: 'gem-tutorial',
    imports: [RouterLink, NgIconComponent, NgClass, NgTemplateOutlet],
    templateUrl: './tutorial.component.html',
    viewProviders: [
        provideIcons({tablerArrowLeft, tablerBrandGithub, tablerLink, tablerInfoCircle, tablerGitPullRequest})
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
      .yt-embed {
        margin: 1.25rem 0;
        aspect-ratio: 16 / 9;
      }

      .yt-embed iframe {
        width: 100%;
        height: 100%;
        border: 0;
        border-radius: 12px;
      }
    `
})
export class TutorialComponent implements AfterViewInit, OnDestroy {
    readonly contentContainer = viewChild<ElementRef<HTMLDivElement>>('contentContainer');
    private readonly clipboard = inject(Clipboard);
    private readonly seo = inject(SeoService);
    private readonly contentSvc = inject(TutorialContentService);
    private readonly route = inject(ActivatedRoute);
    private readonly titleService = inject(Title);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly snackbar = inject(MatSnackBar);

    private readonly difficultyLabels = {
        [Difficulty.Beginner]: 'Beginner',
        [Difficulty.Intermediate]: 'Intermediate',
        [Difficulty.Advanced]: 'Advanced'
    };

    readonly contentHost = viewChild<ElementRef<HTMLElement>>('contentHost');
    readonly scrollBehavior = signal<ScrollBehavior>('instant');
    private readonly destroyRef = inject(DestroyRef);
    readonly isBrowser = signal<boolean>(isPlatformBrowser(this.platformId));
    readonly activeSectionId = signal<string>('');
    readonly fragment = toSignal(this.route.fragment, {initialValue: null});

    private readonly resolved = toSignal<TutorialResolved | null>(
        this.route.data.pipe(
            map(data => data['tutorial'] ?? null)
        ),
        {initialValue: null}
    );

    readonly item = computed(() => this.resolved()?.item ?? null);
    readonly markdown = computed(() => this.resolved()?.markdown ?? '');

    readonly difficulty = computed(() => {
        const item = this.item();
        return item?.difficulty ? this.difficultyLabels[item.difficulty] : null;
    });

    readonly readTime = computed(() => estimateReadTimeFromMarkdown(this.markdown()));

    readonly assetDir = computed(() => {
        const item = this.item();
        return item ? `${environment.tutorialAssets}/${item.id}` : '';
    });
    readonly rendered = computed(() => this.contentSvc.renderMarkdown(this.markdown(), this.assetDir()));

    readonly tutorialHtml = computed(() => this.rendered().html);
    readonly toc = computed(() => this.rendered().outline);

    private io: IntersectionObserver | null = null;

    constructor() {
        combineLatest([
            toObservable(this.item),
            toObservable(this.markdown),
            toObservable(this.rendered),
            toObservable(this.fragment),
        ])
            .pipe(
                filter(([item, md]) => !!item && !!md),
                auditTime(0),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(([item, _md, rendered]) => {
                const it = item!;

                this.titleService.setTitle(`Tutorial: ${it.title}`);
                this.setSeo(it);

                const firstSec = rendered.sections[0]?.id ?? '';
                this.activeSectionId.set(firstSec);
            });

        combineLatest([
            toObservable(this.fragment),
            toObservable(this.tutorialHtml),
            toObservable(this.contentHost).pipe(map(ref => ref?.nativeElement ?? null)),
        ])
            .pipe(
                filter(([fragment, html, host]) => this.isBrowser() && !!fragment && !!html && !!host),
                map(([fragment]) => fragment as string),
                distinctUntilChanged(),
                auditTime(0),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(fragment => {
                this.scrollToSection(fragment, this.scrollBehavior());
            });

        combineLatest([
            toObservable(this.toc),
            toObservable(this.tutorialHtml),
            toObservable(this.contentHost).pipe(map(ref => ref?.nativeElement ?? null)),
        ])
            .pipe(
                filter(([, html, host]) => !!host && !!html),
                auditTime(0),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(([toc, _html]) => {
                this.disconnectObserver();

                if (!this.isBrowser()) return;
                if (!toc.length) return;

                queueMicrotask(() => this.setupIntersectionObserver(toc));
        });
    }

    ngAfterViewInit(): void {
        if (!this.isBrowser())
            return;

        this.scrollBehavior.set(
            window.matchMedia(`(prefers-reduced-motion: reduce)`).matches ? 'instant' : 'smooth'
        );

        this.contentContainer()?.nativeElement.addEventListener('click', ev => {
            const target = ev.target as HTMLElement | null;

            let action: 'link' | 'bookmark' | null;

            let btn = target?.closest<HTMLElement>('[data-action="bookmark-heading"]');

            if (!btn) {
                btn = target?.closest<HTMLElement>('[data-action="link-heading"]');
                action = 'link';
            } else {
                action = 'bookmark';
            }

            const parent = btn?.parentElement?.parentElement;

            const headingId = parent?.getAttribute('id');
            if (!headingId) return;

            switch (action) {
                case 'link':
                    this.copySectionLink(headingId);
                    break;
                default:
                    break;
            }
        });
    }

    ngOnDestroy(): void {
        this.seo.removeJsonLd();
    }

    scrollToSection(id: string, behavior: ScrollBehavior = this.scrollBehavior()): void {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({behavior, block: 'start'});
        this.activeSectionId.set(id);
    }

    copySectionLink(id: string): void {
        this.clipboard.copy(`https://gem-tools.vercel.app/tutorials/${this.item()?.id}#${id}`);
        this.snackbar.open(`Link copied.`, '', {duration: 2000});
    }

    private setupIntersectionObserver(toc: TutorialSection[]): void {
        const ids = toc.map(s => {
            const subIds = s.children?.map(c => c.id) ?? [];

            return [...subIds, s.id];
        })
            .flatMap(a => a);

        const targets = ids
            .map((id) => document.getElementById(id))
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

    private setSeo(t: ManifestItem): void {
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
            author: {'@type': 'Person', name: t?.author}
        });
    }
}
