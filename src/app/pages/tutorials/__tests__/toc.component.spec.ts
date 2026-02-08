import {PLATFORM_ID} from "@angular/core";
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from "@angular/router";
import {MockIntersectionObserver} from "@testing/utils/intersection-observer";
import {of} from "rxjs";
import {TutorialSection} from "../services/tutorial-content.service";
import {TocComponent} from '../tutorial/toc/toc.component';

const spyOn = jest.spyOn;

const mockToc: TutorialSection[] = [
    {
        id: 'heading',
        level: 2,
        title: 'Heading',
        children: [
            {
                id: 'subheading',
                title: 'Subheading',
                level: 3
            }
        ]
    }
];

describe('TocComponent (browser)', () => {
    let component: TocComponent;
    let fixture: ComponentFixture<TocComponent>;
    let createdIO: MockIntersectionObserver | undefined;

    const setupComponent = (tocData: TutorialSection[] = mockToc, activeSectionId: string = '') => {
        fixture = TestBed.createComponent(TocComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('toc', tocData);
        fixture.componentRef.setInput('activeSectionId', activeSectionId);
    }

    const setupDomElements = (ids: string[]) => {
        ids.forEach(id => {
            const el = document.createElement('div');
            el.id = id;
            document.body.appendChild(el);
        });
    };

    const cleanupDomElements = (ids: string[]) => {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    };

    const initObserver = () => {
        setupDomElements(['heading', 'subheading']);

        (component as any).setupIntersectionObserver(mockToc);

        expect(createdIO).toBeDefined();
        return createdIO!;
    };

    const createObserver = () => {
        (component as any).setupIntersectionObserver([
            {id: 'heading', title: 'Heading', level: 2},
        ]);
        fixture.detectChanges();

        expect(createdIO).toBeDefined();
        return createdIO!;
    };

    beforeEach(async () => {
        createdIO = undefined;

        (globalThis as any).IntersectionObserver = jest
            .fn()
            .mockImplementation((cb: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
                createdIO = new MockIntersectionObserver(cb, options);
                return createdIO;
            });

        await TestBed.configureTestingModule({
            imports: [TocComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        fragment: of('heading')
                    } satisfies Partial<ActivatedRoute>,
                },
            ]
        })
            .compileComponents();

        setupComponent();
    });

    afterEach(() => cleanupDomElements(['heading']));

    it('creates IO with correct options', () => {
        const io = initObserver();

        expect(io.options).toEqual(
            expect.objectContaining({
                threshold: [0.2, 0.4, 0.7],
                rootMargin: '-20% 0px -70% 0px',
            }),
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call disconnectObserver and setupIntersectionObserver', () => {
        const disconnectSpy = spyOn(component as any, 'disconnectObserver');
        const setupSpy = spyOn(component as any, 'setupIntersectionObserver');

        fixture.detectChanges();
        setupComponent();
        fixture.detectChanges();

        expect(disconnectSpy).toHaveBeenCalled();
        expect(setupSpy).toHaveBeenCalledWith(mockToc);
    });

    it('should not call setupIntersectionObserver', () => {
        const setupSpy = spyOn(component as any, 'setupIntersectionObserver');

        setupComponent([]);
        fixture.detectChanges();

        expect(setupSpy).not.toHaveBeenCalled();
    });

    it('should set scrollBehavior', () => {
        setupComponent();
        fixture.detectChanges();

        expect(component['scrollBehavior']()).toEqual('smooth');

        spyOn(window, 'matchMedia').mockReturnValue({
            matches: true
        } as any);

        setupComponent();
        fixture.detectChanges();

        expect(component['scrollBehavior']()).toEqual('instant');
    });

    it('should call scrollToSection and invoke scrollIntoView', () => {
        setupDomElements(['heading']);

        fixture.detectChanges();
        setupComponent();
        fixture.detectChanges();

        expect(component.activeSectionId()).toEqual('heading');
    });

    it('sets activeSectionId to the visible entry with smallest boundingClientRect.top', () => {
        const io = initObserver();

        component.activeSectionId.set('');

        const heading = document.getElementById('heading')!;
        const subheading = document.getElementById('subheading')!;

        io.trigger([
            {
                isIntersecting: true,
                target: heading,
                boundingClientRect: {top: 120} as any,
            },
            {
                isIntersecting: true,
                target: subheading,
                boundingClientRect: {top: 20} as any,
            },
        ]);

        expect(component.activeSectionId()).toBe('subheading');
    });

    it('ignores non-intersecting entries', () => {
        const io = initObserver();

        component.activeSectionId.set('');

        const heading = document.getElementById('heading')!;
        const subheading = document.getElementById('subheading')!;

        io.trigger([
            {
                isIntersecting: false,
                target: subheading,
                boundingClientRect: {top: 0} as any,
            },
            {
                isIntersecting: true,
                target: heading,
                boundingClientRect: {top: 50} as any,
            },
        ]);

        expect(component.activeSectionId()).toBe('heading');
    });

    it('does not change activeSectionId when no entries are intersecting', () => {
        const io = initObserver();

        component.activeSectionId.set('heading');

        const subheading = document.getElementById('subheading')!;

        io.trigger([
            {
                isIntersecting: false,
                target: subheading,
                boundingClientRect: {top: 10} as any,
            },
        ]);

        expect(component.activeSectionId()).toBe('heading');
    });

    it('does not set activeSectionId if chosen element has no id', () => {
        const io = initObserver();

        component.activeSectionId.set('heading');

        const noIdEl = document.createElement('div');
        document.body.appendChild(noIdEl);

        io.trigger([
            {
                isIntersecting: true,
                target: noIdEl,
                boundingClientRect: {top: 0} as any,
            },
        ]);

        expect(component.activeSectionId()).toBe('heading');

        noIdEl.remove();
    });

    it('treats missing boundingClientRect.top as 0 (stable sort behavior)', () => {
        const io = initObserver();

        component.activeSectionId.set('');

        const heading = document.getElementById('heading')!;
        const subheading = document.getElementById('subheading')!;

        io.trigger([
            {
                isIntersecting: true,
                target: heading,
                boundingClientRect: {} as any,
            },
            {
                isIntersecting: true,
                target: subheading,
                boundingClientRect: {top: 10} as any,
            },
        ]);

        expect(component.activeSectionId()).toBe('heading');
    });

    it('disconnects observer and clears reference', () => {
        const io = createObserver();
        const disconnectSpy = jest.spyOn(io, 'disconnect');

        (component as any).disconnectObserver();

        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        expect((component as any).io).toBeNull();
    });

    it('does nothing when observer is already null', () => {
        (component as any).io = null;

        expect(() => {
            (component as any).disconnectObserver();
        }).not.toThrow();
    });

    it('disconnects only once even if called multiple times', () => {
        const io = createObserver();
        const disconnectSpy = jest.spyOn(io, 'disconnect');

        (component as any).disconnectObserver();
        (component as any).disconnectObserver();

        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        expect((component as any).io).toBeNull();
    });
});

describe('TocComponent (server)', () => {
    let component: TocComponent;
    let fixture: ComponentFixture<TocComponent>;

    const setupComponent = (tocData: TutorialSection[] = mockToc, activeSectionId: string = '') => {
        fixture = TestBed.createComponent(TocComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('toc', tocData);
        fixture.componentRef.setInput('activeSectionId', activeSectionId);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TocComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        fragment: of('heading')
                    } satisfies Partial<ActivatedRoute>,
                },
                {provide: PLATFORM_ID, useValue: 'sever'}
            ]
        })
            .compileComponents();

        setupComponent();
    });

    it('should not call setupIntersectionObserver', () => {
        const setupSpy = spyOn(component as any, 'setupIntersectionObserver');

        setupComponent();
        fixture.detectChanges();

        expect(setupSpy).not.toHaveBeenCalled();
    });

    it('should not set scrollBehavior', () => {
        const spy = spyOn(component['scrollBehavior'], 'set');

        fixture.detectChanges();

        expect(spy).not.toHaveBeenCalled();
    });
});