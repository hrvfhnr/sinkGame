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

    //txt_clickTo: Phaser.GameObjects.Sprite;
    txt_startLogo: Phaser.GameObjects.Sprite;
    txt_rinse: Phaser.GameObjects.Sprite;

    txt_start_3: Phaser.GameObjects.Sprite;
    txt_start_2: Phaser.GameObjects.Sprite;
    txt_start_1: Phaser.GameObjects.Sprite;
    txt_start_go: Phaser.GameObjects.Sprite;

    introLock: boolean;


    constructor () {
        super('WashGame');

        this.step = GameStep.INTRO;

        this.startTime = null;
        this.deltaTime = null;
        this.introLock = true;
    }


    init() {
        const element = document.createElement('style');
        document.head.appendChild(element);
        const sheet = element.sheet;
        let styles = '@font-face { font-family: "Double_Bubble_shadow"; src: url("assets/fonts/Double_Bubble_shadow.otf") format("opentype"); }\n';
        sheet.insertRule(styles, 0);

        Utils.initSeed();
    }


    preload () {

        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    
        this.load.image('background', 'assets/background.png');
        this.load.image('backgroundFog', 'assets/bgFog.png');
        this.load.image('foreground', 'assets/foreground.png');

        this.load.image('mug', 'assets/mug.png');
        this.load.image('cup', 'assets/coffeeCup.png');

        this.load.image('sponge', 'assets/sponge.png');
        this.load.image('stain_cropper', 'assets/stain_cropper.png');
        this.load.image('plate_mask', 'assets/renderTexture_plate_mask.png');

        //scraping brushes        
        this.load.image('brush_normal', 'assets/brush_normal.png');
        this.load.image('brush_hard', 'assets/brush_hard.png');
        this.load.image('brush_super', 'assets/brush_super.png');

        //text imgs
        this.load.image('start_logo', 'assets/texts/startLogo.png');
        //this.load.image('click_to', 'assets/texts/clickTo.png');
        this.load.image('rinse', 'assets/texts/rinse.png');

        this.load.image('start_3', 'assets/texts/3.png');
        this.load.image('start_2', 'assets/texts/2.png');
        this.load.image('start_1', 'assets/texts/1.png');
        this.load.image('start_go', 'assets/texts/go.png');

        this.load.image('clean_ok', 'assets/texts/propre_ok.png');
        this.load.image('clean_nope', 'assets/texts/propre_no.png');
        this.load.image('clean_100', 'assets/texts/100.png');

        

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

        const background = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'background');
        this.addToLayer(background, Cs.LAYER.BG_0);

        const backgroundFog = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'backgroundFog');
        this.addToLayer(backgroundFog, Cs.LAYER.BG_1);
        backgroundFog.alpha = 0.25;

        const foreground = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT, 'foreground');
        this.addToLayer(foreground, Cs.LAYER.FG);

        const bgMug = this.add.image(160, 550, 'mug');
        this.addToLayer(bgMug, Cs.LAYER.BG_0);
        bgMug.setRotation(3.14);
        bgMug.scale = 0.5;

        const bgCup = this.add.image(45, 580, 'cup');
        this.addToLayer(bgCup, Cs.LAYER.BG_0);
        bgCup.setRotation(3.14);
        bgCup.scale = 0.4;


        this.txt_rinse = this.add.sprite(Cs.RINSE_POS.X + 600, Cs.RINSE_POS.Y, 'rinse');
        this.addToLayer(this.txt_rinse, Cs.LAYER.FG);
        this.txt_rinse.alpha = 0.5;


        this.txt_start_3 = this.add.sprite(Cs.STARTING_POS.X, Cs.STARTING_POS.Y, 'start_3');
        this.addToLayer(this.txt_start_3, Cs.LAYER.FX);
        Utils.switchSprite(this.txt_start_3, false);


        this.txt_start_2 = this.add.sprite(Cs.STARTING_POS.X, Cs.STARTING_POS.Y, 'start_2');
        this.addToLayer(this.txt_start_2, Cs.LAYER.FX);
        Utils.switchSprite(this.txt_start_2, false);

        this.txt_start_1 = this.add.sprite(Cs.STARTING_POS.X, Cs.STARTING_POS.Y, 'start_1');
        this.addToLayer(this.txt_start_1, Cs.LAYER.FX);
        Utils.switchSprite(this.txt_start_1, false);

        this.txt_start_go = this.add.sprite(Cs.STARTING_POS.X, Cs.STARTING_POS.Y, 'start_go');
        this.addToLayer(this.txt_start_go, Cs.LAYER.FX);
        Utils.switchSprite(this.txt_start_go, false);

        this.sponge = new Sponge(this);
        this.add.existing(this.sponge);
        this.addToLayer(this.sponge, Cs.LAYER.SPONGE);
        this.cleanChecker = new CleanChecker(this);
        this.initPlates();
        
        
        this.controls = new Controls();
        this.controls.init(this, this.sponge);


        //this.txt_clickTo = this.add.sprite(Cs.SCREEN_SIZE.WIDTH / 2, 300, 'click_to');
        this.txt_startLogo = this.add.sprite(Cs.SCREEN_SIZE.WIDTH / 2, 445, 'start_logo');
        this.txt_startLogo.alpha = 0;
        /*this.tweens.add({
            targets: this.txt_clickTo,
            y: 330,
            duration: 750,
            ease: 'Back.Out'
        });*/
        const localThis = this;
        this.tweens.add({
            targets: this.txt_startLogo,
            y: 400,
            duration: 750,
            ease: 'Back.Out',
            onComplete: () => {
                localThis.introLock = false;
            }
        });
        this.tweens.add({
            targets: this.txt_startLogo,
            alpha: 1,
            duration: 750,
            ease: 'Sine.easeInOut',
        });
    }


    private initFonts() {
        const localThis = this;
        WebFont.load({
            custom: {
                families: [ 'Double_Bubble_shadow' ]
            },
            active: function () {
                localThis.timeText = localThis.add.text(Cs.SCREEN_SIZE.WIDTH - 255, 5, '00:00:00', { fontFamily: 'Double_Bubble_shadow', fontSize: 64, color: '#FF4F00' });
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

        for(const diff of diffs.reverse()) {
            const plate = new Plate(this, (this.plates.length === 4) ? 0 : Utils.getRandomInt(7));
            this.plates.unshift(plate);
            plate.initStains(diff);
            //plate.hide();
            plate.placeIntoSink();
        }
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

    public prepareStart() {
        this.step = GameStep.STARTING;

        const localThis = this;


        let initialDelay = 750;

        let tweenTime = 800;

        for (const sp of [this.txt_start_3, this.txt_start_2, this.txt_start_1, this.txt_start_go]) {
            Utils.switchSprite(sp, true);
            sp.alpha = 0;
            sp.scale = 0;

           this.tweens.add({
                targets: sp,
                scale: 1
                duration: tweenTime,
                ease: 'Back.Out',
                delay: initialDelay
            });
            this.tweens.add({
                targets: sp,
                alpha: 1
                duration: tweenTime - 100,
                ease: 'Sine.easeInOut',
                delay: initialDelay
            });
            if ( sp !== this.txt_start_go) {
                this.tweens.add({
                    targets: sp,
                    alpha: 0
                    duration: 200,
                    ease: 'Sine.InOut',
                    delay: initialDelay + tweenTime + 120
                });
            } else {
                this.tweens.add({
                    targets: sp,
                    alpha: 0
                    duration: 200,
                    ease: 'Sine.InOut',
                    delay: initialDelay + tweenTime + 120
                });
                this.tweens.add({
                    targets: sp,
                    scale: 10
                    duration: 200,
                    ease: 'Sine.InOut',
                    delay: initialDelay + tweenTime + 120,
                    onStart: () => { localThis.startGame(); }
                });
                
            }

            initialDelay += 1200;
        }
    
    }

    public startGame() {
        this.step = GameStep.PLAY;
        this.nextPlate();

        this.tweens.add({
            targets: this.txt_rinse,
            x: Cs.RINSE_POS.X,
            rotation: 0,
            duration: 1000,
            ease: 'Back.Out',
            delay: 3000,
        });

    }


    public nextPlate() {
        const plate = this.getCurrentPlate();
        if (!plate) return; //TODO : game over

        plate.killCurrentTween();
        
        this.cleanChecker.initWithStains(plate.stains);

        const localThis = this;
        
        this.tweens.add({
            targets: plate.sp,
            x: Cs.PLATE_POS.X,
            y: Cs.PLATE_POS.Y,
            rotation: 0,
            duration: 1000,
            ease: 'Back.InOut',
            delay: 350,
            onComplete: () => { localThis.startTime = new Date().getTime(); }
        });
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
            targets: this.txt_startLogo,
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
