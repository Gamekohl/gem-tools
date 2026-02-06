import {NgClass} from "@angular/common";
import {ChangeDetectionStrategy, Component, computed, inject, model, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormsModule} from "@angular/forms";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {NgIcon, provideIcons} from "@ng-icons/core";
import {tablerBrandGithub} from "@ng-icons/tabler-icons";
import {SeoService} from "../../services/seo.service";
import {Difficulty, TutorialManifest, TutorialManifestService} from "./services/tutorial-manifest.service";
import {TutorialCardComponent} from "./tutorial-card/tutorial-card.component";

type DifficultyFilter = 0 | Difficulty;

@Component({
  selector: 'gem-tutorials',
  imports: [NgClass, FormsModule, MatPaginatorModule, TutorialCardComponent, NgIcon],
  templateUrl: './tutorials.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ tablerBrandGithub })
  ],
})
export class TutorialsComponent {
  private readonly seo = inject(SeoService);
  private readonly manifestSvc = inject(TutorialManifestService);

  readonly pageSizeOptions = [10];
  readonly difficultyEnum = Difficulty;

  readonly manifest = toSignal<TutorialManifest | null>(
      this.manifestSvc.manifest$,
      { initialValue: null }
  );

  readonly query = model('');

  readonly difficulty = signal<DifficultyFilter>(0);

  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(this.pageSizeOptions[0]);

  readonly filteredItems = computed(() => {
    const q = this.query().trim().toLowerCase();
    const diff = this.difficulty();

    if (this.manifest() === null)
      return [];

    return this.manifest()!.filter(item => {
      const matchesDiff =
          diff === 0 ? true : item.difficulty === diff;

      const hay =
          `${item.title} ${item.subtitle} ${(item.tags ?? []).join(' ')}`.toLowerCase();

      const matchesQuery = q ? hay.includes(q) : true;

      return matchesDiff && matchesQuery;
    });
  });

  readonly stats = computed(() => {
    const total = this.manifest()?.length;
    const shown = this.filteredItems().length;

    // count by difficulty (for quick chips)
    const counts = { Beginner: 0, Intermediate: 0, Advanced: 0 };

    const manifest = this.manifest();

    if (!manifest) {
      return { total, shown, counts };
    } else {
      for (const i of manifest) {
        if (i.difficulty === Difficulty.Beginner) counts.Beginner++;
        if (i.difficulty === Difficulty.Intermediate) counts.Intermediate++;
        if (i.difficulty === Difficulty.Advanced) counts.Advanced++;
      }

      return { total, shown, counts };
    }
  });

  readonly pagedItems = computed(() => {
    const items = this.filteredItems();
    const start = this.pageIndex() * this.pageSize();
    return items.slice(start, start + this.pageSize());
  });

    readonly featuredItems = computed(() => this.pagedItems().filter(i => i.featured));
    readonly nonFeaturedItems = computed(() => this.pagedItems().filter(i => !i.featured));

  constructor() {
    this.seo.apply({
      title: 'Tutorials',
      canonicalUrl: 'https://gem-tools.vercel.app/tutorials',
      description: 'Tutorials for the GEM-Editor: Learn how to use GEM-Editor to create maps, missions and more.',
      ogType: 'website',
      image: '',
      url: 'https://gem-tools.vercel.app/tutorials'
    });

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      headline: 'Tutorials - GEM-Tools',
      description: 'Tutorials for the GEM-Editor: Learn how to use GEM-Editor to create maps, missions and more.',
      author: { '@type': 'Organization', name: 'GEM-Tools' }
    });
  }

  setDifficulty(v: DifficultyFilter): void {
    this.difficulty.set(v);
    this.pageIndex.set(0);
    this.pageSize.set(this.pageSizeOptions[0]);
  }

  onPage(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }
}
