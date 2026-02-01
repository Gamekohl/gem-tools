import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser, NgClass, NgTemplateOutlet} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    OnDestroy,
    PLATFORM_ID,
    signal,
    viewChild,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {NgIconComponent, provideIcons} from "@ng-icons/core";
import {tablerArrowLeft, tablerBrandGithub, tablerLink} from "@ng-icons/tabler-icons";
import {map} from "rxjs/operators";
import {environment} from "../../../../environments/environment";
import {SeoService} from "../../../services/seo.service";
import {estimateReadTimeFromMarkdown} from "../../../utils/read-time";
import {TutorialContentService, TutorialSection} from "../services/tutorial-content.service";
import {
    Difficulty,
    ManifestItem
} from "../services/tutorial-manifest.service";
import {TutorialResolved} from "./tutorial.resolver";

@Component({
    selector: 'gem-tutorial',
    imports: [RouterLink, NgIconComponent, NgClass, NgTemplateOutlet],
    templateUrl: './tutorial.component.html',
    viewProviders: [
        provideIcons({tablerArrowLeft, tablerBrandGithub, tablerLink})
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialComponent implements OnDestroy {
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
        effect(() => {
            const html = this.tutorialHtml();
            const toc = this.toc();
            const host = this.contentHost()?.nativeElement;

            this.disconnectObserver();

            if (!host || !html) return;

            if (this.isBrowser()) {
                queueMicrotask(() => {
                    if (toc.length) this.setupIntersectionObserver(toc);
                });
            }
        });

        effect(() => {
            const item = this.item();
            const markdown = this.markdown();
            const rendered = this.rendered();
            const fragment = this.fragment();

            if (!item || !markdown) return;

            this.titleService.setTitle(`Tutorial: ${item.title}`);
            this.setSeo(item);

            const firstSec = rendered.sections[0]?.id ?? '';
            this.activeSectionId.set(firstSec);

            if (this.isBrowser() && !fragment)
                queueMicrotask(() => window.scrollTo({top: 0, behavior: 'smooth'}));
        });

        effect(() => {
            const fragment = this.fragment();
            const host = this.contentHost()?.nativeElement;
            const html = this.tutorialHtml();

            if (!this.isBrowser() || !fragment || !host || !html) return;

            queueMicrotask(() => this.scrollToSection(fragment, 'smooth'));
        });
    }

    ngOnDestroy(): void {
        this.seo.removeJsonLd();
    }

    scrollToSection(id: string, behavior: ScrollBehavior = 'smooth'): void {
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
