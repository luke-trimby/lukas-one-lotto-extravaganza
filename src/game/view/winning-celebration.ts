import * as PIXI from 'pixi.js';
import { View } from 'core/view';
import { winningValueTextStyle, youWonTextStyle } from 'game/data/config/text-styles';
import { Circ, gsap } from 'gsap';
import { LottoView } from './lotto';
import { winTier } from 'game/data/values/win-tier';
import { sound } from '@pixi/sound';

export class WinningCelebrationView extends View {

  private noWinTitle: PIXI.Text;
  private youWinTitle: PIXI.Text;
  private winningValue: PIXI.Text;
  private numberFormatter: Intl.NumberFormat;

  public init(): void {
    super.init();

    this.numberFormatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });

    this.noWinTitle = new PIXI.Text('NO WIN', youWonTextStyle);
    this.noWinTitle.anchor.set(0.5);
    this.noWinTitle.position.set(960, 240);
    this.noWinTitle.alpha = 0;
    this.container.addChild(this.noWinTitle);

    this.youWinTitle = new PIXI.Text('YOU WON', youWonTextStyle);
    this.youWinTitle.anchor.set(0.5);
    this.youWinTitle.position.set(960, 240);
    this.youWinTitle.alpha = 0;
    this.container.addChild(this.youWinTitle);

    this.winningValue = new PIXI.Text(this.numberFormatter.format(0), winningValueTextStyle);
    this.winningValue.anchor.set(0.5);
    this.winningValue.position.set(960, 640);
    this.winningValue.alpha = 0;
    this.container.addChild(this.winningValue);
  }
  
  public async showWinningCelebration(winningBalls: PIXI.Sprite[], tickupDuration = 5): Promise<void> {
    const winnings = winTier[winningBalls.length];
    this.winningValue.text = this.numberFormatter.format(0);

    if (winnings === 0) {
      await this.showLoseScreen();
    } else {
      await this.showWinScreen(winningBalls, tickupDuration);
    }
  }

  private showLoseScreen(): Promise<void> {
    return new Promise((resolve: (value?: void) => void) => {
      gsap.timeline()
        .to(this.noWinTitle, { alpha: 1, duration: 0.5, ease: Circ.easeInOut })
        .to(this.noWinTitle, { alpha: 0, delay: 2, duration: 0.5, ease: Circ.easeInOut })
        .then(() => {
          (this.views.get('Lotto') as LottoView).init(false);
          resolve();
        });
    });
  }

  private showWinScreen(winningBalls: PIXI.Sprite[], tickupDuration: number): Promise<void> {
    return new Promise((resolve: (value?: void) => void) => {
      const tickupObject = { value: 0 };
      gsap.timeline()
        .to(this.youWinTitle, { alpha: 1, duration: 0.5, ease: Circ.easeInOut })
        .to(this.winningValue, { alpha: 1, duration: 0.5, ease: Circ.easeInOut })
        .to(tickupObject, { value: winTier[winningBalls.length], duration: tickupDuration, ease: Circ.easeInOut,
          onUpdate: () => {
            this.winningValue.text = this.numberFormatter.format(tickupObject.value);
            sound.find('mp3-coin').isPlaying ? null : sound.play('mp3-coin');
          },
          onComplete: () => sound.play('mp3-cash-register')
        })
        .to(this.youWinTitle, { alpha: 0, delay: 2, duration: 0.5, ease: Circ.easeInOut })
        .to(this.winningValue, { alpha: 0, duration: 0.5, ease: Circ.easeInOut })
        .then(() => {
          (this.views.get('Lotto') as LottoView).init(false);
          resolve();
        });
    });
  }
}