import v000 from './2024-09-12.md';
import v001 from './2026-01-25.md';
import v002 from './2026-01-26.md';
import v003 from './2026-01-27.md';
import v004 from './2026-01-29.md';

export interface ChangelogEntry {
    version: string;
    date: string;      // ISO
    title: string;
    markdown: string;  // raw md
}

export const CHANGELOG: ChangelogEntry[] = [
    { version: '0.0.4', date: '2026-01-27', title: 'Package Update', markdown: v004 },
    { version: '0.0.3', date: '2026-01-27', title: 'Data Update', markdown: v003 },
    { version: '0.0.2', date: '2026-01-26', title: 'Preview Pictures', markdown: v002 },
    { version: '0.0.1', date: '2026-01-25', title: 'Package Updates', markdown: v001 },
    { version: '0.0.0', date: '2024-09-12', title: 'Initial Setup', markdown: v000 },
];
