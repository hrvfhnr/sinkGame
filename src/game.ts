import * as Phaser from 'phaser';
import Controls from './controls';
import Sponge from './entities/sponge';
import Cs from './Cs';

export default class WashGame extends Phaser.Scene {

    controls: Controls;
    sponge: Sponge;

    constructor () {
        super('WashGame');
    }

    preload () {
        //this.load.image('logo', 'assets/phaser3-logo.png');
        //this.load.image('libs', 'assets/libs.png');
        //this.load.glsl('bundle', 'assets/plasma-bundle.glsl.js');
        //this.load.glsl('stars', 'assets/starfields.glsl.js');
    
        this.load.image('background', 'assets/bg.png');
        this.load.image('sponge', 'assets/sponge.png');
        this.load.image('plate_7', 'assets/plate_7.png');


    }

    create () {
        //this.add.shader('RGB Shift Field', 0, 0, SCREEN_SIZE.WIDTH, SCREEN_SIZE.HEIGHT).setOrigin(0);
        //this.add.shader('Plasma', 0, 492, SCREEN_SIZE.WIDTH, 172).setOrigin(0);
        this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'background');

        const plate = this.add.sprite( 650, 400, 'plate_7');

        this.sponge = new Sponge(this);
        this.add.existing(this.sponge);

        console.log('sponge : ' + this.sponge.x + ' , ' + this.sponge.y);

        this.controls = new Controls();
        this.controls.init(this, this.sponge);

        

        /*
        this.tweens.add({
            targets: logo,
            y: 350,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        })
        */
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1000,
    height: 750,
    scene: WashGame
};

const game = new Phaser.Game(config);
