import {isPlatformBrowser, NgOptimizedImage} from "@angular/common";
import {ChangeDetectionStrategy, Component, effect, inject, Inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
    tablerArrowsRandom,
    tablerBox,
    tablerBrandGithub,
    tablerCoffee,
    tablerMap, tablerMoon,
    tablerPhotoEdit, tablerSun
} from '@ng-icons/tabler-icons';
import {inject as injectAnalytics} from '@vercel/analytics';
import {environment} from "../environments/environment";
import {SeoService} from "./services/seo.service";

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        NgIconComponent,
        RouterLink,
        RouterLinkActive,
        NgOptimizedImage
    ],
    viewProviders: [provideIcons({
        tablerBox,
        tablerBrandGithub,
        tablerCoffee,
        tablerArrowsRandom,
        tablerPhotoEdit,
        tablerMap,
        tablerMoon,
        tablerSun
    })],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
    private readonly seo = inject(SeoService);

    readonly version = environment.version;

    theme = signal<'light' | 'dark'>('light');

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.seo.setConfig({
            siteName: 'GEM-Tools',
            defaultTitle: 'GEM-Tools',
            defaultDescription: 'Tools, Tutorials and Ressources for the GEM-Editor ',
            baseUrl: 'https://gem-tools.vercel.app/',
            defaultOgImage: 'https://gem-tools.vercel.app/assets/og/default.png'
        });

        if(!isPlatformBrowser(platformId))
          return;

        const theme = (localStorage.getItem('gemtools:theme') ?? 'light') as 'light' | 'dark';

        this.theme.set(theme);
        this.setTheme();

        effect(() => {
            localStorage.setItem('gemtools:theme', this.theme());
        });
    }

    ngOnInit(): void {
        injectAnalytics();
    }

    toggleTheme(): void {
        this.theme.set(this.theme() === 'light' ? 'dark' : 'light');

        this.setTheme();
    }

    private setTheme(): void {
      if (this.theme() === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
}
