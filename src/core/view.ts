import * as PIXI from 'pixi.js';
import { LoadEvent } from './asset-manager';
import { LoadBundle } from './constants';
import { Log } from 'enhance-log';
import gsap from 'gsap';

export class View {

  protected name: string;
  protected container: PIXI.Container;
  protected views: Map<string, View> = new Map();

  constructor(name: string, pixiStage: PIXI.Container, views: Map<string, View>, requiredLoadBundle?: LoadBundle) {
    this.container = new PIXI.Container();
    this.name = name;
    this.views = views;
    pixiStage.addChild(this.container);

    if (requiredLoadBundle) {
      const signalBinding: signals.SignalBinding = LoadEvent.onBundleLoaded.add((name: string) => {
        if (name === requiredLoadBundle) {
          this.init();
          signalBinding.detach();
        }
      });
    } else {
      this.init();
    }
  }

  public init(): void {
    Log.i(`[View] Init `, this.name);
    this.container.alpha = 1;
  }

  public destroy(delay = 0): void {
    gsap.to(this.container, { alpha: 0, delay, duration: 0.5, onComplete: () => this.container.removeChildren() });
  }
}