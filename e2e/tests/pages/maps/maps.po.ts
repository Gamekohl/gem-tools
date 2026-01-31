import {expect, Locator, Page} from "@playwright/test";

export class MapsPage {
    readonly page: Page;

    readonly root: Locator;
    readonly title: Locator;
    readonly search: Locator;

    readonly grid: Locator;
    readonly items: Locator;

    readonly noResults: Locator;

    constructor(page: Page) {
        this.page = page;

        this.root = page.getByTestId('container');
        this.title = page.getByTestId('title');
        this.search = page.getByTestId('search');

        this.grid = page.getByTestId('grid');
        this.items = page.getByTestId('map-item');

        this.noResults = page.getByTestId('no-results');
    }

    async goto(): Promise<void> {
        await this.page.goto('/maps');
        await expect(this.root).toBeVisible();
    }
}