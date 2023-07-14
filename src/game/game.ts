import * as PIXI from 'pixi.js';
import { View } from '../core/view';
import { PreloaderView } from './view/preloader';
import { BackgroundView } from './view/background';
import { LottoView } from './view/lotto';
import { LoadBundle } from 'core/constants';
import { WinningCelebrationView } from './view/winning-celebration';

export class Game {

  private pixiStage: PIXI.Container;
  // TODO make a nicer view management system to avoid type casting
  private views: Map<string, View> = new Map();

  public init(pixiStage: PIXI.Container) {
    this.pixiStage = pixiStage;
    this.initViews();
  }

  private initViews() {
    this.views.set('Background', new BackgroundView('BackgroundView', this.pixiStage, this.views, LoadBundle.Preloader));

    this.views.set('Lotto', new LottoView('LottoView', this.pixiStage, this.views, LoadBundle.Game));
    this.views.set('WinningCelebration', new WinningCelebrationView('WinningCelebrationView', this.pixiStage, this.views, LoadBundle.Game));
    this.views.set('Preloader', new PreloaderView('PreloaderView', this.pixiStage, this.views,));
  }
}