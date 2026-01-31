import { test, expect } from '@playwright/test';
import {ChangelogPage} from "./changelog.po";

test.describe('/changelog', () => {
    test('page loads and shows title', async ({ page }) => {
       const changelog = new ChangelogPage(page);

       await changelog.goto();

       await expect(changelog.title).toBeVisible();
       await expect(changelog.title).toHaveText('Changelog');
    });

    test('shows at least one changelog entry', async ({ page }) => {
        const changelog = new ChangelogPage(page);

        await changelog.goto();

        await expect(changelog.list).toBeVisible();
        await expect(changelog.items.first()).toBeVisible();
    });

    test('selects the first changelog entry on load', async ({ page }) => {
       const changelog = new ChangelogPage(page);

       await changelog.goto();

       await expect(changelog.list).toBeVisible();

       const first = changelog.items.first();

       await expect(first).toBeVisible();
       await expect(first).toHaveAttribute('aria-selected', 'true');
    });

    test('shows data of the selected changelog entry', async ({ page }) => {
        const changelog = new ChangelogPage(page);

        await changelog.goto();

        await expect(changelog.list).toBeVisible();

        const first = changelog.items.first();
        const version = await first.getByTestId('entry-version').innerText();

        await expect(first).toBeVisible();
        await expect(changelog.selectedVersionTitle).toContainText(version);
    });
});