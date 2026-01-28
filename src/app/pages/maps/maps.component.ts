import {NgOptimizedImage} from "@angular/common";
import {Component, computed, signal} from '@angular/core';
import {mapData, MapItem} from "./data/maps";

@Component({
  selector: 'app-maps',
  imports: [NgOptimizedImage],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
})
export class MapsComponent {
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
