import { ClipboardModule } from '@angular/cdk/clipboard';
import { FlatTreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, inject, NO_ERRORS_SCHEMA, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
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
    schemas: [NO_ERRORS_SCHEMA]
})
export class ResourcesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private _data: ResourceNode[] = [];
  private currentQuery = '';
  private treeContainer = viewChild<ElementRef<HTMLDivElement>>('treeContainer');

  private _transformer = (node: ResourceNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  currentPath: string[] = [];

  form = this.fb.group({
    search: [''],
  });

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit(): void {
    this.http.get<ResourceNode[]>('/assets/structure.json').subscribe({
      next: data => {
        this.dataSource.data = data;
        this._data = data;
        this.trackScrolling();
      },
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
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  getText(name: string): string {
    if (!this.currentQuery) return name;

    const regex = new RegExp(this.currentQuery, 'gi');
    return name.replace(regex, match => `<mark>${match}</mark>`);
  }

  toggle(node: FlatNode): void {
    if (this.treeControl.isExpanded(node)) {
      this.trackScrolling();
    }
  }

  private filterTree(query: string): void {
    this.dataSource.data = this.filterRecursive(query, this._data);
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

  private trackScrolling(): void {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const nodeName = entry.target.getAttribute('data-node');

        if (nodeName !== '') {
          if (entry.isIntersecting) {
            this.currentPath = this.currentPath.filter(path => path !== nodeName);
            return;
          }

          this.updatePath(nodeName!);
        }
      }
    });

    const treeNodes = this.treeContainer()!.nativeElement.children[0].querySelectorAll('.tree-node');
    treeNodes.forEach(node => observer.observe(node));
  }

  private updatePath(nodeName: string): void {
    const path = this.findPath(nodeName, this.dataSource.data);

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

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}