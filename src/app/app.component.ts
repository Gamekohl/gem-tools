import {BreakpointObserver} from "@angular/cdk/layout";
import {isPlatformBrowser, NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    effect,
    inject,
    Inject,
    OnInit,
    PLATFORM_ID,
    signal,
    viewChild
} from '@angular/core';
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {MatSidenav, MatSidenavModule} from "@angular/material/sidenav";
import {NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
    tablerArrowsRandom,
    tablerBox,
    tablerBrandGithub,
    tablerCoffee,
    tablerMap,
    tablerMenu2,
    tablerMoon,
    tablerPhotoEdit,
    tablerSun
} from '@ng-icons/tabler-icons';
import {inject as injectAnalytics} from '@vercel/analytics';
import {filter, map} from "rxjs/operators";
import {environment} from "../environments/environment";
import {SeoService} from "./services/seo.service";

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        NgIconComponent,
        RouterLink,
        RouterLinkActive,
        NgOptimizedImage,
        MatSidenavModule,
        NgTemplateOutlet
    ],
    viewProviders: [provideIcons({
        tablerBox,
        tablerBrandGithub,
        tablerCoffee,
        tablerArrowsRandom,
        tablerPhotoEdit,
        tablerMap,
        tablerMoon,
        tablerSun,
        tablerMenu2
    })],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
    opened = false;
    sidenav = viewChild.required<MatSidenav>('sidenav');
    private readonly seo = inject(SeoService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly breakpointObserver = inject(BreakpointObserver);

    readonly version = environment.version;
    showMenu = toSignal(
        this.breakpointObserver.observe(['(max-width: 1050px)']).pipe(
            map(({matches}) => matches),
        ),
        {requireSync: true}
    );
    private readonly router = inject(Router);

    theme = signal<'light' | 'dark'>('light');
    private readonly cdr = inject(ChangeDetectorRef);

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

        this.router.events.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter(event => event instanceof NavigationStart)
        )
            .subscribe({
                next: () => this.opened = false
            });
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
