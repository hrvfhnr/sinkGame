import * as Phaser from 'phaser';

const SCREEN_SIZE = { WIDTH: 1000, HEIGHT: 750 };

export default class Demo extends Phaser.Scene
{
    constructor () {
        super('demo');
    }

    preload () {
        this.load.image('logo', 'assets/phaser3-logo.png');
        this.load.image('libs', 'assets/libs.png');
        this.load.glsl('bundle', 'assets/plasma-bundle.glsl.js');
        this.load.glsl('stars', 'assets/starfields.glsl.js');
    }

    create () {
        this.add.shader('RGB Shift Field', 0, 0, SCREEN_SIZE.WIDTH, SCREEN_SIZE.HEIGHT).setOrigin(0);

        this.add.shader('Plasma', 0, 492, SCREEN_SIZE.WIDTH, 172).setOrigin(0);

        this.add.image(SCREEN_SIZE.WIDTH / 2, SCREEN_SIZE.HEIGHT / 2, 'libs');

        const logo = this.add.image(SCREEN_SIZE.WIDTH / 2, 70, 'logo');

        this.tweens.add({
            targets: logo,
            y: 350,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        })
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1000,
    height: 750,
    scene: Demo
};

const game = new Phaser.Game(config);
