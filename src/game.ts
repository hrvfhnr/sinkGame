import * as Phaser from 'phaser';
import Controls from './controls';
import Sponge from './entities/sponge';
import Plate from './entities/plate';
import Cs from './cs';
import Utils from './Utils';
import { Difficulty, BrushType, GameStep } from './types';
import CleanChecker from "./CleanChecker";

export default class WashGame extends Phaser.Scene {

    private step: GameStep;
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
    finalTimeText: Phaser.GameObjects.Text;


    txt_startLogo: Phaser.GameObjects.Sprite;
    txt_rinse: Phaser.GameObjects.Sprite;

    txt_start_3: Phaser.GameObjects.Sprite;
    txt_start_2: Phaser.GameObjects.Sprite;
    txt_start_1: Phaser.GameObjects.Sprite;
    txt_start_go: Phaser.GameObjects.Sprite;

    redFail: Phaser.GameObjects.Image;

    //particles systems
    gameOverPartShape: Phaser.Geom.Rectangle;
    gameOverFoamEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    sinkPartShape: Phaser.Geom.Rectangle;
    sinkFoamEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    introLock: boolean;


    constructor () {
        super('WashGame');

        this.setStep(GameStep.INTRO);

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

        this.load.image('redFail', 'assets/redFail.png');

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
        this.load.image('clean_nope', 'assets/texts/propre_no_2.png');
        this.load.image('clean_100', 'assets/texts/100.png');
        this.load.image('gameOver_text', 'assets/texts/gameOverText.png');

        //particles
        this.load.image('whiteSparkles', 'assets/particles/whiteSparkles.png');
        this.load.atlas('foams', 'assets/particles/foams.png', 'assets/particles/foam.json');


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

        const background = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'background');
        this.addToLayer(background, Cs.LAYER.BG_0);

        const backgroundFog = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'backgroundFog');
        this.addToLayer(backgroundFog, Cs.LAYER.BG_1);
        backgroundFog.alpha = 0.25;

        const foreground = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT, 'foreground');
        this.addToLayer(foreground, Cs.LAYER.FG);

        this.redFail = this.add.image(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 'redFail');
        this.addToLayer(this.redFail, Cs.LAYER.FX);
        Utils.switchSprite(this.redFail, false);

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
        this.initFonts();
        

        this.txt_startLogo = this.add.sprite(Cs.SCREEN_SIZE.WIDTH / 2 - 200, 400, 'start_logo');
        this.txt_startLogo.alpha = 0;
        const localThis = this;

        const initialDelay = 800;

        this.tweens.add({
            targets: this.sponge,
            x: Cs.SCREEN_SIZE.WIDTH / 2,
            duration: 500,
            ease: 'Back.Out',
            delay: initialDelay
        });

        this.tweens.add({
            targets: this.txt_startLogo,
            x: Cs.SCREEN_SIZE.WIDTH / 2,
            duration: 750,
            ease: 'Back.Out',
            delay: initialDelay + 100
            onComplete: () => {
                localThis.introLock = false;
            }
        });
        this.tweens.add({
            targets: this.txt_startLogo,
            alpha: 1,
            duration: 750,
            ease: 'Sine.easeInOut',
            delay: initialDelay + 100
        });
    }


    initParticlesEmitters() {
        //gameOver background
        this.gameOverPartShape = new Phaser.Geom.Rectangle(0, Cs.SCREEN_SIZE.HEIGHT * 0.5, Cs.SCREEN_SIZE.WIDTH, Cs.SCREEN_SIZE.HEIGHT * 1.5);
        this.gameOverFoamEmitter = this.add.particles(0, 0, 'foams', {
            frame: ['foam_0', 'foam_1'],
            lifespan:  18000,
            particleBringToTop: false,
            gravityY: -4,
            speed:     1,
            scale:      { start: 0.2, end: 1.3},
            alpha:      { start: 1.0, end: 0.0, ease: 'Expo.easeIn'},
            angle:  {min: -45, max : 45},
            emitting: false,
            quantity: 1,
            emitZone:  { type: 'random', source: this.gameOverPartShape, quantity: 1 },
        });
        this.addToLayer(this.gameOverFoamEmitter, Cs.LAYER.GAME_OVER_0);

        //old school manual pre-warm
        this.gameOverFoamEmitter.alpha = 0;
        this.gameOverFoamEmitter.start();
        const localThis = this;
        this.time.delayedCall(13000, () => {
            localThis.gameOverFoamEmitter.pause();
        });


        //sink bubbles
        this.sinkPartShape = new Phaser.Geom.Rectangle(360, 600, 630, 70);
        this.sinkFoamEmitter = this.add.particles(0, 0, 'foams', {
            frame: ['foam_1', 'foam_2', 'bubble_0', 'bubble_1', 'foam_1', 'bubble_0', 'bubble_1', 'bubble_2', 'bubble_2'],
            lifespan:  {min: 1500, max: 3000},
            speedY: { min: -15, max : -60 },
            speedX: {min: -20, max: 20 },
            rotate: { min: -90, max : 90 },
            //angle: {min: -180, max:  180 },
            //accelerationX: 0.97,
            accelerationY: { min: 1.01, max: 1.04 },
            scale:      { min: 0.7, max: 1.0},
            alpha:      { min: 0.7, max: 1.0},
            emitting: false,
            quantity: 1,
            emitZone:  { type: 'random', source: this.sinkPartShape, quantity: 2},
            duration: 530
        });
        this.addToLayer(this.sinkFoamEmitter, Cs.LAYER.SINK);

    }


    public switchGameOverParticles(active: boolean) {
        if (active)
            this.gameOverFoamEmitter.start();
        else
            this.gameOverFoamEmitter.stop();
    }


    private initFonts() {
        const localThis = this;
        WebFont.load({
            custom: {
                families: [ 'Double_Bubble_shadow' ]
            },
            active: function () {
                localThis.timeText = localThis.add.text(Cs.SCREEN_SIZE.WIDTH - 255, 5, '00:00:00', { fontFamily: 'Double_Bubble_shadow', fontSize: 64, color: '#FF4F00' });
                localThis.addToLayer(localThis.timeText, Cs.LAYER.FX);
                localThis.finalTimeText = localThis.add.text(Cs.SCREEN_SIZE.WIDTH / 2, Cs.SCREEN_SIZE.HEIGHT / 2, 
                    'Bravo!\nVaisselle propre\nen\n' + '1min 23s 03', 
                    { fontFamily: 'Double_Bubble_shadow', fontSize: 84, color: '#FF4F00', align: 'center' });
                localThis.finalTimeText.setOrigin(0.5);
                localThis.addToLayer(localThis.finalTimeText, Cs.LAYER.GAME_OVER_1);
                Utils.switchSprite(localThis.finalTimeText, false);

                for (const plate of localThis.plates)
                    plate.initCompletionText();
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
            plate.placeIntoSink();
        }
    }


    getCurrentPlate(): Plate {
        return this.plates[0];
    }


    update(time: number, delta: number): void {
        this.updateGameTime();

        /*
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
        */
    }

    public prepareStart() {
        this.setStep(GameStep.STARTING);

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

        const localThis = this;

        this.initParticlesEmitters();
        
        this.nextPlate();
        this.tweens.add({
            targets: this.txt_rinse,
            x: Cs.RINSE_POS.X,
            rotation: 0,
            duration: 1000,
            ease: 'Back.Out',
            delay: 2000,
        });

    }

    public dropCurrentPlate(): boolean {
        if (!this.plates.length) return false;

        const plate = this.plates.shift();
        Utils.switchSprite(plate.sp, false);
        return true;
    }


    public nextPlate() {
        const plate = this.getCurrentPlate();
        if (!plate) return;

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
            onComplete: () => { 
                if (!localThis.startTime)
                    localThis.startTime = new Date().getTime();
                localThis.setStep(GameStep.PLAY);
             }
        });
    } 


    public startRinse() {
        if (!this.hasStep(GameStep.PLAY)) return;

        this.setStep(GameStep.RINSE);
        const plate = this.getCurrentPlate();

        this.cleanChecker.check();  
        
        const initialDelay = 350;
        const downTime = 650;

        const localThis = this;

        this.tweens.add({
            targets: this.txt_rinse,
            alpha: 1
            duration: 150,
            ease: 'Sine.easeInOut',
            delay: 0,
        });
        this.tweens.add({
            targets: this.txt_rinse,
            scale: 0.97
            duration: 150,
            ease: 'Sine.easeInOut',
            yoyo: true
            delay: 0,
        });

        this.tweens.add({
            targets: this.txt_rinse,
            alpha: 0.5
            duration: 300,
            ease: 'Sine.easeIn',
            delay: 150,
        });

        this.time.delayedCall(initialDelay + downTime * 0.8, () => { localThis.sinkFoamEmitter.start(); });

        this.tweens.add({
            targets: plate.sp,
            y: Cs.PLATE_POS.Y + 550,
            rotation: 0,
            duration: downTime,
            ease: 'Back.In',
            delay: initialDelay,
        });
        this.tweens.add({
            targets: plate.sp,
            y: Cs.PLATE_POS.Y + 450,
            rotation: 0.5,
            duration: 460,
            ease: 'Sine.easeInOut',
            delay: initialDelay + downTime,
            yoyo: true,
        });
        this.tweens.add({
            targets: plate.sp,
            y: Cs.PLATE_POS.Y + 470,
            rotation: -0.4,
            duration: 430,
            ease: 'Quad.easeInOut',
            delay: initialDelay + downTime + 450 * 2,
            yoyo: true,
            onComplete: () => { plate.rinseResult(); }
        });   
    }

    public checkGameOver(): boolean {
        return this.plates.length <= 1 && this.cleanChecker.isClean;
    }

    public startGameOver() {
        this.setStep(GameStep.GAME_OVER);

        this.gameOverFoamEmitter.resume();
        this.input.mouse.releasePointerLock();

        const localThis = this;
        this.tweens.add({
            targets: this.gameOverFoamEmitter,
            alpha: 1,
            duration: 1000,
            ease: 'Quad.easeInOut',
            delay: 1500,
        });   

        Utils.switchSprite(this.finalTimeText, true);
        this.finalTimeText.scale = 0;

        this.tweens.add({
            targets: this.finalTimeText,
            scale: 1,
            duration: 4000,
            ease: 'Elastic.Out',
            delay: 3500
        });

    }


    public hasStep(s: GameStep): boolean {
        return this.step === s;
    }

    public setStep(s: GameStep) {
        this.step = s;
    }

    private isGamingStep() {
        const localThis = this;
        for (const s of [GameStep.INTRO, GameStep.STARTING, GameStep.GAME_OVER]) {
            if (this.hasStep(s))
                return false;
        }
        return true;
    }


    private updateGameTime() {
        if (!this.startTime || !this.timeText || !this.isGamingStep())
            return;

        this.deltaTime = (new Date().getTime() - this.startTime);
        const sDeltaTime = Math.floor(this.deltaTime / 1000);
        
        const minutes = Math.floor(sDeltaTime / 60);
        const seconds = Math.floor(sDeltaTime - minutes * 60);
        const milli = Math.floor((this.deltaTime - sDeltaTime * 1000) / 10);

        const formatValue = (val, twoDigits = true) => (twoDigits && val < 10 ? '0' : '') + String(val);
        this.timeText.setText(formatValue(minutes) + ':' + formatValue(seconds) + ':' + formatValue(milli));
        this.finalTimeText.setText( 'Bravo!\nVaisselle propre en\n' + formatValue(minutes, false) + 'm ' + formatValue(seconds, false) + 's ' + formatValue(milli));
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
