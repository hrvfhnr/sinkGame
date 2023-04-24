import Sponge from "./entities/sponge";
import WashGame from "./game";
import { GameStep } from "./types";

export default class Controls {
    game: WashGame;
    sponge: Sponge;
    input: Phaser.Input.InputPlugin;
    mouse: Phaser.Input.Mouse.MouseManager;

    constructor () {}

    public init(wGame: WashGame, sponge: Sponge) {
        this.game = wGame;
        this.sponge = sponge;
        this.input = this.game.input;

        this.input.on('pointerdown', this.getLock, this);
        this.input.on('pointermove', this.onMouseMove, this);
        this.input.keyboard.on('keydown-Q', this.releaseLock, this);
        this.input.keyboard.on('keydown-SPACE', this.rinse, this);
        
        this.input.manager.events.on('pointerlockchange', event => {
            //### TODO    
            //this.updateLockText(event.isPointerLocked, this.sprite.x, this.sprite.y);
        }, this);


        
        this.input.keyboard.on('keydown-C', event => {
            //this.game.startGameOver();
            //this.game.sinkFoamEmitter.start();
        }, this);


        this.input.keyboard.on('keydown-M', event => {
            if (this.game.hasStep(GameStep.GAME_OVER)) {
                this.game.gameOverFoamEmitter.stop();
                this.game.gameOverFoamEmitter.killAll();
            }
        }, this);
        
        
    }

    private onMouseMove(pointer) {
        if (this.input.mouse.locked) {
            if (pointer.isDown)
                this.game.getCurrentPlate().scrape(this.sponge.x, this.sponge.y);
            this.sponge.move(pointer.movementX, pointer.movementY);
        }
    };


    public getLock(pointer) {
        if (this.game.hasStep(GameStep.GAME_OVER))
            return;

        if (this.game.hasStep(GameStep.INTRO)) {
            if (!this.game.introLock) {
                this.sponge.bumpFromLogo(pointer.x, pointer.y);
                this.game.hideLogo();

                //this.game.prepareStart();
                this.game.startGame();
                
                this.input.mouse.requestPointerLock();
            }
        } else {
            if (!this.input.mouse.locked)
                this.sponge.bump(pointer.x, pointer.y);
            this.input.mouse.requestPointerLock();
        }
    }

    private releaseLock(event) {
        if (this.input.mouse.locked)
            this.input.mouse.releasePointerLock();
    }

    private rinse() {
        this.game.startRinse();
    }


}
