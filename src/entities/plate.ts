import * as Phaser from 'phaser';
import WashGame from "../game";
import Cs from '../cs';
import Utils from '../Utils';
import { StainColor, Difficulty, BrushType, GameStep } from '../types';

export default class Plate {

    game: WashGame;
    plateId: number;
    difficulty: Difficulty;
    
    sp: Phaser.GameObjects.Container;
    bgPlate: Phaser.GameObjects.Sprite;
    stains: Phaser.GameObjects.RenderTexture;
    spTexts: Phaser.GameObjects.Container;

    txt_completion: Phaser.GameObjects.Text;
    txt_completionDone: Phaser.GameObjects.Sprite;
    txt_cleanNo: Phaser.GameObjects.Sprite;
    txt_cleanOk: Phaser.GameObjects.Sprite;
    

    //foam: Phaser.GameObjects.Container;

    currentTween: Phaser.Tweens.Tween;

    constructor (wGame: WashGame, plateId: number) {
        this.game = wGame;
        this.plateId = plateId;

        this.initGraphics();
    }


    private initGraphics() {
        this.sp = this.game.add.container(0, 0);
        this.game.addToLayer(this.sp, Cs.LAYER.PLATE);

        //this.game.input.enableDebug(this.sp);

        const plateOffsetInit = {x: 11, y: 15};

        this.bgPlate = this.game.add.sprite(plateOffsetInit.x, plateOffsetInit.y, 'plate_' + String(this.plateId));
        this.stains = this.game.add.renderTexture(0, 0, Cs.STAIN_RENDER_SIZE, Cs.STAIN_RENDER_SIZE);
        this.spTexts = this.game.add.container(0, -20);

        this.sp.add([this.bgPlate, this.stains, this.spTexts]);

        this.txt_completionDone = this.game.add.sprite(0, 0, 'clean_100');
        this.txt_cleanNo = this.game.add.sprite(0, 65, 'clean_nope');
        this.txt_cleanOk = this.game.add.sprite(-1, 62, 'clean_ok');

        this.spTexts.add([this.txt_completionDone, this.txt_cleanNo, this.txt_cleanOk]);

        Utils.switchSprite(this.txt_completionDone, false);
        Utils.switchSprite(this.txt_cleanOk, false);
        Utils.switchSprite(this.txt_cleanNo, false);
        this.spTexts.setVisible(false);
        this.spTexts.setActive(false);

    }

    public initCompletionText() {
        this.txt_completion = this.game.add.text(0, 0, '00,00%', { fontFamily: 'Double_Bubble_shadow', fontSize: 92, color: '#FF4F00' });
        this.txt_completion.setOrigin(0.5);
        this.spTexts.add(this.txt_completion);


        this.txt_completion.setVisible(false);
        this.txt_completion.setActive(false);
    }

    public initStains(diff: Difficulty) {
        this.stains.clear();

        this.difficulty = diff;

        const stainCount = 8 + Utils.getRandomInt(4) + this.difficulty * 4;

        const allColors = [StainColor.RED, StainColor.BEIGE, StainColor.BROWN, StainColor.YELLOW];
        const colorTochoose = Math.min(2 + Utils.getRandomInt(2), allColors.length);
        const avColors: StainColor[] = [];
        for (let i = 0; i < colorTochoose; i++) {
            if (!allColors.length) break;
            const newColor: StainColor = Utils.getRandomElement(allColors) as StainColor;
            allColors.splice(allColors.findIndex(item => item === newColor),1);
            avColors.push(newColor);
        }

        const offset = 15;
        for(let i = 0; i < stainCount; i++) {
            const col = Utils.getRandomElement(avColors) as StainColor;
            const colorMax = Cs.STAINS.find(item => item.color === col).count;
            const colIndex = Utils.getRandomInt(colorMax);

            const pos = this.getRandomStainPosition();

            const stainSprite = this.game.add.sprite( -500, -500, `stain_${col}_${colIndex}`);

            const scaleSide = Utils.getRandomSide();
            stainSprite.setScale(1.0 + scaleSide * Utils.getRandom() * Cs.STAIN_SCALE_RATIO * (scaleSide > 0 ? 3 : 1));
            stainSprite.setRotation(Utils.getRandom() * 6.28);

            this.stains.draw(stainSprite, pos.x, pos.y);
            stainSprite.destroy();
        }

        this.stains.erase('stain_cropper', 0, 0);

    }


    private getRandomStainPosition(): {x : number, y: number} {
        return {
            x : Cs.STAIN_OFFSET + Utils.getRandomInt(Cs.STAIN_RENDER_SIZE - Cs.STAIN_OFFSET * 2),
            y : Cs.STAIN_OFFSET + Utils.getRandomInt(Cs.STAIN_RENDER_SIZE - Cs.STAIN_OFFSET * 2)
        };
    }

    public resetClean() {
        //TODO
    }


    public hide() {
        this.setPos(Cs.PLATE_POS.X, Cs.PLATE_POS.Y - 1200);
        this.sp.setActive(false);
        this.sp.setVisible(false);
    }

    public show() {
        this.sp.setActive(true);
        this.sp.setVisible(true);
    }


    public killCurrentTween() {
        if (!this.currentTween) return;

        this.currentTween.stop();
        this.currentTween = null;
    }


    public placeIntoSink() {
        const sinkPos = { x: 530 + Utils.getRandomInt(300) , y: 830 - Utils.getRandomInt(40) };
        this.setPos(sinkPos.x, sinkPos.y - 10 + Math.random() * 10);
        this.sp.setRotation(Utils.getRandom() + 1.5 * Utils.getRandomSide());
        this.show();

        this.currentTween = this.game.tweens.add({
                targets: this.sp,
                y: sinkPos.y,
                duration: 6000 + Utils.getRandomInt(4, true) * 1000,
                ease: 'Elastic.Out',
        });
    }


    public rinseResult() {
        const localThis = this;


        this.game.tweens.add({
            targets: this.sp,
            y: Cs.PLATE_POS.Y,
            duration: 1000,
            ease: 'Back.Out',
            onComplete: () => { localThis.game.setStep(GameStep.PLAY) }
        });
    }


    public scrape(x: number, y: number) {

        console.log('scrape: ' + this.game.hasStep(GameStep.PLAY));
        if (!this.game.hasStep(GameStep.PLAY)) return;

        //const localPos = this.scrapeZone.getLocalPoint(x, y);
        //this.scrapeZone.draw('brush_eps_75', localPos.x, localPos.y);
        const localPos = this.stains.getLocalPoint(x, y);

        let brushType: BrushType = BrushType.NORMAL_BRUSH;
        switch(this.difficulty) {
            case Difficulty.EASY:
                brushType = BrushType.NORMAL_BRUSH;
                break;
            case Difficulty.STANDARD:
                brushType = (Math.random() < 0.2) ? BrushType.HARD_BRUSH: BrushType.NORMAL_BRUSH;
                break;
            case Difficulty.HARD:
                brushType = (Math.random() < 0.6) ? BrushType.HARD_BRUSH: BrushType.NORMAL_BRUSH;
                break;
        }

        //force super brush to help on last dirty pixels
        if (this.game.cleanChecker.canBeLastScraped) {
            brushType = BrushType.SUPER_BRUSH;
            console.log("USE SUPER BRUSH");
        }
        
        this.stains.erase(this.game.getBrushByType(brushType), localPos.x, localPos.y);
    }


    public setPos(nx: number, ny: number) {
        this.sp.x = nx;
        this.sp.y = ny;
    }
}