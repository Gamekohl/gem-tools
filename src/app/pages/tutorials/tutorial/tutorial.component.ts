import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser, NgClass, NgTemplateOutlet} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    Inject,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    signal,
    viewChild,
} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {NgIconComponent, provideIcons} from "@ng-icons/core";
import {tablerArrowLeft, tablerBrandGithub, tablerLink} from "@ng-icons/tabler-icons";
import {distinctUntilChanged, filter, switchMap, tap} from 'rxjs';
import {map} from "rxjs/operators";
import {environment} from "../../../../environments/environment";
import {SeoService} from "../../../services/seo.service";
import {estimateReadTimeFromMarkdown} from "../../../utils/read-time";
import {TutorialContentService, TutorialSection} from "../services/tutorial-content.service";
import {
    Difficulty,
    ManifestItem,
    TutorialManifest,
    TutorialManifestService
} from "../services/tutorial-manifest.service";


@Component({
    selector: 'gem-tutorial',
    imports: [RouterLink, NgIconComponent, NgClass, NgTemplateOutlet],
    templateUrl: './tutorial.component.html',
    viewProviders: [
        provideIcons({tablerArrowLeft, tablerBrandGithub, tablerLink})
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TutorialComponent implements OnInit, OnDestroy {
    private readonly clipboard = inject(Clipboard);
    private readonly seo = inject(SeoService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly manifestSvc = inject(TutorialManifestService);
    private readonly contentSvc = inject(TutorialContentService);
    private readonly route = inject(ActivatedRoute);
    private readonly titleService = inject(Title);

    private readonly difficultyLabels = {
        [Difficulty.Beginner]: 'Beginner',
        [Difficulty.Intermediate]: 'Intermediate',
        [Difficulty.Advanced]: 'Advanced'
    };

    readonly contentHost = viewChild<ElementRef<HTMLElement>>('contentHost');

    private readonly isBrowser = signal<boolean>(false);
    readonly manifest = signal<TutorialManifest | null>(null);
    readonly markdown = signal<string>('');
    readonly activeSectionId = signal<string>('');
    readonly item = signal<ManifestItem | null>(null);

    readonly assetDir = computed(() => `${environment.tutorialAssets}/${this.item()?.id}`);
    readonly rendered = computed(() => this.contentSvc.renderMarkdown(this.markdown(), this.assetDir()));
    readonly readTime = computed(() => estimateReadTimeFromMarkdown(this.markdown()))
    readonly difficulty = computed(() => !!this.item()?.difficulty ? this.difficultyLabels[this.item()!.difficulty!] : null);

    readonly tutorialHtml = computed(() => this.rendered().html);
    readonly toc = computed(() => this.rendered().outline);

    private io: IntersectionObserver | null = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        effect(() => {
            const html = this.tutorialHtml();
            const toc = this.toc();
            const host = this.contentHost()?.nativeElement;

            this.disconnectObserver();

            if (!host || !html || toc.length === 0) return;

            if (this.isBrowser())
                queueMicrotask(() => this.setupIntersectionObserver(toc));
        });
    }

    ngOnInit(): void {
        this.isBrowser.set(isPlatformBrowser(this.platformId));

        this.manifestSvc.manifest$.asObservable().pipe(
            takeUntilDestroyed(this.destroyRef),
            filter(manifest => !!manifest),
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
            switchMap(({file}) => this.manifestSvc.getMarkdown$(file))
        )
            .subscribe({
                next: (md) => {
                    const markdown = md as string;
                    this.markdown.set(markdown);

                    const firstSec = this.contentSvc.renderMarkdown(markdown).sections[0]?.id ?? '';
                    this.activeSectionId.set(firstSec);

                    if (this.isBrowser())
                        queueMicrotask(() => window.scrollTo({top: 0, behavior: 'smooth'}));
                }
            });
    }

    ngOnDestroy(): void {
        this.seo.removeJsonLd();
    }

    scrollToSection(id: string): void {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
        this.activeSectionId.set(id);
    }

    copySectionLink(id: string): void {
        this.clipboard.copy(`https://gem-tools.vercel.app/tutorials/${this.item()?.id}#${id}`);
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
            author: {'@type': 'Person', name: t?.author}
        });
    }
}

export default TutorialComponent
