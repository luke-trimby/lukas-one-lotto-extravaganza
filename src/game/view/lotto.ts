import * as PIXI from 'pixi.js';
import { IMediaInstance, sound } from '@pixi/sound';
import { View } from '../../core/view';
import { gameNameTextStyleLukasOne, gameNameTextStyleExtravaganza, lottoBallStyle, yourBallsTextStyle, bigLottoBallStyle, luckyDipTextStyle } from 'game/data/config/text-styles';
import { LoadEvent } from 'core/asset-manager';
import { Power2, gsap } from 'gsap';
import { BackgroundView } from './background';
import { randomRangeInt } from 'core/utils/number-utils';
import { WinningCelebrationView } from './winning-celebration';

export class LottoView extends View {

  private gameNameTextLukasOne: PIXI.Text;
  private gameNameTextLottoLand: PIXI.Text;
  private gameNameTextExtravaganza: PIXI.Text;
  private music: IMediaInstance;
  private lottoContainer: PIXI.Container;
  private lottoBalls: PIXI.Sprite[] = [];
  private lottoSelectionContainer: PIXI.Container;
  private lottoSelections: PIXI.Sprite[] = [];
  private interactionEnabled = false;
  private startButton: PIXI.Sprite;
  private luckyDipButton: PIXI.Sprite;
  private currentWinningBalls: PIXI.Sprite[] = [];
  private playButton: PIXI.Sprite;

  /**
   * TODO extend PIXI.Sprite and add a property to it to store 
   * the ball value and highlight, so we dont have to access 
   * children at specific indexes
   */
  public init(waitForAssets = true): void {
    super.init();

    this.playButton = new PIXI.Sprite(PIXI.Assets.get('start-btn'));
    this.playButton.anchor.set(0.5);
    this.playButton.position.set(960, 820);
    this.playButton.cursor = 'pointer';
    this.playButton.alpha = 0;
    this.container.addChild(this.playButton);

    const startButtonText = new PIXI.Text('PLAY', gameNameTextStyleLukasOne);
    startButtonText.anchor.set(0.5);
    this.playButton.addChild(startButtonText);

    this.playButton.on('mousedown', () => this.playButton.position.set(961, 821));
    this.playButton.on('mouseout', () => this.playButton.position.set(960, 820));
    this.playButton.on('mouseup', () => {
      this.playButton.eventMode = 'none';
      this.playButton.position.set(960, 820);
      gsap.to(this.playButton, { alpha: 0, duration: 0.5, ease: Power2.easeOut });
      this.playWelcomeIntro();
    });

    this.gameNameTextLukasOne = new PIXI.Text('LUKAS ONE', gameNameTextStyleLukasOne);
    this.gameNameTextLukasOne.anchor.set(0.5);
    this.gameNameTextLukasOne.position.set(960, 150);
    this.gameNameTextLukasOne.alpha = 0;
    this.container.addChild(this.gameNameTextLukasOne);

    this.gameNameTextLottoLand = new PIXI.Text('LOTTO LAND', gameNameTextStyleLukasOne);
    this.gameNameTextLottoLand.anchor.set(0.5);
    this.gameNameTextLottoLand.position.set(960, 300);
    this.gameNameTextLottoLand.alpha = 0;
    this.container.addChild(this.gameNameTextLottoLand);

    this.gameNameTextExtravaganza = new PIXI.Text('EXTRAVAGANZA', gameNameTextStyleExtravaganza);
    this.gameNameTextExtravaganza.anchor.set(0.5);
    this.gameNameTextExtravaganza.position.set(960, 550);
    this.gameNameTextExtravaganza.alpha = 0;
    this.container.addChild(this.gameNameTextExtravaganza);

    if (waitForAssets) {
      LoadEvent.onComplete.add(() => {
        this.showPlayButton();
      });
    } else {
      this.showPlayButton();
    }
  }

  private showPlayButton(): void {
    gsap.delayedCall(1, () => {
      gsap.to(this.playButton, { alpha: 1, duration: 0.5, ease: Power2.easeOut });
      this.playButton.eventMode = 'static';
    });
  }

  private playWelcomeIntro(): void {
    (this.views.get('Background') as BackgroundView).animateLighting();

    sound.find('music').stop();

    this.music = sound.play('music', { volume: 0.25, loop: true }) as IMediaInstance;
    sound.play('mp3-welcome', { volume: 1 });

    this.gameNameTextLukasOne.position.y = 1920;
    this.gameNameTextLukasOne.alpha = 1;
    
    this.gameNameTextLottoLand.position.y = 1920;
    this.gameNameTextLottoLand.alpha = 1;
    
    this.gameNameTextExtravaganza.position.y = 1920;
    this.gameNameTextExtravaganza.alpha = 1;

    gsap.timeline({delay: 4.5})
      .to(this.gameNameTextLukasOne, { y: 150, duration: 0.5, ease: Power2.easeOut })
      .to(this.gameNameTextLottoLand, { y: 300, delay: 0.3, duration: 0.5, ease: Power2.easeOut })
      .to(this.gameNameTextExtravaganza, { y: 550, delay: 0.2, duration: 0.5, ease: Power2.easeOut })
      .to(this.gameNameTextExtravaganza.scale, { x: 1.15, y: 1.15, duration: 0.5, ease: Power2.easeOut, yoyo: true, repeat: Infinity })
      .to(this.music, { volume: 0.75, delay: 0.8, duration: 0.5 })
      .to(this.music, { volume: 0.25, delay: 6, duration: 0.5 })
      .to(this.gameNameTextLukasOne, { alpha: 0, duration: 0.1, ease: Power2.easeOut })
      .to(this.gameNameTextLottoLand, { alpha: 0, duration: 0.1, ease: Power2.easeOut })
      .to(this.gameNameTextExtravaganza, { alpha: 0, duration: 0.1, ease: Power2.easeOut });

    gsap.delayedCall(18, () => {
      (this.views.get('Background') as BackgroundView).animateLighting(false);
      this.createLotto();
    });
  };

  private createLotto(): void {
    this.createLottoBallPool();
    this.createLottoBallSelections();
    this.createLottoStartButton();

    sound.play('mp3-pick-balls', { volume: 1 });
    
    gsap.timeline({delay: 1})
    .to(this.lottoContainer, { alpha: 1, duration: 1, ease: Power2.easeOut })
    .to(this.lottoSelectionContainer, { alpha: 1, duration: 1, ease: Power2.easeOut })
    .then(() => {
      this.interactionEnabled = true;
    });
  }

  private createLottoBallPool(): void {
    this.lottoContainer = new PIXI.Container();
    this.container.addChild(this.lottoContainer);

    const divider = new PIXI.Graphics();
    divider.lineStyle(4, 0xFFFFFF, 1);
    divider.beginFill(0x000000, 0.6);
    divider.drawRect(0, 0, 750, 950);
    divider.endFill();
    divider.position.set(1075, 50);
    this.lottoContainer.addChild(divider);
    this.lottoContainer.alpha = 0;

    const startX = 1150;
    const startY = 125;
    const spacingX = 100;
    const spacingY = 100;
    const rows = 7;
    for (let i = 0; i < 59; i++) {
      const row = Math.floor(i / rows);
      const col = i % rows;

      const lottoBall = new PIXI.Sprite(PIXI.Assets.get('lotto-ball-blue'));
      lottoBall.eventMode = 'static';
      lottoBall.cursor = 'pointer';
      lottoBall.position.set(startX + (spacingX * col), startY + (spacingY * row));
      lottoBall.anchor.set(0.5);
      this.lottoBalls.push(lottoBall);
      this.lottoContainer.addChild(lottoBall);

      lottoBall.on('mouseup', () => this.onLottoBallAdd(i));

      const number = new PIXI.Text(`${i + 1}`, lottoBallStyle);
      number.anchor.set(0.5, 0.45);
      lottoBall.addChild(number);

      const highlight = new PIXI.Graphics();
      highlight.lineStyle(4, 0xAAAAFF, 1);
      highlight.drawCircle(0, 0, 47);
      highlight.alpha = 0;
      lottoBall.addChild(highlight);
    }
  }

  private createLottoBallSelections(): void {
    this.lottoSelectionContainer = new PIXI.Container();
    this.container.addChild(this.lottoSelectionContainer);

    const divider = new PIXI.Graphics();
    divider.lineStyle(4, 0xFFFFFF, 1);
    divider.beginFill(0x000000, 0.6);
    divider.drawRect(0, 0, 750, 550);
    divider.endFill();
    divider.position.set(75, 50);
    this.lottoSelectionContainer.addChild(divider);
    this.lottoSelectionContainer.alpha = 0;

    const yourBallsText = new PIXI.Text('YOUR PICKS', yourBallsTextStyle);
    yourBallsText.anchor.set(0.5);
    yourBallsText.position.set(450, 175);
    this.lottoSelectionContainer.addChild(yourBallsText);

    this.luckyDipButton = new PIXI.Sprite(PIXI.Assets.get('start-btn'));
    this.luckyDipButton.anchor.set(0.5);
    this.luckyDipButton.position.set(450, 500);
    this.luckyDipButton.scale.set(0.8, 0.6);
    this.luckyDipButton.eventMode = 'static';
    this.luckyDipButton.cursor = 'pointer';
    this.lottoSelectionContainer.addChild(this.luckyDipButton);
    
    const luckyDipButtonText = new PIXI.Text('LUCKY DIP', luckyDipTextStyle);
    luckyDipButtonText.anchor.set(0.5);
    this.luckyDipButton.addChild(luckyDipButtonText);

    this.luckyDipButton.on('mouseup', () => this.luckyDip());

    const startX = 175;
    const startY = 325;
    const spacingX = 110;
    for (let i = 0; i < 6; i++) {
      const lottoBall = new PIXI.Sprite(PIXI.Assets.get('lotto-ball-blue'));
      lottoBall.eventMode = 'static';
      lottoBall.cursor = 'pointer';
      lottoBall.position.set(startX + (spacingX * i), startY);
      lottoBall.anchor.set(0.5);
      lottoBall.tint = 0x777777;
      this.lottoSelections.push(lottoBall);
      this.lottoSelectionContainer.addChild(lottoBall);

      lottoBall.on('mouseup', () => this.onLottoBallRemove(i));

      const number = new PIXI.Text(``, lottoBallStyle);
      number.anchor.set(0.5, 0.45);
      lottoBall.addChild(number);

      const highlight = new PIXI.Graphics();
      highlight.lineStyle(4, 0xAAAAFF, 1);
      highlight.drawCircle(0, 0, 47);
      highlight.alpha = 0;
      lottoBall.addChild(highlight);
    }
  }

  private createLottoStartButton(): void {
    this.startButton = new PIXI.Sprite(PIXI.Assets.get('start-btn'));
    this.startButton.anchor.set(0.5);
    this.startButton.position.set(450, 800);
    this.startButton.alpha = 0;
    this.container.addChild(this.startButton);
    
    const startButtonText = new PIXI.Text('START', gameNameTextStyleLukasOne);
    startButtonText.anchor.set(0.5);
    this.startButton.addChild(startButtonText);

    this.startButton.on('mouseup', () => this.startLotto());
  }

  private luckyDip(): void {
    if (!this.interactionEnabled) {
      return;
    }

    this.removeTintFromAllBalls();

    for (let i = 0; i < 6; i++) {
      const ball = this.getRandomAvailableBall();
      ball.tint = 0x777777;

      const selectionBall = this.lottoSelections[i];
      selectionBall.tint = 0xFFFFFF;
      (selectionBall.children[0] as PIXI.Text).text = (ball.children[0] as PIXI.Text).text;
    }
    
    this.showStartButtonIfAvailable();
  }

  private onLottoBallAdd(ballIndex: number): void {
    if (!this.interactionEnabled) {
      return;
    }
    const lottoBall = this.lottoBalls[ballIndex];

    let ballChoiceAllowed;
    const lottoBallText: string = (lottoBall.children[0] as PIXI.Text).text;
    for (let i = 0; i< this.lottoSelections.length; i++) {
      const selectionBall = this.lottoSelections[i];
      if (selectionBall.children.length > 0) {
        const selectionText: string = (selectionBall.children[0] as PIXI.Text).text;
        if (selectionText === '') {
          (selectionBall.children[0] as PIXI.Text).text = lottoBallText;
          ballChoiceAllowed = true;
          selectionBall.eventMode = 'static';
          selectionBall.cursor = 'pointer';
          selectionBall.tint = 0xFFFFFF;
          break;
        }
      }
    }
    if (ballChoiceAllowed) {
      sound.play('mp3-disco-string1', { volume: 0.5 });
      lottoBall.eventMode = 'none';
      lottoBall.cursor = 'default';
      lottoBall.tint = 0x777777;
      this.showStartButtonIfAvailable();
    } else {
      sound.play('mp3-denied', { volume: 0.5 });
    }
  }

  private onLottoBallRemove(ballIndex: number): void {
    if (!this.interactionEnabled) {
      return;
    }
    const selectionBall = this.lottoSelections[ballIndex];

    let ballChoiceAllowed;
    const selectionText: string = (selectionBall.children[0] as PIXI.Text).text;
    for (let i = 0; i< this.lottoBalls.length; i++) {
      const lottoBall = this.lottoBalls[i];
      const lottoBallText: string = (lottoBall.children[0] as PIXI.Text).text;
      if (lottoBallText === selectionText) {
        lottoBall.eventMode = 'static';
        lottoBall.cursor = 'pointer';
        lottoBall.tint = 0xFFFFFF;
        ballChoiceAllowed = true;
        break;
      }
    }
    if (ballChoiceAllowed) {
      sound.play('mp3-disco-string2', { volume: 0.5 });
      selectionBall.eventMode = 'none';
      selectionBall.cursor = 'default';
      selectionBall.tint = 0x777777;
      (selectionBall.children[0] as PIXI.Text).text = '';
      this.showStartButtonIfAvailable();
    } else {
      sound.play('mp3-denied', { volume: 0.5 });
    }
  }

  private showStartButtonIfAvailable(): void {
    const allBallsSelected = this.lottoSelections.every((selectionBall) => (selectionBall.children[0] as PIXI.Text)?.text !== '');
    if (allBallsSelected) {
      this.startButton.cursor = 'pointer';
      this.startButton.eventMode = 'static';
      gsap.to(this.startButton, { alpha: 1, duration: 0.5, ease: Power2.easeOut });
    } else {
      this.startButton.cursor = 'default';
      this.startButton.eventMode = 'none';
      gsap.to(this.startButton, { alpha: 0, duration: 0.5, ease: Power2.easeOut });
    }
  }

  private async startLotto(): Promise<void> {
    this.interactionEnabled = false;
    this.currentWinningBalls = [];
    this.removeTintFromAllBalls();
    this.startButton.cursor = 'default';
    this.startButton.eventMode = 'none';
    gsap.to(this.startButton, { alpha: 0, duration: 0.25, ease: Power2.easeOut });
    this.luckyDipButton.cursor = 'default';
    this.luckyDipButton.eventMode = 'none';
    gsap.to(this.luckyDipButton, { alpha: 0, duration: 0.25, ease: Power2.easeOut });

    for (let i = 0; i < 6; i++) {
      const ball = await this.pickRandomBall();
      const ballValue = (ball.children[0] as PIXI.Text).text;
      await this.presentBall(ballValue);
    }

    this.removeHighlightFromAllBalls();

    this.destroy();
    (this.views.get('WinningCelebration') as WinningCelebrationView).showWinningCelebration(this.currentWinningBalls);
  }

  private pickRandomBall(): Promise<PIXI.Sprite> {
    return new Promise((resolve: (value?: PIXI.Sprite) => void) => {
      const randomTicks = randomRangeInt(20, 40);
      let tick = 0;
      let currentBall;
      const interval = setInterval(() => {
        this.removeHighlightFromAllBalls();
        currentBall = this.getRandomAvailableBall();
        currentBall.children[1].alpha = 1;
        tick++;
        sound.play('mp3-tick', { volume: 0.2 });
        if (tick > randomTicks) {
          clearInterval(interval);
          currentBall.tint = 0x777777;
          resolve(currentBall);
        }
      }, 100);
    });
  }

  private presentBall(ballValue: string): Promise<void> {
    return new Promise((resolve: () => void) => {
      const bigBall = new PIXI.Sprite(PIXI.Assets.get('lotto-ball-blue'));
      bigBall.anchor.set(0.5);
      bigBall.position.set(960, 540);
      bigBall.scale.set(0.5);
      this.container.addChild(bigBall);

      const number = new PIXI.Text(ballValue, bigLottoBallStyle);
      number.anchor.set(0.5, 0.45);
      bigBall.addChild(number);

      gsap.to(bigBall, {rotation: 2 * Math.PI, duration: 0.5, ease: Power2.easeOut });
      gsap.delayedCall(0.2, () => sound.play('mp3-ding', { volume: 0.8 }));

      gsap.timeline()
      .to(bigBall.scale, { x: 5, y: 5, duration: 0.5, ease: Power2.easeOut })
      .to(bigBall.scale, { x: 4, y: 4, duration: 0.5, ease: Power2.easeInOut, yoyo: true })
      .to(bigBall, { alpha: 0, delay: 1, duration: 0.5, ease: Power2.easeOut })
      .then(() => {
        this.highlightWinngBall(ballValue);
        resolve();
      });
    });
  }

  private highlightWinngBall(ballValue: string): void {
    this.lottoSelections.forEach((selectionBall: PIXI.Sprite) => {
      const selectionText: string = (selectionBall.children[0] as PIXI.Text).text;
      if (selectionText === ballValue) {
        selectionBall.children[1].alpha = 1;
        this.currentWinningBalls.push(selectionBall);
        sound.play(`mp3-win${this.currentWinningBalls.length}`, { volume: 0.8 });
      }
    });
  }

  private removeTintFromAllBalls(): void {
    this.lottoBalls.forEach((lottoBall) => {
      lottoBall.tint = 0xFFFFFF;
    });
  }

  private removeHighlightFromAllBalls(): void {
    this.lottoBalls.forEach((lottoBall) => {
      (lottoBall.children[1] as PIXI.Graphics).alpha = 0;
    });
  }

  private getRandomAvailableBall(): PIXI.Sprite {
    let ball;
    while (ball === undefined) {
      const randomBall = this.lottoBalls[randomRangeInt(0, this.lottoBalls.length - 1)];
      if (randomBall.tint === 0xFFFFFF) {
        ball = randomBall;
      }
    };
    return ball;
  }
}