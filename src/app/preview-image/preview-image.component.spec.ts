import { TestBed } from '@angular/core/testing';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import {makeAnchor} from "../../testing/utils/make-anchor";
import { PreviewImageComponent } from './preview-image.component';

type ImgOutcome = 'load' | 'error';

class MockImage {
  static outcomes = new Map<string, ImgOutcome>();

  decoding: string = 'async';
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;

  set src(url: string) {
    // simulate async image load
    const outcome = MockImage.outcomes.get(url) ?? 'error';
    queueMicrotask(() => {
      if (outcome === 'load') this.onload?.();
      else this.onerror?.();
    });
  }
}

describe('PreviewImageComponent', () => {
  let overlayRefMock: jest.Mocked<Partial<OverlayRef>>;
  let overlayMock: jest.Mocked<Overlay>;

  beforeAll(() => {
    global.Image = MockImage as any;
  });

  beforeEach(async () => {
    const positionStrategyMock = {
      withPositions: jest.fn().mockReturnThis(),
      withFlexibleDimensions: jest.fn().mockReturnThis(),
      withPush: jest.fn().mockReturnThis(),
    };

    const positionBuilderMock = {
      flexibleConnectedTo: jest.fn().mockReturnValue(positionStrategyMock),
    };

    overlayRefMock = {
      attach: jest.fn(),
      detach: jest.fn(),
      dispose: jest.fn(),
      hasAttached: jest.fn().mockReturnValue(false),
      getConfig: jest.fn().mockReturnValue({
        positionStrategy: {
          setOrigin: jest.fn(),
        },
      }),
    };

    overlayMock = {
      create: jest.fn().mockReturnValue(overlayRefMock),
      position: jest.fn().mockReturnValue(positionBuilderMock as any),
      scrollStrategies: {
        reposition: jest.fn(),
        close: jest.fn(),
        block: jest.fn(),
        noop: jest.fn(),
      } as any,
    } as any;

    await TestBed.configureTestingModule({
      imports: [PreviewImageComponent],
      providers: [{ provide: Overlay, useValue: overlayMock }],
    })
        .compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PreviewImageComponent);
    fixture.componentRef.setInput('resolveUrl', () => null);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should does nothing if resolveUrl returns null/undefined', () => {
    const fixture = TestBed.createComponent(PreviewImageComponent);
    fixture.componentRef.setInput('resolveUrl', () => null);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.open(makeAnchor(), {} as any);

    expect(overlayMock.create).not.toHaveBeenCalled();
    expect(comp.url()).toBeNull();
  });

  it('should does not open overlay if preload fails (and caches failure)', async () => {
    const fixture = TestBed.createComponent(PreviewImageComponent);
    fixture.componentRef.setInput('resolveUrl', () => '/x.webp');
    fixture.detectChanges();

    // preload should fail
    MockImage.outcomes.set('/assets/x.webp', 'error');

    const comp = fixture.componentInstance;
    comp.open(makeAnchor(), {} as any);

    // let microtasks run (image onerror)
    await Promise.resolve();

    expect(overlayMock.create).not.toHaveBeenCalled();
    expect(comp.url()).toBeNull();

    // second open should return immediately due to cached false
    comp.open(makeAnchor(), {} as any);
    expect(overlayMock.create).not.toHaveBeenCalled();
  });

  it('should open overlay after successful preload and attaches portal', async () => {
    const fixture = TestBed.createComponent(PreviewImageComponent);
    fixture.componentRef.setInput('resolveUrl', () => '/ok.webp');
    fixture.detectChanges();

    MockImage.outcomes.set('/assets/ok.webp', 'load');

    const comp = fixture.componentInstance;
    const anchor = makeAnchor();

    comp.open(anchor, {} as any);

    await Promise.resolve(); // image onload

    expect(overlayMock.create).toHaveBeenCalledTimes(1);
    expect(overlayRefMock.attach).toHaveBeenCalledTimes(1);
    expect(comp.url()).toBe('/ok.webp');

    // position builder chain used
    expect(overlayMock.position).toHaveBeenCalled();
  });

  it('should does not open overlay if request becomes stale (close before preload resolves)', async () => {
    const fixture = TestBed.createComponent(PreviewImageComponent);
    fixture.componentRef.setInput('resolveUrl', () => '/slow.webp');
    fixture.detectChanges();

    // Simulate success, but we will close before microtask runs
    MockImage.outcomes.set('/assets/slow.webp', 'load');

    const comp = fixture.componentInstance;
    comp.open(makeAnchor(), {} as any);

    // invalidate request
    comp.close();

    await Promise.resolve(); // image onload resolves promise

    expect(overlayMock.create).not.toHaveBeenCalled();
    expect(overlayRefMock.attach).not.toHaveBeenCalled();
    expect(comp.url()).toBeNull();
  });

  it('should close() detaches + disposes overlay and clears url', async () => {
    const fixture = TestBed.createComponent(PreviewImageComponent);
    fixture.componentRef.setInput('resolveUrl', () => '/ok2.webp');
    fixture.detectChanges();

    MockImage.outcomes.set('/assets/ok2.webp', 'load');

    const comp = fixture.componentInstance;
    comp.open(makeAnchor(), {} as any);
    await Promise.resolve();

    expect(overlayMock.create).toHaveBeenCalledTimes(1);
    expect(comp.url()).toBe('/ok2.webp');

    comp.close();

    expect(overlayRefMock.detach).toHaveBeenCalledTimes(1);
    expect(overlayRefMock.dispose).toHaveBeenCalledTimes(1);
    expect(comp.url()).toBeNull();
  });

  it('should onImgError() marks url as missing (cached false) and closes', async () => {
    const fixture = TestBed.createComponent(PreviewImageComponent);
    fixture.componentRef.setInput('resolveUrl', () => '/will-error.webp');
    fixture.detectChanges();

    // First: preload ok so it opens
    MockImage.outcomes.set('/assets/will-error.webp', 'load');

    const comp = fixture.componentInstance;
    comp.open(makeAnchor(), {} as any);
    await Promise.resolve();

    expect(overlayMock.create).toHaveBeenCalledTimes(1);
    expect(comp.url()).toBe('/will-error.webp');

    // Simulate runtime error event in <img>
    comp.onImgError();

    expect(comp.url()).toBeNull();
    expect(overlayRefMock.detach).toHaveBeenCalled();
    expect(overlayRefMock.dispose).toHaveBeenCalled();

    // Now: try opening again; should do nothing because cached false
    // (we can't access private cache, so we assert overlay.create not called again)
    comp.open(makeAnchor(), {} as any);
    expect(overlayMock.create).toHaveBeenCalledTimes(1);
  });
});
