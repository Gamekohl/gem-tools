import {isPlatformBrowser, NgClass, NgTemplateOutlet} from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  PLATFORM_ID,
  signal
} from '@angular/core';
import {takeUntilDestroyed, toObservable, toSignal} from "@angular/core/rxjs-interop";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {distinctUntilChanged} from "rxjs";
import {filter} from "rxjs/operators";
import {TutorialSection} from "../../services/tutorial-content.service";

@Component({
    selector: 'app-toc',
    imports: [RouterLink, NgClass, NgTemplateOutlet],
    templateUrl: './toc.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TocComponent implements AfterViewInit {
    private io: IntersectionObserver | null = null;

    private readonly platformId = inject(PLATFORM_ID);
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    private readonly isBrowser = signal<boolean>(isPlatformBrowser(this.platformId));
    private readonly fragment = toSignal(this.route.fragment, {initialValue: null});
    private readonly scrollBehavior = signal<ScrollBehavior>('instant');

    toc = input.required<TutorialSection[]>();
    activeSectionId = model.required<string>();

    constructor() {
        toObservable(this.toc).pipe(
            takeUntilDestroyed(this.destroyRef),
        )
            .subscribe(toc => {
                this.disconnectObserver();

                if (!this.isBrowser()) return;
                if (!toc.length) return;

                this.setupIntersectionObserver(toc);
            });

        toObservable(this.fragment).pipe(
            filter(() => this.isBrowser()),
            filter(fragment => !!fragment),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef),
        )
            .subscribe(fragment => this.scrollToSection(fragment!, this.scrollBehavior()));
    }

    ngAfterViewInit(): void {
        if (!this.isBrowser())
            return;

        this.scrollBehavior.set(
            window.matchMedia(`(prefers-reduced-motion: reduce)`).matches ? 'instant' : 'smooth'
        );
    }

    private scrollToSection(id: string, behavior: ScrollBehavior = this.scrollBehavior()): void {
        const el = document.getElementById(id);

        if (!el) return;

        el.scrollIntoView({behavior, block: 'start'});
        this.activeSectionId.set(id);
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
}
