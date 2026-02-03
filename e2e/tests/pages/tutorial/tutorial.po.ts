import {expect, Locator, Page} from "@playwright/test";

export class TutorialPage {
    readonly page: Page;

    readonly backLink: Locator;
    readonly editLink: Locator;
    readonly title: Locator;
    readonly subtitle: Locator;
    readonly readTime: Locator;
    readonly tocHeader: Locator;
    readonly tocButtons: Locator;
    readonly article: Locator;

    constructor(page: Page) {
        this.page = page;

        this.backLink = page.getByRole('button', {name: 'Back to Tutorials'});
        this.editLink = page.getByRole('link', {name: 'Edit on GitHub'});
        this.title = page.locator('main h1').first();
        this.subtitle = page.locator('main p').first();
        this.readTime = page.getByText(/~\d+ min/);
        this.tocHeader = page.getByText('On this page');
        this.tocButtons = page.locator('aside button');
        this.article = page.locator('article');
    }

    async goto(id: string): Promise<void> {
        await this.page.goto(`/tutorials/${id}`);
        await expect(this.title).toBeVisible();
    }
}
