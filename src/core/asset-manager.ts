import FontFaceObserver from 'fontfaceobserver';
import { Assets, ResolverBundle, ResolverManifest } from 'pixi.js';
import signals, { Signal } from 'signals';

export class LoadEvent {
  public static onStart: Signal = new signals.Signal();
  public static onBundleProgress: Signal = new signals.Signal();
  public static onBundleLoaded: Signal = new signals.Signal();
  public static onComplete: Signal = new signals.Signal();
}

export class AssetManager {
  protected assetManifest: ResolverManifest;
  protected currentAssetBundle: ResolverBundle;
  protected totalBundles: number;
  protected currentBundleIndex: number;
  protected waitingForFonts: boolean;
  protected waitingForPixi: boolean;
  protected fontNames: string[];

  public init(assetBundles: ResolverBundle[], fontNames: string[]): void {
    this.assetManifest = { bundles: assetBundles };
    this.fontNames = fontNames;
    Assets.init({ manifest: this.assetManifest });
    this.currentBundleIndex = 0;
  }

  public load(): void {
    this.waitingForPixi = true;
    this.totalBundles = this.assetManifest.bundles.length;
    LoadEvent.onStart.dispatch();

    let count = 0;
    this.fontNames?.forEach((fontName: string) => {
      this.waitingForFonts = true;
      new FontFaceObserver(fontName).load().then(() => {
        count++;
        if (count === this.fontNames.length) {
          this.waitingForFonts = false;
          if (!this.waitingForPixi) {
            LoadEvent.onComplete.dispatch();
          }
        }
      });
    });

    this.loadNextBundle();
  }

  protected async loadNextBundle(): Promise<void> {
    this.currentAssetBundle = this.assetManifest.bundles.shift();
    this.currentBundleIndex++;

    Assets.loadBundle(this.currentAssetBundle.name, (progress: number) => 
      this.onProgress(progress)
    ).then(() => this.onBundleComplete());
  }

  protected onProgress(progress: number): void {
    LoadEvent.onBundleProgress.dispatch(
      progress,
      this.currentBundleIndex,
      this.totalBundles
    );
  }

  protected onBundleComplete(): void {
    LoadEvent.onBundleLoaded.dispatch(this.currentAssetBundle.name);
    if (this.assetManifest.bundles.length > 0) {
      this.loadNextBundle();
    } else {
      this.waitingForPixi = false;
      if (!this.waitingForFonts) {
        LoadEvent.onComplete.dispatch();
      }
    }
  }
}
