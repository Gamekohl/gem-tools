export function buildChangelogEntry(overrides: Partial<{
    version: string;
    date: string;
    title: string;
    markdown: string;
}> = {}) {
    return {
        version: '1.0.0',
        date: '2026-01-01',
        title: 'Test Changelog',
        markdown: '- Test Bullet Point\n',
        ...overrides,
    };
}