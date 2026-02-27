import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser} from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    Inject,
    inject,
    model,
    OnInit,
    PLATFORM_ID,
    viewChild
} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTree, MatTreeModule} from "@angular/material/tree";
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
    tablerArrowNarrowRight,
    tablerArrowsDiagonal,
    tablerArrowsDiagonalMinimize,
    tablerBox,
    tablerCopy,
    tablerFolder,
    tablerFolderOpen,
    tablerStar,
    tablerX
} from '@ng-icons/tabler-icons';
import {tablerStarFill} from "@ng-icons/tabler-icons/fill";
import {ResourceNode} from "../../../interfaces";
import {PreviewImageComponent} from "../../preview-image/preview-image.component";
import {SeoService} from "../../services/seo.service";
import {structureData} from "./data/structure";

@Component({
    selector: 'app-resources',
    imports: [
        NgIconComponent,
        MatTree,
        MatTreeModule,
        MatInputModule,
        MatFormFieldModule,
        PreviewImageComponent,
        FormsModule
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
    private readonly seo = inject(SeoService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly clipboard = inject(Clipboard);
    private readonly snackbar = inject(MatSnackBar);

    private _data: ResourceNode[] = [];

    private preview = viewChild.required(PreviewImageComponent);
    private tree = viewChild<MatTree<ResourceNode, ResourceNode>>('tree');

    search = model<string>('');

    viewData = computed(() => {
        const query = this.search();

        if (query.length === 0) {
            return this._data;
        }

        return this.filterRecursive(query, this._data);
    });

    childrenAccessor = (node: ResourceNode) => node.children ?? [];

    hasChild = (_: number, node: ResourceNode) => !!node.children && node.children.length > 0;

    resolvePreviewUrl = (node: ResourceNode) =>
        node.path ? `/objects${node.path}.webp` : null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.seo.apply({
            title: 'Editor Objects',
            description: 'List of all objects in the GEM-Editor. Search for objects by name and quickly copy them to the clipboard.',
            ogType: 'website',
            canonicalUrl: 'https://gem-tools.vercel.app/resources',
            image: '',
            url: 'https://gem-tools.vercel.app/resources'
        });

        this.seo.setJsonLd({
           '@context': 'https://schema.org',
           '@type': 'CollectionPage',
           headline: 'Objects - GEM-Tools',
           description: 'List of all objects in the GEM-Editor. Search for objects by name and quickly copy them to the clipboard.',
           author: { '@type': 'Organization', name: 'GEM-Tools' }
        });

        toObservable(this.viewData).pipe(
            takeUntilDestroyed(this.destroyRef),
        )
            .subscribe({
                next: () => this.applyFilter()
            });
    }

    ngOnInit(): void {
        this._data = structureData;

        this.cdr.markForCheck();
    }

    applyFilter(): void {
        if (isPlatformBrowser(this.platformId)) {
            const tree = this.tree();
            tree?.collapseAll();

            if (this.search().length >= 3) {
                this.expandPathsToMatches(this.search(), this.viewData());
            }
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

    private filterRecursive(
        query: string,
        data: ResourceNode[],
        property: keyof ResourceNode = 'name'
    ): ResourceNode[] {
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

        const q = query.toLowerCase();

        const dfs = (node: ResourceNode): boolean => {
            const selfMatch = node.name.toLowerCase().includes(q);

            let childHasMatch = false;
            for (const child of node.children ?? []) {
                if (dfs(child)) childHasMatch = true;
            }

            if (childHasMatch) {
                tree?.expand(node);
            }

            return selfMatch || childHasMatch;
        };

        for (const root of roots) dfs(root);
    }
}
