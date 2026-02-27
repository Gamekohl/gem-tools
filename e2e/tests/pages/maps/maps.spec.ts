import { test, expect } from '@playwright/test';
import {MapsPage} from "./maps.po";

test.describe( '/maps', () => {
    test('page loads and shows title and search', async ({ page }) => {
       const maps = new MapsPage(page);

       await maps.goto();

       await expect(maps.title).toHaveText('Maps');
       await expect(maps.search).toBeVisible();
    });

    test('shows at least one map entry', async ({ page }) => {
       const maps = new MapsPage(page);

       await maps.goto();

       await expect(maps.grid).toBeVisible();
       await expect(maps.items.first()).toBeVisible();
    });

    test('shows no matches state for non-existing query', async ({ page }) => {
       const maps = new MapsPage(page);

       await maps.goto();

       await expect(maps.search).toBeVisible();
       await maps.search.fill('xxx');

       await expect(maps.noResults).toBeVisible();
       await expect(maps.items).toHaveCount(0);
       await expect(maps.noResults).toContainText('No maps match your search.');
    });

    test('shows multiple items based on search query', async ({ page }) => {
       const maps = new MapsPage(page);

       await maps.goto();

       await expect(maps.search).toBeVisible();
       await maps.search.fill('1939');

       await expect(maps.items).toHaveCount(2);
    });
});