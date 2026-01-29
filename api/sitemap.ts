import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type TutorialIndexItem = {
    id: string;
    title?: string;
    file?: string;
};

function escapeXml(s: string): string {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    const baseUrl = 'https://gem-tools.vercel.app';

    const staticRoutes = [
        '/',
        '/tutorials',
        '/maps',
        '/animations',
        '/resources',
        '/changelog',
    ];

    let tutorialRoutes: string[] = [];

    try {
        const indexPath = join(process.cwd(), 'src/assets/tutorials/index.json');
        const raw = readFileSync(indexPath, 'utf-8');
        const items = JSON.parse(raw) as TutorialIndexItem[];

        tutorialRoutes = (items ?? [])
            .map((t) => (t?.id ? `/tutorials/${encodeURIComponent(t.id)}` : null))
            .filter((x): x is string => !!x);
    } catch {
        tutorialRoutes = [];
    }

    const urls = [...staticRoutes, ...tutorialRoutes];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls
                .map((p) => `  <url><loc>${escapeXml(baseUrl + p)}</loc></url>`)
                .join('\n')}
    </urlset>`;

    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    res.send(xml);
}
