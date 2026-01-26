import v000 from './2024-09-12.md';
import v001 from './2026-01-25.md';
import v002 from './2026-01-26.md';

export interface ChangelogEntry {
    version: string;
    date: string;      // ISO
    title: string;
    markdown: string;  // raw md
}

export const CHANGELOG: ChangelogEntry[] = [
    { version: '0.0.2', date: '2026-01-26', title: 'Preview pictures', markdown: v002 },
    { version: '0.0.1', date: '2026-01-25', title: 'Package updates', markdown: v001 },
    { version: '0.0.0', date: '2024-09-12', title: 'Initial setup', markdown: v000 }
];
