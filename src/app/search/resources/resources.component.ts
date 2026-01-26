import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser} from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef, ElementRef, Inject,
    inject,
    OnInit, PLATFORM_ID,
    viewChild
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTree, MatTreeModule} from "@angular/material/tree";
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {tablerArrowNarrowRight, tablerBox, tablerCopy, tablerFolder, tablerFolderOpen, tablerX} from '@ng-icons/tabler-icons';
import {debounceTime, filter} from 'rxjs';
import {PreviewImageComponent} from "../../preview-image/preview-image.component";
@Component({
    selector: 'app-resources',
    imports: [NgIconComponent, ReactiveFormsModule, MatTree, MatTreeModule, MatInputModule, MatFormFieldModule, PreviewImageComponent],
    templateUrl: './resources.component.html',
    styleUrl: './resources.component.scss',
    viewProviders: [provideIcons({tablerFolder, tablerFolderOpen, tablerCopy, tablerBox, tablerArrowNarrowRight, tablerX})],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourcesComponent implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly destroyRef = inject(DestroyRef);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly clipboard = inject(Clipboard);
    private readonly snackbar = inject(MatSnackBar);

    private _data: ResourceNode[] = [];
    private currentQuery = '';

    private preview = viewChild.required(PreviewImageComponent);
    private tree = viewChild<MatTree<ResourceNode, ResourceNode>>('tree');

    form = this.fb.group({
        search: [''],
    });

    dataSource: ResourceNode[] = [];

    childrenAccessor = (node: ResourceNode) => node.children ?? [];

    hasChild = (_: number, node: ResourceNode) => !!node.children && node.children.length > 0;

    resolvePreviewUrl = (node: ResourceNode) =>
        node.path ? `/objects${node.path}.webp` : null;

    get searchControl(): FormControl<string> {
        return this.form.get('search') as FormControl<string>;
    }

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId))
            return;

        const dataWithPaths = this.assignPaths(structureData);
        this.dataSource = dataWithPaths;
        this._data = dataWithPaths;

        this.cdr.markForCheck();

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

        this.cdr.markForCheck();

        if (isPlatformBrowser(this.platformId)) {
            queueMicrotask(() => {
                const tree = this.tree();
                tree?.collapseAll();

                if (query.length) {
                    this.expandPathsToMatches(query, this.dataSource);
                }
            });
        }
    }

    getText(name: string): string {
        if (!this.currentQuery) return name;

        const regex = new RegExp(this.currentQuery, 'gi');
        return name.replace(regex, match => `<mark>${match}</mark>`);
    }

    copyName(name: string): void {
        if (isPlatformBrowser(this.platformId)) {
            this.clipboard.copy(name);

            this.snackbar.open(`"${name}" copied to clipboard`, '', { duration: 2000 });
        }
    }

    openPreview(el: HTMLElement, node: ResourceNode): void {
        this.preview().open(new ElementRef(el), node);
    }

    closePreview(): void {
        this.preview().close();
    }

    private filterTree(query: string): void {
        if (query.length === 0) {
            this.dataSource = this._data;

            return;
        }

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
            .map(node => ({...node}))
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

    private expandPathsToMatches(query: string, roots: ResourceNode[]): void {
        const tree = this.tree();
        if (!tree || !query) return;

        const q = query.toLowerCase();

        const dfs = (node: ResourceNode): boolean => {
            const selfMatch = node.name.toLowerCase().includes(q);

            let childHasMatch = false;
            for (const child of node.children ?? []) {
                if (dfs(child)) childHasMatch = true;
            }

            if (childHasMatch) {
                tree.expand(node);
            }

            return selfMatch || childHasMatch;
        };

        for (const root of roots) dfs(root);
    }

    private assignPaths(nodes: ResourceNode[], parentPath = ''): ResourceNode[] {
        return nodes.map(n => {
            const path = parentPath ? `${parentPath}/${n.name}` : `/${n.name}`;

            return {
                ...n,
                path,
                children: n.children
                    ? this.assignPaths(n.children, path)
                    : [],
            };
        });
    }
}

import {ResourceNode, structureData} from "./data/structure";
