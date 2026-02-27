import {expect, test} from '@playwright/test';
import {TutorialsPage} from "./tutorials.po";

test.describe('/tutorials', () => {
    test('page loads and shows tutorial list', async ({page}) => {
        const tutorials = new TutorialsPage(page);

        await tutorials.goto();

        await expect(tutorials.search).toBeVisible();
        await expect(tutorials.cards.first()).toBeVisible();
        await expect(page.getByText('Intro to GEM')).toBeVisible();
        await expect(page.getByText('Getting started with GEM-Editor.')).toBeVisible();
    });

    test('shows stats and difficulty counts', async ({page}) => {
        const tutorials = new TutorialsPage(page);

        await tutorials.goto();

        await expect(page.getByText('Showing')).toBeVisible();
        await expect(page.getByText(/4\s*\/\s*4/)).toBeVisible();

        await expect(page.getByRole('button', {name: /Beginner/})).toContainText('Beginner 1');
        await expect(page.getByRole('button', {name: /Intermediate/})).toContainText('Intermediate 1');
        await expect(page.getByRole('button', {name: /Advanced/})).toContainText('Advanced 1');
    });

    test('filters by difficulty', async ({page}) => {
        const tutorials = new TutorialsPage(page);

        await tutorials.goto();

        await page.getByRole('button', {name: /Intermediate/}).click();
        await expect(tutorials.cards).toHaveCount(1);
        await expect(page.getByText('Terrain Basics')).toBeVisible();
        await expect(page.getByText(/1\s*\/\s*4/)).toBeVisible();

        await page.getByRole('button', {name: 'All'}).click();
        await expect(tutorials.cards).toHaveCount(4);
    });

    test('shows no matches state for non-existing query', async ({page}) => {
        const tutorials = new TutorialsPage(page);

        await tutorials.goto();

        await tutorials.search.fill('xxx');
        await expect(tutorials.noMatches).toBeVisible();
        await expect(tutorials.cards).toHaveCount(0);
    });

    test('shows paginator when tutorials exist', async ({page}) => {
        const tutorials = new TutorialsPage(page);

        await tutorials.goto();

        await expect(page.locator('mat-paginator')).toBeVisible();
    });
});
