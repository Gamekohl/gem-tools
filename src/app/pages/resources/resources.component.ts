import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser} from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, computed,
    DestroyRef, ElementRef, Inject,
    inject, model,
    OnInit, PLATFORM_ID, signal,
    viewChild
} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {FormsModule} from '@angular/forms';
import {MatCheckbox} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTree, MatTreeModule} from "@angular/material/tree";
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
    tablerArrowNarrowRight, tablerArrowsDiagonal, tablerArrowsDiagonalMinimize,
    tablerBox,
    tablerCopy,
    tablerFolder,
    tablerFolderOpen,
    tablerStar,
    tablerX
} from '@ng-icons/tabler-icons';
import {tablerStarFill} from "@ng-icons/tabler-icons/fill";
import {PreviewImageComponent} from "../../preview-image/preview-image.component";
import {FavoritesStore} from "../../store/favorites-store";
import {ResourceNode, structureData} from "./data/structure";

@Component({
    selector: 'app-resources',
    imports: [
        NgIconComponent,
        MatTree,
        MatTreeModule,
        MatInputModule,
        MatFormFieldModule,
        PreviewImageComponent,
        FormsModule,
        MatCheckbox
    ],
    templateUrl: './resources.component.html',
    styleUrl: './resources.component.scss',
    viewProviders: [
        provideIcons({
            tablerFolder,
            tablerFolderOpen,
            tablerCopy,
            tablerBox,
            tablerArrowNarrowRight,
            tablerX,
            tablerStar,
            tablerStarFill,
            tablerArrowsDiagonalMinimize,
            tablerArrowsDiagonal
        })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourcesComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly clipboard = inject(Clipboard);
    private readonly snackbar = inject(MatSnackBar);

    favoritesStore = inject(FavoritesStore);

    private _data: ResourceNode[] = [];

    private preview = viewChild.required(PreviewImageComponent);
    private tree = viewChild<MatTree<ResourceNode, ResourceNode>>('tree');

    showFavorites = signal<boolean>(false);

    search = model<string>('');

    viewData = computed(() => {
        const showFavorites = this.showFavorites();
        const favorites = this.favoritesStore.favorites();
        const query = this.search();

        let data = this._data;

        if (showFavorites) {
            data = this.filterTreeByFavorites(data, favorites);
        }

        if (query.length === 0) {
            return data;
        } else if (query.length >= 3) {
            data = this.filterRecursive(query, this._data);
        }

        return data;
    });

    childrenAccessor = (node: ResourceNode) => node.children ?? [];

    hasChild = (_: number, node: ResourceNode) => !!node.children && node.children.length > 0;

    resolvePreviewUrl = (node: ResourceNode) =>
        node.path ? `/objects${node.path}.webp` : null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        toObservable(this.viewData).pipe(
            takeUntilDestroyed(this.destroyRef),
        )
            .subscribe({
                next: () => this.applyFilter()
            });
    }

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId))
            return;

        this._data = structureData;

        this.cdr.markForCheck();
    }

    applyFilter(): void {
        if (isPlatformBrowser(this.platformId)) {
            queueMicrotask(() => {
                const tree = this.tree();
                tree?.collapseAll();

                if (this.search().length >= 3) {
                    this.expandPathsToMatches(this.search(), this.viewData());
                }
            });
        }
    }

    getText(name: string): string {
        if (!this.search()) return name;

        const regex = new RegExp(this.search(), 'gi');
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

    toggleFavorite({ path }: ResourceNode): void {
        if (!path) return;

        this.favoritesStore.toggle(path);
    }

    isFavorite({ path }: ResourceNode): boolean {
        if (!path) return false;

        return this.favoritesStore.isFavorite(path);
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

    private filterTreeByFavorites(data: ResourceNode[], favs: Set<string>): ResourceNode[] {
        const out: ResourceNode[] = [];

        for (const node of data) {
            const filteredChildren = node.children?.length
                ? this.filterTreeByFavorites(node.children, favs)
                : [];

            if (!node.path)
                continue;

            const isFav = favs.has(node.path);

            if (isFav || filteredChildren.length) {
                out.push({
                    ...node,
                    children: filteredChildren,
                });
            }
        }

        return out;
    }
}
