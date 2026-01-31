import v000 from './0.0.0.md';
import v001 from './0.0.1.md';
import v002 from './0.0.2.md';
import v003 from './0.0.3.md';
import v100 from './1.0.0.md';
import v110 from './1.1.0.md';
import v111 from './1.1.1.md';
import v112 from './1.1.2.md';
import v113 from './1.1.3.md';

export interface ChangelogEntry {
    version: string;
    date: string;      // ISO
    title: string;
    markdown: string;  // raw md
}

export const CHANGELOG: ChangelogEntry[] = [
    { version: '1.1.3', date: '2026-01-31', title: 'Package Updates', markdown: v113 },
    { version: '1.1.2', date: '2026-01-30', title: 'Build', markdown: v112 },
    { version: '1.1.1', date: '2026-01-30', title: 'Added GSF', markdown: v111 },
    { version: '1.0.1', date: '2026-01-30', title: 'Fixes and Package Updates', markdown: v110 },
    { version: '1.0.0', date: '2026-01-29', title: 'Maps and Tutorials', markdown: v100 },
    { version: '0.0.3', date: '2026-01-27', title: 'Data Update', markdown: v003 },
    { version: '0.0.2', date: '2026-01-26', title: 'Preview Pictures', markdown: v002 },
    { version: '0.0.1', date: '2026-01-25', title: 'Package Updates', markdown: v001 },
    { version: '0.0.0', date: '2024-09-12', title: 'Initial Setup', markdown: v000 },
];
