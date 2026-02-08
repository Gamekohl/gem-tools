import {Difficulty, ManifestItem} from "../../app/pages/tutorials/services/tutorial-manifest.service";

export class MockTutorialManifest {
    private readonly _items: ManifestItem[] = [
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
    ];
    get itemWithoutDifficulty(): ManifestItem {
        return this._items[3];
    }
    get items(): ManifestItem[] {
        return this._items;
    }
    getItem(idx: number): ManifestItem {
        if (idx < 0 || idx >= this._items.length)
            throw new Error(`Invalid index ${idx} in getItem(idx)`);

        return this._items[idx];
    }
}