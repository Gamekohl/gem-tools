import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, inject, NO_ERRORS_SCHEMA, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerArrowNarrowRight, tablerBox, tablerCopy, tablerFolder, tablerFolderOpen } from '@ng-icons/tabler-icons';
import { debounceTime, filter } from 'rxjs';

@Component({
    selector: 'app-resources',
    standalone: true,
    imports: [MatTreeModule, NgIconComponent, ReactiveFormsModule, ClipboardModule],
    templateUrl: './resources.component.html',
    styleUrl: './resources.component.scss',
    viewProviders: [provideIcons({ tablerFolder, tablerFolderOpen, tablerCopy, tablerBox, tablerArrowNarrowRight })],
})
export class ResourcesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private _data: ResourceNode[] = [];
  private currentQuery = '';
  private tree = viewChild<MatTree<ResourceNode, ResourceNode>>('tree');

  currentPath: string[] = [];

  form = this.fb.group({
    search: [''],
  });

  dataSource: ResourceNode[] = [];

  childrenAccessor = (node: ResourceNode) => node.children ?? [];

  hasChild = (_: number, node: ResourceNode) => !!node.children && node.children.length > 0;

  ngOnInit(): void {
    this.http.get<ResourceNode[]>('/assets/structure.json')
      .subscribe({
        next: data => {
          this.dataSource = data;
          this._data = data;
        }
      });

    this.form.get('search')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(query => query.length >= 3 || query.length === 0),
      debounceTime(500)
    )
      .subscribe({
        next: query => this.applyFilter(query),
      });
  }

  applyFilter(query: string): void {
    this.currentQuery = query;
    this.filterTree(query);
    
    if (query) {
      this.tree()?.expandAll();
    } else {
      this.tree()?.collapseAll();
    }
  }

  getText(name: string): string {
    if (!this.currentQuery) return name;

    const regex = new RegExp(this.currentQuery, 'gi');
    return name.replace(regex, match => `<mark>${match}</mark>`);
  }

  private filterTree(query: string): void {
    this.dataSource = this.filterRecursive(query, this._data);
  }

  private filterRecursive(
    query: string,
    data: ResourceNode[],
    property: keyof ResourceNode = 'name'
  ): ResourceNode[] {
    if (!query) return data;

    const lowerQuery = query.toLowerCase();

    return data
      .map(node => ({ ...node }))
      .filter(node => {
        if (typeof node[property] === 'string' && (node[property] as string).toLowerCase().includes(lowerQuery)) {
          return true;
        }

        if (node.children) {
          node.children = this.filterRecursive(lowerQuery, node.children, property);
          return node.children.length > 0;
        }

        return false;
      });
  }

  private updatePath(nodeName: string): void {
    const path = this.findPath(nodeName, this.dataSource);

    if (path) {
      this.currentPath = path;
    }
  }

  private findPath(target: string, nodes: ResourceNode[], path: string[] = []): string[] | null {
    for (const node of nodes) {
      const newPath = [...path, node.name];

      if (node.name === target)
        return newPath;

      if (node.children) {
        const childPath = this.findPath(target, node.children, newPath);
        if (childPath)
          return childPath;
      }
    }

    return null;
  }
}

interface ResourceNode {
  name: string;
  children: ResourceNode[];
}
