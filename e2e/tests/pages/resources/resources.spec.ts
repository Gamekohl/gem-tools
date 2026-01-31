import { test, expect } from '@playwright/test';
import {ResourcesPage} from "./resources.po";

test.describe('/resources', () => {
    test('loads page and shows default state', async ({ page }) => {
        const resources = new ResourcesPage(page);
        await resources.goto();

        await resources.expectShowingAll();

        await expect(resources.tree).toBeVisible();
    });

    test('shows no-results state for non-matching query (>=3 chars)', async ({ page }) => {
        const resources = new ResourcesPage(page);
        await resources.goto();

        await resources.searchFor('__no_resource_should_match__');

        await resources.expectFilteredBy('__no_resource_should_match__');
        await expect(resources.noResults).toBeVisible();
        await expect(resources.noResults).toContainText('No resources match your search.');
    });

    test('clicking a leaf node shows copied snackbar', async ({ page }) => {
        const resources = new ResourcesPage(page);
        await resources.goto();

        await expect(resources.tree).toBeVisible();

        const leafCount = await resources.leafNodes.count();

        if (leafCount === 0) {
            await expect(resources.folderToggleButtons.first()).toBeVisible();
            await resources.folderToggleButtons.first().click();

            await expect(resources.leafNodes.first()).toBeVisible();
        } else {
            await expect(resources.leafNodes.first()).toBeVisible();
        }

        const firstLeaf = resources.leafNodes.first();
        await firstLeaf.click();

        await expect(resources.snackBarText).toContainText('copied to clipboard');
    });

    test('folder toggle expands/collapses (basic)', async ({ page }) => {
        const resources = new ResourcesPage(page);
        await resources.goto();

        const firstFolderToggle = resources.folderToggleButtons.first();
        await expect(firstFolderToggle).toBeVisible();

        await firstFolderToggle.click();
        await firstFolderToggle.click();

        await expect(resources.folderNodes.first()).toBeVisible();
    });
});
