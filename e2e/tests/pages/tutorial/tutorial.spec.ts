import {expect, test} from '@playwright/test';
import {TutorialPage} from "./tutorial.po";

test.describe('/tutorials/:id', () => {
    test('renders intro tutorial content and toc', async ({page}) => {
        const tutorial = new TutorialPage(page);

        await tutorial.goto('intro');

        await expect(tutorial.title).toHaveText('Intro to GEM');
        await expect(tutorial.subtitle).toHaveText('Getting started with GEM-Editor.');
        await expect(page.getByText('Beginner', {exact: true})).toBeVisible();
        await expect(tutorial.readTime).toBeVisible();

        await expect(tutorial.article.getByRole('heading', {name: 'Intro to GEM', level: 1})).toBeVisible();
        await expect(tutorial.article.getByRole('heading', {name: 'First steps', level: 2})).toBeVisible();
        await expect(tutorial.article.getByRole('heading', {name: 'Publish your work', level: 2})).toBeVisible();

        await expect(tutorial.tocHeader).toBeVisible();
    });

    test('has back link and edit on GitHub link', async ({page}) => {
        const tutorial = new TutorialPage(page);

        await tutorial.goto('intro');

        await expect(tutorial.editLink).toHaveAttribute(
            'href',
            'https://github.com/Gamekohl/gem-tools/blob/main/src/assets/tutorials/intro.md'
        );
        await expect(tutorial.editLink).toHaveAttribute('target', '_blank');

        await tutorial.backLink.click();
        await expect(page).toHaveURL(/\/tutorials$/);
    });

    test('shows empty toc for pages without sections', async ({page}) => {
        const tutorial = new TutorialPage(page);

        await tutorial.goto('quick-notes');

        await expect(tutorial.title).toHaveText('Quick Notes');
        await expect(tutorial.readTime).toBeVisible();

        await expect(page.getByText('Beginner', {exact: true})).toHaveCount(0);
        await expect(page.getByText('Intermediate', {exact: true})).toHaveCount(0);
        await expect(page.getByText('Advanced', {exact: true})).toHaveCount(0);
    });

    /*test('clicking toc items scrolls to sections and marks them active', async ({page}) => {
        const tutorial = new TutorialPage(page);

        await tutorial.goto('intro');

        const firstSteps = page.getByRole('button', {name: 'First steps'});
        const publish = page.getByRole('button', {name: 'Publish your work'});

        await publish.click();
        await expect(publish).toHaveClass(/font-medium/);
        await expect(tutorial.article.getByRole('heading', {name: 'Publish your work', level: 2})).toBeInViewport();

        await firstSteps.click();
        await expect(firstSteps).toHaveClass(/font-medium/);
        await expect(tutorial.article.getByRole('heading', {name: 'First steps', level: 2})).toBeInViewport();
    });*/
});
