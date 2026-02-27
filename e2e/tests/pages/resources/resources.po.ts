import { expect, type Locator, type Page } from '@playwright/test';

export class ResourcesPage {
    readonly page: Page;

    readonly root: Locator;
    readonly title: Locator;
    readonly search: Locator;
    readonly filterInfo: Locator;

    readonly tree: Locator;
    readonly noResults: Locator;

    readonly leafNodes: Locator;
    readonly folderNodes: Locator;

    readonly folderToggleButtons: Locator;

    readonly snackBarText: Locator;

    constructor(page: Page) {
        this.page = page;

        this.root = page.getByTestId('container');
        this.title = page.getByTestId('title');
        this.search = page.getByTestId('search');
        this.filterInfo = page.getByTestId('filter-info');

        this.tree = page.getByTestId('tree');
        this.noResults = page.getByTestId('no-results');

        this.leafNodes = page.getByTestId('leaf');
        this.folderNodes = page.getByTestId('folder');

        this.folderToggleButtons = page.getByTestId('folder-toggle');

        this.snackBarText = page.locator('.mat-mdc-snack-bar-label .mdc-snackbar__label');
    }

    async goto(): Promise<void> {
        await this.page.goto('/resources');
        await expect(this.root).toBeVisible();
        await expect(this.title).toBeVisible();
        await expect(this.search).toBeVisible();
    }

    async searchFor(query: string): Promise<void> {
        await this.search.fill(query);
    }

    async expectFilteredBy(query: string): Promise<void> {
        await expect(this.filterInfo).toBeVisible();
        await expect(this.filterInfo).toContainText('Filtered by:');
        await expect(this.filterInfo).toContainText(query);
    }

    async expectShowingAll(): Promise<void> {
        await expect(this.filterInfo).toBeVisible();
        await expect(this.filterInfo).toContainText('Showing all resources');
    }
}
