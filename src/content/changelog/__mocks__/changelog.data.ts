import {buildChangelogEntry} from "@testing/factories/changelog";
import {ChangelogEntry} from "../changelog.data";

export const CHANGELOG: ChangelogEntry[] = [
    buildChangelogEntry(),
    buildChangelogEntry({
        version: '1.0.1',
        date: '2026-01-02',
        title: 'Test Changelog 1',
        markdown: '- Test Bullet Point 1\n',
    })
];