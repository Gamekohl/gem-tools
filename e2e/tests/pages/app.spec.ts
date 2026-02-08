import {expect, test} from '@playwright/test';
import {AppShellPage} from './app.po';

test.describe('AppShell - Desktop', () => {
    test.use({viewport: {width: 1280, height: 720}});

    test('renders header and desktop navigation', async ({page}) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        await expect(shell.desktopNav).toBeVisible();

        await expect(shell.navResourcesDesktop).toBeVisible();
        await expect(shell.navAnimationsDesktop).toBeVisible();
        await expect(shell.navTutorialsDesktop).toBeVisible();
        await expect(shell.navMapsDesktop).toBeVisible();
    });

    test('navigates via desktop header links', async ({page}) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        await shell.navAnimationsDesktop.click();
        await expect(page).toHaveURL(/\/animations$/);

        await shell.navTutorialsDesktop.click();
        await expect(page).toHaveURL(/\/tutorials$/);

        await shell.navMapsDesktop.click();
        await expect(page).toHaveURL(/\/maps$/);

        await shell.navResourcesDesktop.click();
        await expect(page).toHaveURL(/\/resources$/);
    });

    test('has external links and changelog version', async ({ page }) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        await expect(shell.linkGitHubDesktop).toHaveAttribute('href', 'https://github.com/Gamekohl');
        await expect(shell.linkGitHubDesktop).toHaveAttribute('target', '_blank');

        await expect(shell.linkBmacDesktop).toHaveAttribute('href', 'https://buymeacoffee.com/gamekohl');
        await expect(shell.linkBmacDesktop).toHaveAttribute('target', '_blank');

        // Changelog link text is "v{version}" (dynamic). Just assert it exists and navigates.
        await expect(shell.changelogLink).toBeVisible();
        await expect(shell.changelogLink).toHaveAttribute('title', 'Changelog');

        await shell.changelogLink.click();
        await expect(page).toHaveURL(/\/changelog$/);
    });

    test('toggles dark mode (desktop theme toggle)', async ({page}) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        await expect(shell.themeToggleDesktop).toBeVisible();

        const before = await shell.isDarkMode();
        await shell.toggleThemeDesktop();
        await expect.poll(() => shell.isDarkMode()).not.toBe(before);

        await shell.toggleThemeDesktop();
        await expect.poll(() => shell.isDarkMode()).toBe(before);
    });
});

test.describe('AppShell - Mobile (sidenav)', () => {
    test.use({viewport: {width: 390, height: 844}}); // iPhone 12-ish

    test('opens sidenav and shows navigation links', async ({page}) => {
        const shell = new AppShellPage(page);
        await shell.goto();

        // On mobile, desktop nav should not exist
        await expect(shell.desktopNav).toHaveCount(0);

        await shell.openSidenav();

        await expect(shell.navResourcesSidenav).toBeVisible();
        await expect(shell.navAnimationsSidenav).toBeVisible();
        await expect(shell.navTutorialsSidenav).toBeVisible();
        await expect(shell.navMapsSidenav).toBeVisible();
    });

    test('navigates via sidenav links', async ({page}) => {
        const shell = new AppShellPage(page);
        await shell.goto();
        await shell.openSidenav();

        await shell.navAnimationsSidenav.click();
        await expect(page).toHaveURL(/\/animations$/);

        await shell.openSidenav();
        await shell.navTutorialsSidenav.click();
        await expect(page).toHaveURL(/\/tutorials$/);

        await shell.openSidenav();
        await shell.navMapsSidenav.click();
        await expect(page).toHaveURL(/\/maps$/);

        await shell.openSidenav();
        await shell.navResourcesSidenav.click();
        await expect(page).toHaveURL(/\/resources$/);
    });

    test('toggles dark mode (sidenav theme toggle)', async ({page}) => {
        const shell = new AppShellPage(page);
        await shell.goto();
        await shell.openSidenav();

        await expect(shell.themeToggleSidenav).toBeVisible();

        const before = await shell.isDarkMode();
        await shell.toggleThemeSidenav();
        await expect.poll(() => shell.isDarkMode()).not.toBe(before);

        await shell.toggleThemeSidenav();
        await expect.poll(() => shell.isDarkMode()).toBe(before);
    });
});
