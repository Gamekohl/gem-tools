import {expect, test} from '@playwright/test';
import {TutorialNotFoundPage} from "./tutorial-not-found.po";

test.describe('/tutorial-not-found', () => {
    test('page loads and shows title', async ({page}) => {
        const tutorialNotFound = new TutorialNotFoundPage(page);

        await tutorialNotFound.goto();

        await expect(tutorialNotFound.title).toBeVisible();
        await expect(tutorialNotFound.title).toHaveText('Tutorial not found');
    });
});