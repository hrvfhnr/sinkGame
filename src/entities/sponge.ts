import * as Phaser from 'phaser';
import WashGame from "../game";
import Cs from '../cs';

export default class Sponge extends Phaser.GameObjects.Sprite {
    game: WashGame;

    constructor (wGame: WashGame) {
        super(wGame, Cs.SCREEN_SIZE.WIDTH / 2 , Cs.SCREEN_SIZE.HEIGHT / 2 , 'sponge');
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

    public bump(nx: number, ny: number) {
        this.scale = 0.9;
        //ts-ignore
        this.game.tweens.add({
            targets: this,
            scale: 1.0,
            duration: 1000,
            ease: 'Elastic.Out',
            yoyo: false,
        })
    }


    public bumpFromLogo(nx: number, ny: number) {
        //ts-ignore
        this.game.tweens.add({
            targets: this,
            scale: 1.0,
            duration: 800,
            ease: 'Bounce.Out',
        });
        this.game.tweens.add({
            targets: this,
            rotation: 0.0,
            duration: 500,
            ease: 'Back.Out',
        });
        console.log("n: " + nx + ', ' + ny);
        this.game.tweens.add({
            targets: this,
            x: nx,
            y: ny,
            duration: 500,
            ease: 'Back.Out',
        });
    }

}