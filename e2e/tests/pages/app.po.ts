import {expect, type Locator, type Page} from '@playwright/test';

export class AppShellPage {
    readonly page: Page;

    // Regions
    readonly header: Locator;
    readonly desktopNav: Locator;
    readonly sidenav: Locator;

    readonly menuButton: Locator;   // only exists in mobile header branch
    readonly themeToggleDesktop: Locator;
    readonly themeToggleSidenav: Locator;

    readonly navResourcesDesktop: Locator;
    readonly navAnimationsDesktop: Locator;
    readonly navTutorialsDesktop: Locator;
    readonly navMapsDesktop: Locator;

    readonly navResourcesSidenav: Locator;
    readonly navAnimationsSidenav: Locator;
    readonly navTutorialsSidenav: Locator;
    readonly navMapsSidenav: Locator;

    readonly linkGitHubDesktop: Locator;
    readonly linkBmacDesktop: Locator;

    readonly linkGitHubSidenav: Locator;
    readonly linkBmacSidenav: Locator;

    readonly changelogLink: Locator;

    constructor(page: Page) {
        this.page = page;

        this.header = page.getByTestId('header');
        this.desktopNav = page.getByTestId('nav');
        this.sidenav = page.locator('mat-sidenav');

        // In mobile branch there is exactly one <button> in the header (the menu toggle).
        // On desktop branch there is no such button in header.
        this.menuButton = this.header.locator('button').first();

        this.navResourcesDesktop = this.desktopNav.getByTestId('resources-link');
        this.navAnimationsDesktop = this.desktopNav.getByTestId('animations-link');
        this.navTutorialsDesktop = this.desktopNav.getByTestId('tutorials-link');
        this.navMapsDesktop = this.desktopNav.getByTestId('maps-link');

        this.navResourcesSidenav = this.sidenav.getByTestId('resources-link');
        this.navAnimationsSidenav = this.sidenav.getByTestId('animations-link');
        this.navTutorialsSidenav = this.sidenav.getByTestId('tutorials-link');
        this.navMapsSidenav = this.sidenav.getByTestId('maps-link');

        // External links - scoped
        // In desktop branch, "external" template is rendered in the header area (outside sidenav).
        // We scope to header to avoid duplicates with sidenav.
        this.linkGitHubDesktop = this.header.getByTestId('github-link');
        this.linkBmacDesktop = this.header.getByTestId('bmac-link');

        this.linkGitHubSidenav = this.sidenav.getByTestId('github-link');
        this.linkBmacSidenav = this.sidenav.getByTestId('bmac-link');

        this.themeToggleDesktop = this.header.getByTestId('theme-toggle');
        this.themeToggleSidenav = this.sidenav.getByTestId('theme-toggle');

        this.changelogLink = page.getByRole('link', {name: /^v/i});
    }

    async goto(): Promise<void> {
        await this.page.goto('/');
        await expect(this.header).toBeVisible();
    }

    async isDarkMode(): Promise<boolean> {
        return await this.page.evaluate(() => document.documentElement.classList.contains('dark'));
    }

    async openSidenav(): Promise<void> {
        await expect(this.menuButton).toBeVisible();
        await this.menuButton.click();

        // Wait until any sidenav link is actually visible/interactable
        await expect(this.navResourcesSidenav).toBeVisible();
    }

    async toggleThemeDesktop(): Promise<void> {
        await this.themeToggleDesktop.click();
    }

    async toggleThemeSidenav(): Promise<void> {
        await this.themeToggleSidenav.click();
    }
}
