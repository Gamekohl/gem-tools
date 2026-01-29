export interface ReadTimeResult {
    minutes: number;
    words: number;
    images: number;
    codeBlocks: number;
}

export interface ReadTimeConfig {
    wordsPerMinute?: number;
    secondsPerImage?: number;
    secondsPerCodeBlock?: number;
    minMinutes?: number;
}

export function estimateReadTimeFromMarkdown(md: string, cfg: ReadTimeConfig = {}): ReadTimeResult {
    const wordsPerMinute = cfg.wordsPerMinute ?? 200; // Average is 238, we set it to 200 to be safe
    const secondsPerImage = cfg.secondsPerImage ?? 12;
    const secondsPerCodeBlock = cfg.secondsPerCodeBlock ?? 20;
    const minMinutes = cfg.minMinutes ?? 1;

    const codeBlocks = (md.match(/```[\s\S]*?```/g) ?? []).length;
    const mdWithoutCode = md.replace(/```[\s\S]*?```/g, ' ');

    const images = (mdWithoutCode.match(/!\[[^\]]*]\([^)]+\)/g) ?? []).length;

    let text = mdWithoutCode.replace(/\[([^\]]+)]\([^)]+\)/g, '$1');

    text = text.replace(/!\[[^\]]*]\([^)]+\)/g, ' ');

    text = text
        .replace(/[#>*_`~=-]/g, ' ')
        .replace(/<\/?[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const words = text ? text.split(' ').length : 0;

    const baseSeconds = (words / wordsPerMinute) * 60;
    const extraSeconds = images * secondsPerImage + codeBlocks * secondsPerCodeBlock;

    const minutes = Math.max(minMinutes, Math.round((baseSeconds + extraSeconds) / 60));

    return { minutes, words, images, codeBlocks };
}
