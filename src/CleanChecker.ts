import * as Phaser from 'phaser';
import WashGame from "./game";

type DirtyPixel = {
    x: number;
    y: number;
}

export default class CleanChecker {
    stains: Phaser.GameObjects.RenderTexture;
    dirtyPixels: DirtyPixel[];

    constructor(withStains: Phaser.GameObjects.RenderTexture) {
        this.stains = withStains;
        //this.initPixels();
    }


    //TODO : 
    /*
    - check whole snapshot time in AUTO and CANVAS mode
    - check per pixel check on grabbed image
    */

    public initPixels() {
        console.log("start initPixels");
        const dirtyPix = [];
        let waitFor:number = this.stains.width * this.stains.height;

        let currentPixel: DirtyPixel | null = null;
        const onSnapshot = function(col: Phaser.Display.Color) {
            if (!currentPixel) {
                console.log('ERROR : MISSING RETURN PIXEL');
                return;
            }

            //console.log('callback DONE : ' + currentPixel.x + ', ' + currentPixel.y + ' -> ' + col.alpha);
            if (col.alpha > 0) {
                dirtyPix.push(currentPixel);
            }
            currentPixel = null;
        }

        const startTime = new Date();
        console.log(startTime);

        const leftPixels = [];
        for(let x = 0; x < this.stains.width; x++) {
            for(let y = 0; y < this.stains.height; y++) {
                leftPixels.push({x : x, y: y});
            }
        }

        while(currentPixel || leftPixels.length) {
            if (currentPixel)
                continue;
            currentPixel = leftPixels.pop();
            this.stains.snapshotPixel(currentPixel.x, currentPixel.y, onSnapshot);
        }
        console.log('leftPixels.length post:' + leftPixels.length);
        console.log('dirtyPixels.length :' + dirtyPix.length);
        const endTime = new Date();
        console.log(endTime);
        console.log("diff = " + (endTime.getTime() - startTime.getTime()));

        this.dirtyPixels = dirtyPix;
    }

}
