import * as Phaser from 'phaser';
import Controls from './controls';
import Sponge from './entities/sponge';
import Plate from './entities/plate';
import Cs from './cs';

export default class WashGame extends Phaser.Scene {

    controls: Controls;
    sponge: Sponge;
    plates: Plate[];

    layers: Phaser.GameObjects.Layer[];

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
        this.load.image('stain_cropper', 'assets/stain_cropper.png');
        this.load.image('plate_mask', 'assets/renderTexture_plate_mask.png');

        // DEV TEST
        this.load.image('brush', 'assets/brush.png');
        this.load.image('brush_40', 'assets/brush_40.png');
        this.load.image('brush_70', 'assets/brush_70.png');
        this.load.image('brush_eps_60', 'assets/brush_eps_60.png');
        this.load.image('brush_eps_75', 'assets/brush_eps_75.png'); //GOOD ONE
        this.load.image('brush_eps_85', 'assets/brush_eps_85.png');
        //

        //plates
        for (let i = 0; i < 7; i++)
            this.load.image('plate_' + i, 'assets/plate_' + i + '.png');
        
        //stains
        for (const color of Cs.STAINS) {
            for (let i = 0; i < color.count; i++)
                this.load.image(`stain_${String(color.color)}_${i}`, `assets/stains/stain_${String(color.color)}_${i}.png`);
        }
    }

    create () {

        this.initLayers();

        const bg = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'background');

        
        //const plate = this.add.sprite( 650, 400, 'plate_2');
        this.addToLayer(bg, Cs.LAYER.BG_0);

        this.sponge = new Sponge(this);
        this.add.existing(this.sponge);
        this.addToLayer(this.sponge, Cs.LAYER.SPONGE);

        this.controls = new Controls();
        this.controls.init(this, this.sponge);

        this.initPlates();


        /*
        const rt = this.add.renderTexture(650, 400, 512, 512);
        const mask = rt.createBitmapMask();

        const plate6 = this.add.sprite( 650, 400, 'plate_6');
        plate6.setMask(mask);

        this.input.on('pointermove', function(pointer) {
            if (pointer.isDown)
                rt.draw('brush_eps_75', pointer.x, pointer.y);
        }, this);
        */

        //TODO: test geometry layer (see example)


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

    private initLayers() {
        this.layers = [];
        for (const layerId in Cs.LAYER)
            this.layers[Cs.LAYER[layerId]] = this.add.layer();
    }

    public addToLayer(o: Phaser.GameObjects.GameObject, layerId: number) {
        const layer = this.layers[layerId];
        if (!layer) throw "missing layer for layerId " + layerId;

        layer.add(o);
    }

    private initPlates() {
        this.plates = [];
        for(let i = 0; i < 1; i++) {
            const plate = new Plate(this, 0);
            plate.setPos(Cs.PLATE_POS.X, Cs.PLATE_POS.Y);
            this.plates.push(plate);

            plate.initStains(0);
        }
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
