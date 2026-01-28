export const mockMarked = (activeRenderer: any) => {
    class Renderer {
    }

    const marked = {
        Renderer,
        setOptions: jest.fn((opts: any) => {
            activeRenderer = opts?.renderer;
        }),
        parse: jest.fn((md: string) => {
            const out: string[] = [];
            const lines = md.split(/\r?\n/);

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                if (trimmed.startsWith('## ')) {
                    const text = trimmed.slice(3);
                    out.push(activeRenderer.heading({text, depth: 2}));
                    continue;
                }

                if (trimmed.startsWith('# ')) {
                    const text = trimmed.slice(2);
                    out.push(activeRenderer.heading({text, depth: 1}));
                    continue;
                }

                if (trimmed.startsWith('<')) {
                    out.push(activeRenderer.html(trimmed));
                    continue;
                }

                // Replace only the first markdown link occurrence per line (enough for unit tests).
                const linkMatch =
                    trimmed.match(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);

                if (linkMatch) {
                    const [, text, href, title] = linkMatch;
                    const a = activeRenderer.link({href, title, text});
                    out.push(`<p>${trimmed.replace(linkMatch[0], a)}</p>`);
                    continue;
                }

                out.push(`<p>${trimmed}</p>`);
            }

            return out.join('\n');
        }),
    };

    return {marked};
}