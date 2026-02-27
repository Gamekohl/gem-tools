import {Locator, Page} from "@playwright/test";

export class TutorialNotFoundPage {
    readonly page: Page;

    readonly title: Locator;

    constructor(page: Page) {
        this.page = page;

        this.title = page.getByTestId('title');
    }

    async goto(): Promise<void> {
        // We intentionally go to a non-existing tutorial here
        await this.page.goto('/tutorials/xxx');
    }
}