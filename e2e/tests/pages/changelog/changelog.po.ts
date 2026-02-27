import { expect, type Locator, type Page} from "@playwright/test";

export class ChangelogPage {
    readonly page: Page;

    readonly root: Locator;
    readonly title: Locator;

    readonly list: Locator;
    readonly items: Locator;

    readonly selectedVersionTitle: Locator;

    constructor(page: Page) {
        this.page = page;

        this.root = page.getByTestId('container');
        this.title = page.getByTestId('title');

        this.list = page.getByTestId('list');
        this.items = page.getByTestId('entry');

        this.selectedVersionTitle = page.getByTestId('selected-version-title');
    }

    async goto(): Promise<void> {
        await this.page.goto('/changelog');
        await expect(this.root).toBeVisible();
    }
}