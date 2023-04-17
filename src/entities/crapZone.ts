import * as Phaser from 'phaser';
import WashGame from "../game";

export default class CrapZone {
    game: WashGame;
    renderTex: Phaser.GameObjects.RenderTexture;

    constructor (wGame: WashGame) {
        this.game = wGame;
    }


    public initStains(difficulty: number = 0) {

    }

}