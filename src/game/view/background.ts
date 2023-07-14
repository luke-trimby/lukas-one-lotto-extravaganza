import * as PIXI from 'pixi.js';
import { View } from '../../core/view';
import { Circ, gsap } from 'gsap';

export class BackgroundView extends View {

  private bgBlue: PIXI.Sprite;
  private bgRed: PIXI.Sprite;
  private lightingTween: gsap.core.Tween;

  public init(): void {
    super.init();
    
    this.bgBlue = PIXI.Sprite.from('assets/static/stage-blue.jpg');
    this.bgBlue.anchor.set(0.5, 0);
    this.bgBlue.position.set(960, 0);
    this.bgBlue.scale.set(1.1, 1);
    this.container.addChild(this.bgBlue);

    this.bgRed = PIXI.Sprite.from('assets/static/stage-red.jpg');
    this.bgRed.anchor.set(0.5, 0);
    this.bgRed.position.set(960, 0);
    this.bgRed.scale.set(1.1, 1);
    this.bgRed.alpha = 0;
    this.container.addChild(this.bgRed);

    this.lightingTween = gsap.to(this.bgRed, { alpha: 1, duration: 0.8, ease: Circ.easeInOut, yoyo: true, repeat: Infinity });
    this.lightingTween.pause();
  }

  public animateLighting(animate = true): void {
    if (animate) {
      this.lightingTween.play();
    } else {
      this.lightingTween.pause();
      this.lightingTween.progress(0);
    }
  }
}