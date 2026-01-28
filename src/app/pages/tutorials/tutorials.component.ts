import {NgClass} from "@angular/common";
import {Component, computed, inject, signal} from '@angular/core';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {NgIconComponent, provideIcons} from "@ng-icons/core";
import {tablerChevronRight} from "@ng-icons/tabler-icons";
import {SeoService} from "../../services/seo.service";
import {
  TutorialManifest,
  TutorialManifestService
} from "./services/tutorial-manifest.service";

type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

@Component({
  selector: 'gem-tutorials',
  standalone: true,
  imports: [RouterModule, NgIconComponent, NgClass],
  templateUrl: './tutorials.component.html',
  viewProviders: [
      provideIcons({ tablerChevronRight })
  ]
})
export class TutorialsComponent {
  private readonly seo = inject(SeoService);
  private readonly manifestSvc = inject(TutorialManifestService);

  readonly manifest = toSignal<TutorialManifest>(
      this.manifestSvc.getManifest$(),
      { initialValue: null }
  );

  readonly query = signal('');
  readonly difficulty = signal<DifficultyFilter>('All');

  readonly filteredItems = computed(() => {
    const q = this.query().trim().toLowerCase();
    const diff = this.difficulty();

    if (this.manifest() === null)
      return [];

    return this.manifest()!.filter(item => {
      const matchesDiff =
          diff === 'All' ? true : (item.difficulty ?? '') === diff;

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
        if (i.difficulty === 'Beginner') counts.Beginner++;
        if (i.difficulty === 'Intermediate') counts.Intermediate++;
        if (i.difficulty === 'Advanced') counts.Advanced++;
      }

      return { total, shown, counts };
    }
  });

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
  }
}
