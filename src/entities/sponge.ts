import * as Phaser from 'phaser';
import WashGame from "../game";
import Cs from '../cs';

export default class Sponge extends Phaser.GameObjects.Sprite {
    game: WashGame;

    constructor (wGame: WashGame) {
        super(wGame, 350, 500, 'sponge');
        this.game = wGame;
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

}