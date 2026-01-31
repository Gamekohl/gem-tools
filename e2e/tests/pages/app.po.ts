import { expect, type Locator, type Page} from "@playwright/test";

export class AppShellPage {
    readonly page: Page;

    readonly header: Locator;
    readonly nav: Locator;

    readonly navResources: Locator;
    readonly navAnimations: Locator;
    readonly navTutorials: Locator;
    readonly navMaps: Locator;

    readonly linkGitHub: Locator;
    readonly linkBmac: Locator;

    readonly themeToggle: Locator;

    readonly linkChangelog: Locator;
    readonly version: Locator;

    constructor(page: Page) {
        this.page = page;

        this.header = page.getByTestId('header');
        this.nav = page.getByTestId('nav');

        this.navResources = page.getByTestId('resources-link');
        this.navAnimations = page.getByTestId('animations-link');
        this.navTutorials = page.getByTestId('tutorials-link');
        this.navMaps = page.getByTestId('maps-link');

        this.linkGitHub = page.getByTestId('github-link');
        this.linkBmac = page.getByTestId('bmac-link');

        this.themeToggle = page.getByTestId('theme-toggle');

        this.linkChangelog = page.getByTestId('changelog-link');
        this.version = page.getByTestId('version');
    }

    async goto(): Promise<void> {
        await this.page.goto('/');
        await expect(this.nav).toBeVisible();
    }

    async isDarkMode(): Promise<boolean> {
        return await this.page.evaluate(() => document.documentElement.classList.contains('dark'));
    }

    async toggleTheme(): Promise<void> {
        await this.themeToggle.click();
    }
}