import * as Phaser from 'phaser';
import WashGame from './game';
import Cs from './cs';


type DirtyPixel = {
    x: number;
    y: number;
}

export default class CleanChecker {

    static CLEAN_MAX_ALPHA = 50;
    static CLEAN_MAX_DIRTY_PIXELS = 100;

    static LAST_SCRAPE_MAX_ALPHA = 80;
    static LAST_SCRAPE_MAX_DIRTY_PIXELS = 160;

    static CLEAN_MIN_ALPHA = 20;

    game: WashGame;
    stainCanvas: Phaser.Textures.CanvasTexture;
    checkCanvas: Phaser.Textures.CanvasTexture;
    stains: Phaser.GameObjects.RenderTexture;
    dirtyPixels: DirtyPixel[];
    totalDirty: number;

    cleaningPercent: number;

    isClean: boolean; //success
    canBeLastScraped: boolean; //can activate super brush

    


    constructor(withGame: WashGame) {
        this.game = withGame;
        this.stainCanvas = this.game.textures.createCanvas('cleanChecker_stains', Cs.STAIN_RENDER_SIZE, Cs.STAIN_RENDER_SIZE);
        this.checkCanvas = this.game.textures.createCanvas('cleanChecker_check', Cs.STAIN_RENDER_SIZE, Cs.STAIN_RENDER_SIZE);
        this.resetCleanState();
    }

    private resetCleanState() {
        this.isClean = false;
        this.canBeLastScraped = false;
        this.cleaningPercent = 0.0;
    }


    public initWithStains(withStains: Phaser.GameObjects.RenderTexture) {
        this.stains = withStains;
        this.initPixels();
        this.resetCleanState();
    }


    public initPixels() {
        const localThis = this;
        const onFullSnapchot = function(image: HTMLImageElement) {
            localThis.dirtyPixels = [];

            localThis.stainCanvas.clear();
            localThis.stainCanvas.draw(0, 0, image, true);

            const color: Phaser.Display.Color = new Phaser.Display.Color(0, 0, 0);

            for(let x = 0; x < localThis.stainCanvas.width; x++) {
                for(let y = 0; y < localThis.stainCanvas.height; y++) {
                    localThis.stainCanvas.getPixel(x, y, color);
                    if (color.alpha > CleanChecker.CLEAN_MIN_ALPHA)
                        localThis.dirtyPixels.push({x: x, y: y});
                }
            }

            localThis.totalDirty = localThis.dirtyPixels.length;
        };
        

        this.stains.snapshot(onFullSnapchot);
    }


    public check() {
        if (!this.stains) return;

        console.log('start check');

        this.isClean = false;
        const localThis = this;

        const onFullSnapchot = function(image: HTMLImageElement) {
            const startTime = new Date();
            console.log(startTime);

            localThis.checkCanvas.clear();
            localThis.checkCanvas.draw(0, 0, image, true);

            const color: Phaser.Display.Color = new Phaser.Display.Color(0, 0, 0);
            const stillDirty: DirtyPixel[] = [];

            let maxAlpha = 0;
            let avgAlpha = 0;
            let countAlpha = 0;

            for(const pixel of localThis.dirtyPixels) {
                localThis.checkCanvas.getPixel(pixel.x, pixel.y, color);
                if (color.alpha > CleanChecker.CLEAN_MIN_ALPHA) {
                    stillDirty.push(pixel);
                    if (color.alpha > maxAlpha)
                        maxAlpha = color.alpha;
                    countAlpha++;
                    avgAlpha += color.alpha;
                }
            }

            avgAlpha = countAlpha ? (avgAlpha / countAlpha) : 0;

            const endTime = new Date();
            console.log(endTime);
            console.log('stillDirty:' + stillDirty.length);
            
            localThis.cleaningPercent = Number((((localThis.totalDirty - stillDirty.length) / localThis.totalDirty) * 100).toFixed(2));

            console.log('cleanCompletion: ' + localThis.cleaningPercent + '%');
            console.log('MAX ALPHA : ' + maxAlpha);
            console.log('AVG ALPHA : ' + avgAlpha);
            localThis.dirtyPixels = stillDirty;

            localThis.canBeLastScraped = maxAlpha <= CleanChecker.LAST_SCRAPE_MAX_ALPHA && stillDirty.length <= CleanChecker.LAST_SCRAPE_MAX_DIRTY_PIXELS;
            localThis.isClean = maxAlpha <= CleanChecker.CLEAN_MAX_ALPHA && stillDirty.length <= CleanChecker.CLEAN_MAX_DIRTY_PIXELS;
        };

        this.stains.snapshot(onFullSnapchot);
    }



}
