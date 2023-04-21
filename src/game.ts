import * as Phaser from 'phaser';
import Controls from './controls';
import Sponge from './entities/sponge';
import Plate from './entities/plate';
import Cs from './cs';
import Utils from './Utils';
import { Difficulty, BrushType, GameStep } from './types';
import CleanChecker from "./CleanChecker";

export default class WashGame extends Phaser.Scene {

    step: GameStep;
    controls: Controls;
    sponge: Sponge;
    plates: Plate[];
    cleanChecker: CleanChecker;
    brushes: {
        [BrushType.NORMAL_BRUSH]: Phaser.GameObjects.Sprite[];
        [BrushType.HARD_BRUSH]: Phaser.GameObjects.Sprite[]
        [BrushType.SUPER_BRUSH]: Phaser.GameObjects.Sprite[];
    }

    layers: Phaser.GameObjects.Layer[];

    startTime: number | null;
    deltaTime: number | null
    timeText: Phaser.GameObjects.Text;

    cleanCompletionText: Phaser.GameObjects.Text;

    txt_clickTo: Phaser.GameObjects.Sprite;
    txt_startLogo: Phaser.GameObjects.Sprite;


    constructor () {
        super('WashGame');

        this.step = GameStep.INTRO;

        this.startTime = null;
        this.deltaTime = null;
    }


    init() {
        const element = document.createElement('style');
        document.head.appendChild(element);
        const sheet = element.sheet;
        let styles = '@font-face { font-family: "Double_Bubble_shadow"; src: url("assets/fonts/Double_Bubble_shadow.otf") format("opentype"); }\n';
        sheet.insertRule(styles, 0);
    }


    preload () {

        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    
        this.load.image('background', 'assets/bg.png');
        this.load.image('sponge', 'assets/sponge.png');
        this.load.image('stain_cropper', 'assets/stain_cropper.png');
        this.load.image('plate_mask', 'assets/renderTexture_plate_mask.png');

        //scraping brushes        
        this.load.image('brush_normal', 'assets/brush_normal.png');
        this.load.image('brush_hard', 'assets/brush_hard.png');
        this.load.image('brush_super', 'assets/brush_super.png');

        //text imgs
        this.load.image('start_logo', 'assets/texts/startLogo.png');
        this.load.image('click_to', 'assets/texts/clickTo.png');



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
        this.initFonts();
        this.initLayers();
        this.initBrushesCollection();

        const bg = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'background');
        
        this.addToLayer(bg, Cs.LAYER.BG_0);

        this.sponge = new Sponge(this);
        this.add.existing(this.sponge);
        this.addToLayer(this.sponge, Cs.LAYER.SPONGE);
        this.cleanChecker = new CleanChecker(this);
        this.initPlates();
        
        
        this.controls = new Controls();
        this.controls.init(this, this.sponge);


        this.txt_clickTo = this.add.sprite(Cs.SCREEN_SIZE.WIDTH / 2, 250, 'click_to');
        this.txt_startLogo = this.add.sprite(Cs.SCREEN_SIZE.WIDTH / 2, 395, 'start_logo');

        
        this.tweens.add({
            targets: this.txt_clickTo,
            y: 280,
            duration: 750,
            ease: 'Back.Out'
        });
        this.tweens.add({
            targets: this.txt_startLogo,
            y: 365,
            duration: 750,
            ease: 'Back.Out'
        });
        
    }


    private initFonts() {
        const localThis = this;
        WebFont.load({
            custom: {
                families: [ 'Double_Bubble_shadow' ]
            },
            active: function () {
                localThis.timeText = localThis.add.text(Cs.SCREEN_SIZE.WIDTH / 2 - 120, 5, '00:00:00', { fontFamily: 'Double_Bubble_shadow', fontSize: 64, color: '#FF4F00' });
                localThis.cleanCompletionText = localThis.add.text(Cs.PLATE_POS.X - 50, Cs.PLATE_POS.X - 50, '', { fontFamily: 'Double_Bubble_shadow', fontSize: 72, color: '#FF4F00' });
                localThis.cleanCompletionText.setActive(false);
            }
        });
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
        this.brushes = { 
            [BrushType.NORMAL_BRUSH]: [],
            [BrushType.HARD_BRUSH]: [], 
            [BrushType.SUPER_BRUSH]: [this.add.sprite(-1000, -1000, BrushType.SUPER_BRUSH)]
        };

        for (let i = 0; i < 3; i++) {
            const spNormal = this.add.sprite(-1000, -1000, BrushType.NORMAL_BRUSH);
            const spHard = this.add.sprite(-1000, -1000, BrushType.HARD_BRUSH);
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

        const diffs = [
            Difficulty.EASY,
            Difficulty.EASY,
            Difficulty.STANDARD,
            Difficulty.STANDARD,
            Difficulty.HARD];

        for(const diff of diffs) {
            const plate = new Plate(this, (!this.plates.length) ? 0 : Utils.getRandomInt(7));
            this.plates.push(plate);
            plate.initStains(diff);
            plate.hide();
        }

        this.getCurrentPlate().show();
        this.getCurrentPlate().setPos(Cs.PLATE_POS.X, Cs.PLATE_POS.Y);
        this.cleanChecker.initWithStains(this.getCurrentPlate().stains);
    }


    getCurrentPlate(): Plate {
        return this.plates[0];
    }


    update(time: number, delta: number): void {


        this.updateGameTime();

        switch(this.step) {
            case GameStep.INTRO:

                break;
            case GameStep.STARTING:

                break;
            case GameStep.PLAY:

                break;
            case GameStep.RINSE:

                break;
                case GameStep.CLEAN_CHECK:

                break;
            case GameStep.NEXT_PLATE:

                break;
                case GameStep.GAME_OVER:

                break;
        }
    }

    public start() {
        this.step = GameStep.PLAY;
        this.startTime = new Date().getTime();
    }

    public hasStep(s: GameStep): boolean {
        return this.step === s;
    }


    private isGamingStep() {
        return ![GameStep.INTRO, GameStep.STARTING, GameStep.GAME_OVER].find( s => s === this.step)
    }


    private updateGameTime() {
        if (!this.startTime || !this.timeText || !this.isGamingStep()) return;


        this.deltaTime = (new Date().getTime() - this.startTime);
        const sDeltaTime = Math.floor(this.deltaTime / 1000);
        
        const minutes = Math.floor(sDeltaTime / 60);
        const seconds = Math.floor(sDeltaTime - minutes * 60);
        const milli = Math.floor((this.deltaTime - sDeltaTime * 1000) / 10);

        const formatValue = val => (val < 10 ? '0' : '') + String(val);
        this.timeText.setText(formatValue(minutes) + ':' + formatValue(seconds) + ':' + formatValue(milli));
    }


    public hideLogo() {
        this.tweens.add({
            targets: [this.txt_clickTo, this.txt_startLogo],
            alpha: 0,
            duration: 400,
            ease: 'Sine.easeInOut'
        });
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
