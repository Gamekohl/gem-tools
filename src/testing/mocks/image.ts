type ImgOutcome = 'load' | 'error';

export class MockImage {
    static outcomes = new Map<string, ImgOutcome>();

    decoding: string = 'async';
    onload: null | (() => void) = null;
    onerror: null | (() => void) = null;

    set src(url: string) {
        const outcome = MockImage.outcomes.get(url) ?? 'error';
        queueMicrotask(() => {
            if (outcome === 'load') this.onload?.();
            else this.onerror?.();
        });
    }
}