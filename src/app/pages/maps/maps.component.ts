import {NgOptimizedImage} from "@angular/common";
import {Component, computed, inject, signal} from '@angular/core';
import {SeoService} from "../../services/seo.service";
import {mapData, MapItem} from "./data/maps";

@Component({
  selector: 'app-maps',
  imports: [NgOptimizedImage],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
})
export class MapsComponent {
  private readonly seo = inject(SeoService);
  private readonly previewBase = '/assets/maps';

  private missingPreview = signal<Set<string>>(new Set());

  maps = signal<MapItem[]>([]);

  query = signal('');

  visibleMaps = computed(() => {
    const q = this.query().toLowerCase();

    let list = this.maps();

    if (q) list = list.filter(m => m.name.toLowerCase().includes(q));

    list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  });

  constructor() {
    this.seo.apply({
      title: 'Maps',
      description: 'List of all maps in the GEM-Editor. Search for maps by name.',
      ogType: 'website',
      canonicalUrl: 'https://gem-tools.vercel.app/maps',
      image: '',
      url: 'https://gem-tools.vercel.app/maps'
    });

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      headline: 'Maps - GEM-Tools',
      description: 'List of all maps in the GEM-Editor. Search for maps by name.',
      author: { '@type': 'Organization', name: 'GEM-Tools' }
    });

    this.maps.set(mapData);
  }

  previewUrl(m: MapItem): string {
    if (this.missingPreview().has(m.name)) {
      return `${this.previewBase}/_missing.webp`;
    }
    return `${this.previewBase}/${encodeURIComponent(m.name)}.webp`;
  }

  onPreviewError(m: MapItem) {
    const next = new Set(this.missingPreview());
    next.add(m.name);
    this.missingPreview.set(next);
  }
}
