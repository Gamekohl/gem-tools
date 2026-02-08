import {MarkedExtension} from 'marked';

export const youtubeExtension: MarkedExtension = {
    extensions: [
        {
            name: 'youtube',
            level: 'block',

            start(src: string) {
                return src.indexOf('@[youtube](');
            },

            tokenizer(src: string) {
                const match = /^@\[(youtube)]\(([^)\n]+)\)\s*(?:\n|$)/.exec(src);
                if (!match) return;

                const url = match[2].trim();
                const id = parseYouTubeId(url);
                if (!id) return;

                return {
                    type: 'youtube',
                    raw: match[0],
                    videoId: id,
                } as any;
            },

            renderer(token: any) {
                return youtubeEmbedHtml(token.videoId);
            },
        },
    ],
};

function youtubeEmbedHtml(videoId: string): string {
    const src = `https://www.youtube-nocookie.com/embed/${videoId}`;
    return `
        <div class="yt-embed" style="margin: 1.25rem 0; aspect-ratio: 16 / 9">
          <iframe
            style="width: 100%; height: 100%; border: 0; border-radius: 12px"
            src="${src}"
            title="YouTube video"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
    `.trim();
}

function parseYouTubeId(input: string): string | null {
    // raw ID
    const expr = /^(?:[a-zA-Z0-9_-]{10}|[a-zA-Z0-9_-]{11}|[a-zA-Z0-9_-]{12})$/
    if (expr.test(input)) return input;

    try {
        const url = new URL(input);
        const host = url.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            const id = url.pathname.split('/').filter(Boolean)[0];
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            const v = url.searchParams.get('v');
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

            const parts = url.pathname.split('/').filter(Boolean);
            const idx = parts.findIndex(p => p === 'embed' || p === 'shorts');
            if (idx >= 0 && parts[idx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[idx + 1])) {
                return parts[idx + 1];
            }
        }
    } catch {
        return null;
    }

    return null;
}
