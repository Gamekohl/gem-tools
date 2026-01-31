import { expect, type Locator, type Page } from '@playwright/test';

export class AnimationsPage {
    readonly page: Page;

    readonly root: Locator;
    readonly title: Locator;
    readonly search: Locator;

    readonly viewport: Locator;
    readonly items: Locator;

    readonly noResults: Locator;

    readonly snackbarText: Locator;

    readonly filterInfo: Locator;

    constructor(page: Page) {
        this.page = page;
        this.root = page.getByTestId('container');
        this.title = page.getByTestId('title');
        this.search = page.getByTestId('search');

        this.viewport = page.getByTestId('viewport');
        this.items = page.getByTestId('animation-item');

        this.noResults = page.getByTestId('no-results');

        this.snackbarText = page.locator('.mat-mdc-snack-bar-label .mdc-snackbar__label');

        this.filterInfo = page.getByTestId('filter-label');
    }

    async goto(): Promise<void> {
        await this.page.goto('/animations');
        await expect(this.root).toBeVisible();
    }
}
