import * as PIXI from 'pixi.js';
import { AssetManager } from 'core/asset-manager';
import { CanvasManager } from 'core/canvas-manager';
import { LoadBundle } from 'core/constants';
import { ICanvasConfig } from 'core/interface/canvas-config';
import { Size } from 'core/size';
import { Game } from 'game/game';

export class App {

  private canvasManager: CanvasManager;
  private assetManager: AssetManager;
  private game: Game;

  public init(): void {
    this.initCanvas();
    this.initAssets();

    this.game = new Game();
    this.game.init(this.canvasManager.stage);

    this.assetManager.load();
  }

  private initCanvas(): void {
    const canvasOptions: ICanvasConfig = {
      size: new Size(1920, 1080),
      canvasColor: 0x000000,
      centered: true,
      canvasTargetId: 'canvas-layer-container',
      htmlTargetId: 'html-layer-container',
    };

    this.canvasManager = new CanvasManager(canvasOptions);
    this.canvasManager.init();
  }

  private initAssets(): void {

    const assetBundles: PIXI.ResolverBundle[] = [
      {
        name: LoadBundle.Preloader,
        assets: [
          { name: 'lukas-one-logo', srcs: 'assets/static/lukas-one-logo.png' },
        ]
      },
      {
        name: LoadBundle.Game,
        assets: [
          { name: 'mp3-welcome', srcs: 'assets/audio/welcome.mp3' },
          { name: 'mp3-pick-balls', srcs: 'assets/audio/pick-balls.mp3' },
          { name: 'mp3-disco-string1', srcs: 'assets/audio/disco-string1.mp3' },
          { name: 'mp3-disco-string2', srcs: 'assets/audio/disco-string2.mp3' },
          { name: 'mp3-denied', srcs: 'assets/audio/denied.mp3' },
          { name: 'mp3-tick', srcs: 'assets/audio/tick.mp3' },
          { name: 'mp3-ding', srcs: 'assets/audio/ding.mp3' },
          { name: 'mp3-win1', srcs: 'assets/audio/win1.mp3' },
          { name: 'mp3-win2', srcs: 'assets/audio/win2.mp3' },
          { name: 'mp3-win3', srcs: 'assets/audio/win3.mp3' },
          { name: 'mp3-win4', srcs: 'assets/audio/win4.mp3' },
          { name: 'mp3-win5', srcs: 'assets/audio/win5.mp3' },
          { name: 'mp3-win6', srcs: 'assets/audio/win6.mp3' },
          { name: 'mp3-coin', srcs: 'assets/audio/coin.mp3' },
          { name: 'mp3-cash-register', srcs: 'assets/audio/cash-register.mp3' },
          { name: 'music', srcs: 'assets/audio/music.mp3' },
          { name: 'start-btn', srcs: 'assets/static/start-btn.png' },
          { name: 'stage-blue', srcs: 'assets/static/stage-blue.jpg' },
          { name: 'stage-red', srcs: 'assets/static/stage-red.jpg' },
          { name: 'lotto-ball-blue', srcs: 'assets/static/lotto-ball-blue.png' },
        ]
      },
    ];
    this.assetManager = new AssetManager();
    this.assetManager.init(assetBundles, ['FredokaOne']);
  }
}

new App().init();