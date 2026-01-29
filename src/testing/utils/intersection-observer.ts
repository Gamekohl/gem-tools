export class MockIntersectionObserver {
    readonly observe = jest.fn();
    readonly unobserve = jest.fn();
    readonly disconnect = jest.fn();

    constructor(public callback: IntersectionObserverCallback) {}

    trigger(entries: Partial<IntersectionObserverEntry>[]) {
        this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
    }
}