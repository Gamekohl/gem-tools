import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MockImage } from '@testing/mocks/image';
import { createComponent } from '@testing/utils/testbed';
import { makeAnchor } from '../../testing/utils/make-anchor';
import { PreviewImageComponent } from './preview-image.component';

describe('PreviewImageComponent', () => {
  let overlayRefMock: jest.Mocked<Partial<OverlayRef>>;
  let overlayMock: jest.Mocked<Overlay>;
  let setupComponent: (resolveUrl: () => string | null) => Promise<{
    fixture: any;
    component: PreviewImageComponent;
  }>;

  beforeAll(() => {
    global.Image = MockImage as any;
  });

  beforeEach(() => {
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

    setupComponent = async (resolveUrl) => {
      const result = await createComponent(PreviewImageComponent, {
        imports: [PreviewImageComponent],
        providers: [{ provide: Overlay, useValue: overlayMock }],
        detectChanges: false,
      });
      result.fixture.componentRef.setInput('resolveUrl', resolveUrl);
      result.fixture.detectChanges();
      return result;
    };
  });

  it('should create', async () => {
    const { component } = await setupComponent(() => null);
    expect(component).toBeTruthy();
  });

  it('should does nothing if resolveUrl returns null/undefined', async () => {
    const { component } = await setupComponent(() => null);
    component.open(makeAnchor(), {} as any);

    expect(overlayMock.create).not.toHaveBeenCalled();
    expect(component.url()).toBeNull();
  });

  it('should does not open overlay if preload fails (and caches failure)', async () => {
    const { component } = await setupComponent(() => '/x.webp');

    // preload should fail
    MockImage.outcomes.set('/assets/x.webp', 'error');

    component.open(makeAnchor(), {} as any);

    // let microtasks run (image onerror)
    await Promise.resolve();

    expect(overlayMock.create).not.toHaveBeenCalled();
    expect(component.url()).toBeNull();

    // second open should return immediately due to cached false
    component.open(makeAnchor(), {} as any);
    expect(overlayMock.create).not.toHaveBeenCalled();
  });

  it('should open overlay after successful preload and attaches portal', async () => {
    const { component } = await setupComponent(() => '/ok.webp');

    MockImage.outcomes.set('/assets/ok.webp', 'load');

    const anchor = makeAnchor();

    component.open(anchor, {} as any);

    await Promise.resolve(); // image onload

    expect(overlayMock.create).toHaveBeenCalledTimes(1);
    expect(overlayRefMock.attach).toHaveBeenCalledTimes(1);
    expect(component.url()).toBe('/ok.webp');

    // position builder chain used
    expect(overlayMock.position).toHaveBeenCalled();
  });

  it('should does not open overlay if request becomes stale (close before preload resolves)', async () => {
    const { component } = await setupComponent(() => '/slow.webp');

    // Simulate success, but we will close before microtask runs
    MockImage.outcomes.set('/assets/slow.webp', 'load');

    component.open(makeAnchor(), {} as any);

    // invalidate request
    component.close();

    await Promise.resolve(); // image onload resolves promise

    expect(overlayMock.create).not.toHaveBeenCalled();
    expect(overlayRefMock.attach).not.toHaveBeenCalled();
    expect(component.url()).toBeNull();
  });

  it('should close() detaches + disposes overlay and clears url', async () => {
    const { component } = await setupComponent(() => '/ok2.webp');

    MockImage.outcomes.set('/assets/ok2.webp', 'load');

    component.open(makeAnchor(), {} as any);
    await Promise.resolve();

    expect(overlayMock.create).toHaveBeenCalledTimes(1);
    expect(component.url()).toBe('/ok2.webp');

    component.close();

    expect(overlayRefMock.detach).toHaveBeenCalledTimes(1);
    expect(overlayRefMock.dispose).toHaveBeenCalledTimes(1);
    expect(component.url()).toBeNull();
  });

  it('should onImgError() marks url as missing (cached false) and closes', async () => {
    const { component } = await setupComponent(() => '/will-error.webp');

    // First: preload ok so it opens
    MockImage.outcomes.set('/assets/will-error.webp', 'load');

    component.open(makeAnchor(), {} as any);
    await Promise.resolve();

    expect(overlayMock.create).toHaveBeenCalledTimes(1);
    expect(component.url()).toBe('/will-error.webp');

    // Simulate runtime error event in <img>
    component.onImgError();

    expect(component.url()).toBeNull();
    expect(overlayRefMock.detach).toHaveBeenCalled();
    expect(overlayRefMock.dispose).toHaveBeenCalled();

    // Now: try opening again; should do nothing because cached false
    // (we can't access private cache, so we assert overlay.create not called again)
    component.open(makeAnchor(), {} as any);
    expect(overlayMock.create).toHaveBeenCalledTimes(1);
  });
});
