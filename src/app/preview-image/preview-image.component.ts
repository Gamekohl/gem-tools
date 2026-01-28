import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayRef
} from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef
} from "@angular/core";
import {ResourceNode} from "../../interfaces";

export type PreviewUrlResolver<T> = (node: T) => string | null | undefined;

@Component({
  selector: "app-preview-image",
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #previewTpl>
      <div class="pointer-events-none">
        @if (url()) {
          <div class="bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden w-125">
            <img
                [ngSrc]="'/assets' + url()"
                class="block w-full h-auto"
                [alt]="url()!"
                (error)="onImgError()"
                width="500"
                height="500"
            />
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class PreviewImageComponent implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private overlayRef: OverlayRef | null = null;
  private portal: TemplatePortal | null = null;

  /** Cache: fullUrl -> true (exists) / false (missing) */
  private readonly preloadCache = new Map<string, boolean>();

  /** Used to ignore stale async preload results (fast hover switching) */
  private openRequestId = 0;

  readonly positions: ConnectedPosition[] = [
    { originX: "end", originY: "center", overlayX: "start", overlayY: "center", offsetX: 12 },
    { originX: "start", originY: "center", overlayX: "end", overlayY: "center", offsetX: -12 },
    { originX: "center", originY: "bottom", overlayX: "center", overlayY: "top", offsetY: 8 },
  ];

  resolveUrl = input.required<PreviewUrlResolver<ResourceNode>>();

  previewTemplate = viewChild.required<TemplateRef<any>>("previewTpl");

  /** Holds the *relative* url (without /assets prefix), like in your original code */
  url = signal<string | null>(null);

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  /**
   * Opens the overlay ONLY if the image can be preloaded successfully.
   * If the image does not exist / errors, nothing is shown.
   */
  open(anchor: ElementRef<HTMLElement>, node: ResourceNode): void {
    const resolved = this.resolveUrl()(node) ?? null;
    if (!resolved) return; // no image for this node -> do nothing

    const fullUrl = "/assets" + resolved;

    // If we already know it doesn't exist, do nothing (no flash)
    const cached = this.preloadCache.get(fullUrl);
    if (cached === false) return;

    const reqId = ++this.openRequestId;

    const proceed = () => {
      // if another open/close happened in the meantime, ignore
      if (reqId !== this.openRequestId) return;

      this.url.set(resolved);

      if (!this.overlayRef) {
        this.overlayRef = this.overlay.create({
          positionStrategy: this.createPositionStrategy(anchor),
          scrollStrategy: this.overlay.scrollStrategies.reposition(),
          hasBackdrop: false,
          panelClass: "preview-image-overlay",
        });

        this.portal = new TemplatePortal(this.previewTemplate(), this.vcr);
      } else {
        (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .setOrigin(anchor);
      }

      if (!this.overlayRef.hasAttached() && this.portal) {
        this.overlayRef.attach(this.portal);
      }

      this.cdr.markForCheck();
    };

    // If cached success, open immediately
    if (cached === true) {
      proceed();
      return;
    }

    // Otherwise preload first, then open
    this.preloadImage(fullUrl).then((ok) => {
      this.preloadCache.set(fullUrl, ok);

      if (!ok) {
        // no image -> show nothing
        return;
      }

      proceed();
    });
  }

  close(): void {
    // invalidate any in-flight preload result
    this.openRequestId++;

    this.url.set(null);
    this.overlayRef?.detach();

    // (Optional) Keep overlayRef to reuse instead of dispose.
    // If you prefer your old behavior, you can dispose here.
    this.overlayRef?.dispose();
    this.overlayRef = null;

    this.cdr.markForCheck();
  }

  /**
   * Should rarely happen now (we preload), but can still occur due to transient issues.
   * If it happens: close overlay and cache as missing.
   */
  onImgError(): void {
    const resolved = this.url();
    if (!resolved) return;

    const fullUrl = "/assets" + resolved;
    this.preloadCache.set(fullUrl, false);

    this.close();
  }

  private preloadImage(fullUrl: string): Promise<boolean> {
    // already cached?
    const cached = this.preloadCache.get(fullUrl);
    if (cached !== undefined) return Promise.resolve(cached);

    return new Promise<boolean>((resolve) => {
      const img = new Image();
      img.decoding = "async";

      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);

      img.src = fullUrl;
    });
  }

  private createPositionStrategy(anchor: ElementRef<HTMLElement>) {
    return this.overlay
        .position()
        .flexibleConnectedTo(anchor)
        .withPositions(this.positions)
        .withFlexibleDimensions(false)
        .withPush(true);
  }
}
