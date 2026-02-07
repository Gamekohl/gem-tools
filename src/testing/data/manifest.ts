import {Difficulty, ManifestItem, TutorialManifest} from "../../app/pages/tutorials/services/tutorial-manifest.service";

export const tutorialManifestMock = {
    getItemWithoutDifficulty: (): ManifestItem => tutorialManifestMock.items[3],
    getItem: (idx: number): ManifestItem => {
        if (idx < 0 || idx >= tutorialManifestMock.items.length)
            throw new Error(`Invalid index ${idx} in getItem(idx)`);

        return tutorialManifestMock.items[idx];
    },
    items: [
        {
            author: 'Alice',
            id: 'intro',
            title: 'Intro to GEM',
            subtitle: 'Basics',
            difficulty: Difficulty.Beginner,
            tags: ['start', 'overview'],
            file: 'intro.md',
            featured: false,
        },
        {
            author: 'Bob',
            id: 'ai',
            title: 'AI Scripting',
            subtitle: 'Triggers and logic',
            difficulty: Difficulty.Intermediate,
            tags: ['scripting', 'logic'],
            file: 'ai.md',
            featured: false,
        },
        {
            author: 'Cara',
            id: 'perf',
            title: 'Performance',
            subtitle: 'Optimizations',
            difficulty: Difficulty.Advanced,
            tags: ['performance'],
            file: 'perf.md',
            featured: false,
        },
        {
            author: 'Dan',
            id: 'nodiff',
            title: 'No Difficulty',
            subtitle: 'No diff set',
            // difficulty omitted
            tags: ['misc'],
            file: 'no.md',
            featured: false,
        },
        {
            author: 'James',
            id: 'featured',
            title: 'Featured Tutorial',
            subtitle: 'Featured Tutorial',
            difficulty: Difficulty.Beginner,
            tags: ['featured'],
            file: 'featured.md',
            featured: true
        }
    ] satisfies TutorialManifest
}