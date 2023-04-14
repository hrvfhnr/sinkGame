import { Sponge } from "./entities/sponge";
import WashGame from "./game";

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

        this.input.on('pointerdown', this.getLock, this.game);
        this.input.on('pointermove', this.onMouseMove, this.game);
        this.input.keyboard.on('keydown-Q', this.releaseLock, this.game);
        
        this.input.manager.events.on('pointerlockchange', event => {
            //### TODO    
            //this.updateLockText(event.isPointerLocked, this.sprite.x, this.sprite.y);
        });



    }

    private onMouseMove(pointer) {
        if (this.input.mouse.locked)
            this.sponge.move(pointer.movementX, pointer.movementY);
    };


    private getLock(pointer) {
        this.input.mouse.requestPointerLock();
    }

    private releaseLock(event) {
        if (this.input.mouse.locked)
            this.input.mouse.releasePointerLock();
    }


}
