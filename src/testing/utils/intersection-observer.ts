export class MockIntersectionObserver {
    readonly observe = jest.fn();
    readonly unobserve = jest.fn();
    readonly disconnect = jest.fn();

    constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit
    ) {
    }

    trigger(entries: Partial<IntersectionObserverEntry>[]) {
        this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
    }
}
