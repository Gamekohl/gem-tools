import {Clipboard} from "@angular/cdk/clipboard";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {isPlatformBrowser} from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    inject,
    model,
    PLATFORM_ID,
    signal
} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {tablerCopy, tablerX} from '@ng-icons/tabler-icons';
import {FilterPipe} from '../../pipes/filter.pipe';
import {SeoService} from "../../services/seo.service";
import {animationNamesData} from "./data/animationNames";

@Component({
    selector: 'app-animations',
    imports: [NgIconComponent, FilterPipe, FormsModule, ReactiveFormsModule, ScrollingModule],
    templateUrl: './animations.component.html',
    styleUrl: './animations.component.scss',
    viewProviders: [provideIcons({tablerCopy, tablerX})],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationsComponent {
    private readonly seo = inject(SeoService);
    private readonly clipboard = inject(Clipboard);
    private readonly snackbar = inject(MatSnackBar);

    query = model<string>('');

    animationNames = signal<string[]>(animationNamesData.names);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.seo.apply({
            title: 'Animations',
            description: 'List of all animations in the GEM-Editor. Search for animations by name and quickly copy them to the clipboard.',
            ogType: 'website',
            canonicalUrl: 'https://gem-tools.vercel.app/animations',
            image: '',
            url: 'https://gem-tools.vercel.app/animations'
        });

        this.seo.setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            headline: 'Animations - GEM-Tools',
            description: 'Tutorials for the GEM-Editor: Learn how to use GEM-Editor to create maps, missions and more.',
            author: { '@type': 'Organization', name: 'GEM-Tools' }
        });
    }

    copyAnimationName(name: string): void {
        if(!isPlatformBrowser(this.platformId))
            return;

        this.clipboard.copy(name);

        this.snackbar.open(`"${name}" copied to clipboard`, '', {duration: 2000});
    }
}
