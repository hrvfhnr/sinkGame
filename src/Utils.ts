import Rand, {PRNG} from 'rand-seed';

export default class Utils {

    private static srand: Rand;
    private static seed: string;
    //XXX 26750
    //8112994
    //2970784
    //1612922

    static getRandomInt(max: number): number {
        return Math.floor(this.srand.next() * max);
    }


    static initSeed() {
        if (this.srand) return;

        this.seed = String(Math.floor(Math.random() * 9999999));

        this.seed = '8112994'; // weekly forcing
        this.srand= new Rand(this.seed);

        console.log('seed: ' + this.seed);
    }


    static getRandom(): number {
        return this.srand.next();
    }

    // return -1 | 1
    static getRandomSide(): number { 
        return this.getRandomInt(2) * 2 - 1;
    }

    static getRandomElement(fromArray: unknown[]) {
        if (!fromArray) return null;
        return fromArray[this.getRandomInt(fromArray.length)] ;
    }


    static switchSprite(sp: Phaser.GameObjects.Sprite, visible: boolean) {
        if (!sp) return;
        sp.setActive(visible);
        sp.setVisible(visible);
    }

    //static getRandomWeight() {} //TODO
}