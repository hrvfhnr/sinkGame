import * as Phaser from 'phaser';
import WashGame from "../game";
import Cs from '../cs';

export default class Sponge extends Phaser.GameObjects.Sprite {
    game: WashGame;
    bumpTween: Phaser.Tweens.Tween;    

    constructor (wGame: WashGame) {
        super(wGame, -200, Cs.SCREEN_SIZE.HEIGHT / 2 + 50, 'sponge');
        this.setScale(1.6);
        this.setRotation(1.065);
        this.game = wGame;
    }


    public setPos(nx: number, ny: number) {
        this.x = nx;
        this.y = ny;
    }

    public move(dx: number, dy:  number) {
        this.x += dx
        this.y += dy;

        // Force the sprite to stay on screen
        this.x = Phaser.Math.Clamp(this.x, 0, Cs.SCREEN_SIZE.WIDTH);
        this.y = Phaser.Math.Clamp(this.y, 0, Cs.SCREEN_SIZE.HEIGHT);

        if (dx > 0) { 
            this.setRotation(); 
        } else if (dx < 0) { 
            this.setRotation(-0.1); 
        } else { 
            this.setRotation(0); 
        }
    }


    private resetCurrentBumpTween() {
        if (!this.bumpTween) return;

        this.bumpTween.stop();
        this.bumpTween.destroy();
        this.bumpTween = null;
    }

    public bump(nx: number, ny: number) {
        this.resetCurrentBumpTween();
        this.scale = 0.9;
        
        const localThis = this;

        this.bumpTween = this.game.tweens.add({
            targets: this,
            scale: 1.0,
            duration: 1000,
            ease: 'Back.Out',
            yoyo: false,
            onComplete: () => { localThis.resetCurrentBumpTween(); }
        })
    }


    public unbump(nx: number, ny: number) {
        this.resetCurrentBumpTween();
        this.scale = 1.1;

        const localThis = this;
        
        this.bumpTween = this.game.tweens.add({
            targets: this,
            scale: 1.0,
            duration: 1000,
            ease: 'Elastic.Out',
            yoyo: false,
            onComplete: () => { localThis.resetCurrentBumpTween(); }
        })
    }


    public bumpFromLogo(nx: number, ny: number) {
        const localThis = this;
        
        this.bumpTween = this.game.tweens.add({
            targets: this,
            scale: 1.1,
            duration: 800,
            ease: 'Bounce.Out',
            onComplete: () => { localThis.resetCurrentBumpTween(); }
        });
        this.game.tweens.add({
            targets: this,
            rotation: 0.0,
            duration: 500,
            ease: 'Back.Out',
        });
        this.game.tweens.add({
            targets: this,
            x: nx,
            y: ny,
            duration: 500,
            ease: 'Back.Out',
        });
    }

}