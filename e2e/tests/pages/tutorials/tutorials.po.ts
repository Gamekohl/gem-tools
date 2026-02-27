import {expect, Locator, Page} from "@playwright/test";

export class TutorialsPage {
    readonly page: Page;

    readonly title: Locator;
    readonly search: Locator;
    readonly cards: Locator;
    readonly noMatches: Locator;

    constructor(page: Page) {
        this.page = page;

        this.title = page.getByRole('heading', {name: 'Tutorials'});
        this.search = page.getByLabel('Search tutorials');
        this.cards = page.locator('app-tutorial-card');
        this.noMatches = page.getByText('No matches');
    }

    async goto(): Promise<void> {
        await this.page.goto('/tutorials');
        await expect(this.title).toBeVisible();
    }
}
