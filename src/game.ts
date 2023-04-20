import * as Phaser from 'phaser';
import Controls from './controls';
import Sponge from './entities/sponge';
import Plate from './entities/plate';
import Cs from './cs';
import Utils from './Utils';
import { Difficulty, BrushType } from './types';

export default class WashGame extends Phaser.Scene {

    controls: Controls;
    sponge: Sponge;
    plates: Plate[];
    brushes: {
        [BrushType.NORMAL_BRUSH]: Phaser.GameObjects.Sprite[];
        [BrushType.HARD_BRUSH]: Phaser.GameObjects.Sprite[];
    }

    layers: Phaser.GameObjects.Layer[];

    constructor () {
        super('WashGame');
    }

    preload () {
    
        this.load.image('background', 'assets/bg.png');
        this.load.image('sponge', 'assets/sponge.png');
        this.load.image('stain_cropper', 'assets/stain_cropper.png');
        this.load.image('plate_mask', 'assets/renderTexture_plate_mask.png');

        //scraping brushes        
        this.load.image('brush_normal', 'assets/brush_normal.png');
        this.load.image('brush_hard', 'assets/brush_hard.png');

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
        this.initBrushesCollection();

        const bg = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'background');
        
        this.addToLayer(bg, Cs.LAYER.BG_0);

        this.sponge = new Sponge(this);
        this.add.existing(this.sponge);
        this.addToLayer(this.sponge, Cs.LAYER.SPONGE);

        this.initPlates();
        
        
        this.controls = new Controls();
        this.controls.init(this, this.sponge);

        /*
        this.tweens.add({
            targets: this.plates[0].sp,
            y: 600,
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


    private initBrushesCollection() {
        this.brushes = { [BrushType.NORMAL_BRUSH]: [], [BrushType.HARD_BRUSH]: [] };
        for (let i = 0; i < 3; i++) {
            const spNormal = this.add.sprite(0, 0, BrushType.NORMAL_BRUSH);
            const spHard = this.add.sprite(0, 0, BrushType.HARD_BRUSH);
            spNormal.setRotation( (1 - i) * 1 );
            spHard.setRotation( (1 - i) * 2) ;

            this.brushes[BrushType.NORMAL_BRUSH].push(spNormal);
            this.brushes[BrushType.HARD_BRUSH].push(spHard);
        }
    }


    public getBrushByType(type: BrushType): Phaser.GameObjects.Sprite {
        return this.brushes[type][Utils.getRandomInt(this.brushes[type].length)];
    }


    private initPlates() {
        this.plates = [];
        for(let i = 0; i < 1; i++) {
            const plate = new Plate(this, Utils.getRandomInt(7));
            plate.setPos(Cs.PLATE_POS.X, Cs.PLATE_POS.Y);
            this.plates.push(plate);

            plate.initStains(Difficulty.STANDARD);
        }
    }


    getCurrentPlate(): Plate {
        return this.plates[0];
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
