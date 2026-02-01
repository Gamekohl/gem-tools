import {NgOptimizedImage} from "@angular/common";
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgIcon, NgIconComponent, provideIcons} from "@ng-icons/core";
import {tablerChevronRight} from "@ng-icons/tabler-icons";
import {Difficulty, ManifestItem} from "../services/tutorial-manifest.service";

@Component({
  selector: 'app-tutorial-card',
  imports: [
    NgIcon,
    RouterLink,
    NgIconComponent,
    NgOptimizedImage
  ],
  viewProviders: [
    provideIcons({ tablerChevronRight })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'group rounded-2xl bg-white dark:bg-white/5 shadow-sm ring-1 ring-slate-100 dark:ring-white/10 p-5 transition hover:ring-slate-200 dark:hover:ring-white/20 relative'
  },
  template: `
    @let preview = item().preview;
    @if (preview) {
      <div class="w-full h-full absolute inset-0 rounded-2xl overflow-hidden">
        <div class="absolute inset-0 z-1 from-white/50 group-hover:from-white/65 dark:from-black/50 dark:group-hover:from-black/65 bg-linear-to-r transition-colors"></div>
        <img [ngSrc]="'assets/tutorials/' + preview" fill alt="Preview" class="object-cover z-0 opacity-50 dark:opacity-25"/>
      </div>
    }
    <a [routerLink]="['/tutorials', item().id]" class="z-10 relative">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-base font-semibold text-slate-900 dark:text-white truncate">
            {{ item().title }}
          </div>
          <div class="mt-1 text-sm text-slate-600 dark:text-white/50 line-clamp-2">
            {{ item().subtitle }}
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          @if (item().difficulty) {
            <span class="shrink-0 rounded-full bg-slate-50 px-3 py-1 text-xs text-black!">
              {{ difficultyLabels[item().difficulty!] }}
            </span>
          }
        </div>
      </div>

      @if (item().tags?.length) {
        <div class="mt-4 flex items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5">
            @for (tag of item().tags; track tag) {
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-white/5 dark:text-white">
                {{ tag }}
              </span>
            }
          </div>
        </div>
      }

      <div class="mt-4 text-sm font-medium text-slate-900 dark:text-white group-hover:underline flex items-center gap-1">
        <span>Open tutorial</span>
        <ng-icon name="tablerChevronRight"></ng-icon>
      </div>
    </a>
  `
})
export class TutorialCardComponent {
  readonly difficultyLabels = {
    [Difficulty.Beginner]: 'Beginner',
    [Difficulty.Intermediate]: 'Intermediate',
    [Difficulty.Advanced]: 'Advanced'
  };

  item = input.required<ManifestItem>();
}
