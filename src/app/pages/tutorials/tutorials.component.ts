import {NgClass} from "@angular/common";
import {Component, computed, inject, signal} from '@angular/core';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {NgIconComponent, provideIcons} from "@ng-icons/core";
import {tablerChevronRight} from "@ng-icons/tabler-icons";
import {
  ManifestItem,
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
  private readonly manifestSvc = inject(TutorialManifestService);

  readonly manifest = toSignal<TutorialManifest>(
      this.manifestSvc.getManifest$(),
      { initialValue: null }
  );

  // UI state
  readonly query = signal('');
  readonly difficulty = signal<DifficultyFilter>('All');

  // Flatten items (keep group title for display)
  readonly allItems = computed(() => {
    const m = this.manifest();
    const out: Array<ManifestItem & { groupTitle: string }> = [];

    for (const g of m?.groups ?? []) {
      for (const item of g.items ?? []) {
        out.push({ ...item, groupTitle: g.title });
      }
    }
    return out;
  });

  readonly filteredItems = computed(() => {
    const q = this.query().trim().toLowerCase();
    const diff = this.difficulty();

    return this.allItems().filter((item) => {
      const matchesDiff =
          diff === 'All' ? true : (item.difficulty ?? '') === diff;

      const hay =
          `${item.title} ${item.subtitle} ${(item.tags ?? []).join(' ')} ${item.groupTitle}`.toLowerCase();

      const matchesQuery = q ? hay.includes(q) : true;

      return matchesDiff && matchesQuery;
    });
  });

  readonly stats = computed(() => {
    const total = this.allItems().length;
    const shown = this.filteredItems().length;

    // count by difficulty (for quick chips)
    const counts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    for (const i of this.allItems()) {
      if (i.difficulty === 'Beginner') counts.Beginner++;
      if (i.difficulty === 'Intermediate') counts.Intermediate++;
      if (i.difficulty === 'Advanced') counts.Advanced++;
    }

    return { total, shown, counts };
  });

  setDifficulty(v: DifficultyFilter) {
    this.difficulty.set(v);
  }

  trackById = (_: number, item: ManifestItem & { groupTitle: string }) => item.id;
}
