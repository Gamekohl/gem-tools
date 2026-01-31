import { test, expect } from '@playwright/test';
import {AppShellPage} from "./app.po";

test.describe('/', () => {
    test('renders header and navigation', async ({ page }) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        await expect(shell.navResources).toBeVisible();
        await expect(shell.navAnimations).toBeVisible();
        await expect(shell.navTutorials).toBeVisible();
        await expect(shell.navMaps).toBeVisible();
    });

    test('navigates via header links', async ({ page }) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        await shell.navAnimations.click();
        await expect(page).toHaveURL(/\/animations$/);

        await shell.navTutorials.click();
        await expect(page).toHaveURL(/\/tutorials$/);

        await shell.navMaps.click();
        await expect(page).toHaveURL(/\/maps$/);

        await shell.navResources.click();
        await expect(page).toHaveURL(/\/resources$/);
    });

    test('has external links and changelog version', async ({ page }) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        await expect(shell.linkGitHub).toHaveAttribute('href', 'https://github.com/Gamekohl');
        await expect(shell.linkGitHub).toHaveAttribute('target', '_blank');

        await expect(shell.linkBmac).toHaveAttribute('href', 'https://buymeacoffee.com/gamekohl');
        await expect(shell.linkBmac).toHaveAttribute('target', '_blank');

        // Version is dynamic, but should start with "v"
        await expect(shell.version).toContainText(/^v/);

        await shell.linkChangelog.click();
        await expect(page).toHaveURL(/\/changelog$/);
    });

    test('toggles dark mode on html element', async ({ page }) => {
        const shell = new AppShellPage(page);

        await shell.goto();
        await expect(shell.themeToggle).toBeVisible();

        const before = await shell.isDarkMode();

        await shell.toggleTheme();

        await expect.poll(() => shell.isDarkMode()).not.toBe(before);

        await shell.toggleTheme();
        await expect.poll(() => shell.isDarkMode()).toBe(before);
    });
});