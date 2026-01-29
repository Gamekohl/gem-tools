import {DatePipe, NgClass} from "@angular/common";
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CHANGELOG, ChangelogEntry} from "../../../content/changelog/changelog.data";
import {SeoService} from "../../services/seo.service";

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.scss',
    imports: [
        DatePipe,
        NgClass
    ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangelogComponent {
  private readonly seo = inject(SeoService);

  readonly changelog = CHANGELOG;

  selectedEntry = signal<ChangelogEntry>(this.changelog[0]);

  constructor() {
    this.seo.apply({
      title: 'Changelog',
      description: 'All updates, features and bugfixes for GEM-Tools.',
      ogType: 'website',
      canonicalUrl: 'https://gem-tools.vercel.app/changelog',
      image: '',
      url: 'https://gem-tools.vercel.app/changelog'
    });

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      headline: 'Changelog - GEM-Tools',
      description: 'All updates, features and bugfixes for GEM-Tools.',
      author: { '@type': 'Organization', name: 'GEM-Tools' }
    });
  }

  selectEntry(entry: ChangelogEntry): void {
    this.selectedEntry.set(entry);
  }
}
