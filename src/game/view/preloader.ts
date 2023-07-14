import * as PIXI from 'pixi.js';
import { View } from '../../core/view';
import { LoadEvent } from 'core/asset-manager';
import { limitToRange } from 'core/utils/number-utils';

export class PreloaderView extends View {

  protected loaderBar: PIXI.Graphics;
  protected loadingText: PIXI.Text;
  protected loadingLogo: PIXI.Sprite;
  protected loadingLogoTargetY: number;
  protected loadingLogoTravelY: number;

  public init(): void {
    super.init();
    
    this.loadingLogoTargetY = 510;
    this.loadingLogoTravelY = 80;

    this.createLoadingBar();
    this.createLoadingAssets();

    const onProgressBinding: signals.SignalBinding = LoadEvent.onBundleProgress.add((progress: number, loaded: number, total: number) => {
      this.onBundleProgress(progress, loaded, total);
    });
    const onCompleteBinding: signals.SignalBinding = LoadEvent.onComplete.add(() => {
      onProgressBinding.detach();
      onCompleteBinding.detach();
      this.destroy(1);
    });
  }

  protected onBundleProgress(progress: number, currentBundleIndex: number, total: number): void {
    const segmentTotalPerc: number = 100 / total;
    const previousSegmentsPerc: number = segmentTotalPerc * (currentBundleIndex - 1);
    const thisSegmentPerc: number = segmentTotalPerc * progress;
    const totalPerc: number = previousSegmentsPerc + thisSegmentPerc;
    const scale: number = totalPerc / 100;
    this.loaderBar.scale.x = limitToRange(0, 1, scale);

    if (this.loadingText) {
        this.loadingText.text = `${totalPerc.toFixed(2)} %`;
    }
    if (this.loadingLogo) {
        this.loadingLogo.position.y = this.loadingLogoTargetY + (this.loadingLogoTravelY - (this.loadingLogoTravelY * scale));
    }
  }

  protected createLoadingBar(): void {
    const barBacking = new PIXI.Graphics().beginFill(0xFFCD9B, 1).drawRect(0, 0, 446, 19).endFill();
    barBacking.position.set(747, 598);
    this.container.addChild(barBacking);

    this.loaderBar = new PIXI.Graphics().beginFill(0xDB6338, 1).drawRect(0, 0, 440, 15).endFill();
    this.loaderBar.position.set(750, 600);
    this.loaderBar.scale.x = 0;
    this.container.addChild(this.loaderBar);

    this.loadingText = new PIXI.Text('0 %', { fill: 0xffffff, 'fontSize': 15 });
    this.loadingText.position.set(975, 601);
    this.loadingText.anchor.set(0.5, 0.1);
    this.container.addChild(this.loadingText);
  }

  protected createLoadingAssets(): void {
    this.loadingLogo = PIXI.Sprite.from('assets/static/lukas-one-logo.png');
    this.loadingLogo.scale.set(0.8);
    this.loadingLogo.position.set(760, this.loadingLogoTargetY + this.loadingLogoTravelY);
    this.container.addChild(this.loadingLogo);

    const logoMask = new PIXI.Graphics().beginFill(0x00ff00, 0.4).drawRect(0, 0, 440, 140).endFill();
    logoMask.position.set(750, 450);
    this.container.addChild(logoMask);

    this.loadingLogo.mask = logoMask;
  }
}