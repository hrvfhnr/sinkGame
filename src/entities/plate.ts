import * as Phaser from 'phaser';
import WashGame from "../game";
import Cs from '../cs';
import Utils from '../Utils';
import { StainColor, Difficulty, BrushType } from '../types';

export default class Plate {

    game: WashGame;
    plateId: number;
    difficulty: Difficulty;
    
    sp: Phaser.GameObjects.Container;
    bgPlate: Phaser.GameObjects.Sprite;
    stains: Phaser.GameObjects.RenderTexture;
    //foam: Phaser.GameObjects.Container;

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
        
        this.sp.add([this.bgPlate, this.stains]);
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
            stainSprite.setScale(1.0 + scaleSide * Math.random() * Cs.STAIN_SCALE_RATIO * (scaleSide > 0 ? 3 : 1));
            stainSprite.setRotation(Math.random() * 6.28);

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


    public scrape(x: number, y: number) {
        //const localPos = this.scrapeZone.getLocalPoint(x, y);
        //this.scrapeZone.draw('brush_eps_75', localPos.x, localPos.y);
        const localPos = this.stains.getLocalPoint(x, y);

        let brush: BrushType = BrushType.NORMAL_BRUSH;
        switch(this.difficulty) {
            case Difficulty.EASY:
                brush = BrushType.NORMAL_BRUSH;
                break;
            case Difficulty.STANDARD:
                brush = (Math.random() < 0.2) ? BrushType.HARD_BRUSH: BrushType.NORMAL_BRUSH;
                break;
            case Difficulty.HARD:
                brush = (Math.random() < 0.6) ? BrushType.HARD_BRUSH: BrushType.NORMAL_BRUSH;
                break;
        }

        this.stains.erase(brush, localPos.x - 128 / 2, localPos.y - 162 / 2);
    }


    public setPos(nx: number, ny: number) {
        this.sp.x = nx;
        this.sp.y = ny;
    }
}