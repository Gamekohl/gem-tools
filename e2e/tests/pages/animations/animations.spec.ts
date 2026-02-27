import { test, expect } from '@playwright/test';
import { AnimationsPage } from './animations.po';

test.describe('/animations', () => {
    test('page loads and shows title and search', async ({ page }) => {
        const animations = new AnimationsPage(page);

        await animations.goto();

        await expect(animations.title).toHaveText('Animations');
        await expect(animations.search).toBeVisible();
    });

    test('shows at least one animation entry', async ({ page }) => {
        const animations = new AnimationsPage(page);

        await animations.goto();

        await expect(animations.viewport).toBeVisible();
        await expect(animations.items.first()).toBeVisible();
    });

    test('shows no matches state for non-existing query', async ({ page }) => {
       const animations = new AnimationsPage(page);

       await animations.goto();

       await animations.search.fill('xxx');

       await expect(animations.noResults).toBeVisible();
       await expect(animations.items).toHaveCount(0);
       await expect(animations.noResults).toHaveText('No animations match your search.');
    });

    test('clicking an item shows a snackbar containing the animation name', async ({ page }) => {
        const animations = new AnimationsPage(page);

        await animations.goto();

        const first = animations.items.first();
        const label = (await first.innerText()).trim();

        await first.click();

        await expect(animations.snackbarText).toContainText(`"${label}" copied to clipboard`);
    });

    test('search filters list and shows filter info', async ({ page }) => {
        const animations = new AnimationsPage(page);

        await animations.goto();

        await expect(animations.filterInfo).toHaveText('Showing all animations');

        const first = animations.items.first();

        const label = (await first.innerText()).trim();
        expect(label.length).toBeGreaterThan(0);

        await animations.search.fill(label);

        await expect(animations.filterInfo).toHaveText(`Filtered by: ${label}`);

        await expect(animations.items).toHaveCount(1);
        await expect(animations.items.first()).toBeVisible();
    });

    test('shows multiple items based on search query', async ({ page }) => {
       const animations = new AnimationsPage(page);

       await animations.goto();

       await animations.search.fill('AAgun_61k_charg');

       await expect(animations.items).toHaveCount(3);
    });
});
