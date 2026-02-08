import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser, NgClass} from '@angular/common';
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
import {combineLatest} from "rxjs";
import {filter, map} from "rxjs/operators";
import {environment} from "../../../../environments/environment";
import {SeoService} from "../../../services/seo.service";
import {estimateReadTimeFromMarkdown} from "../../../utils/read-time";
import {TutorialContentService} from "../services/tutorial-content.service";
import {Difficulty, ManifestItem} from "../services/tutorial-manifest.service";
import {TocComponent} from "./toc/toc.component";
import {TutorialResolved} from "./tutorial.resolver";

@Component({
    selector: 'gem-tutorial',
    imports: [RouterLink, NgIconComponent, NgClass, TocComponent],
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
    private readonly clipboard = inject(Clipboard);
    private readonly seo = inject(SeoService);
    private readonly contentSvc = inject(TutorialContentService);
    private readonly route = inject(ActivatedRoute);
    private readonly titleService = inject(Title);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly snackbar = inject(MatSnackBar);
    private readonly destroyRef = inject(DestroyRef);

    private readonly difficultyLabels = {
        [Difficulty.Beginner]: 'Beginner',
        [Difficulty.Intermediate]: 'Intermediate',
        [Difficulty.Advanced]: 'Advanced'
    };

    readonly contentContainer = viewChild<ElementRef<HTMLDivElement>>('contentContainer');
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

    constructor() {
        combineLatest([
            toObservable(this.item),
            toObservable(this.markdown),
            toObservable(this.rendered),
            toObservable(this.fragment),
        ])
            .pipe(
                filter(([item, md]) => !!item && !!md),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(([item, _md, rendered, fragment]) => {
                const it = item!;

                this.titleService.setTitle(`Tutorial: ${it.title}`);
                this.setSeo(it);

                const firstSec = rendered.sections[0]?.id ?? '';
                this.activeSectionId.set(firstSec);

                if (this.isBrowser() && !fragment)
                    window.scrollTo({top: 0, behavior: 'instant'})
            });
    }

    ngAfterViewInit(): void {
        if (!this.isBrowser())
            return;

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

    copySectionLink(id: string): void {
        this.clipboard.copy(`https://gem-tools.vercel.app/tutorials/${this.item()?.id}#${id}`);
        this.snackbar.open(`Link copied.`, '', {duration: 2000});
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
