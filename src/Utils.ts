export default class Utils {
    static getRandomInt(max: number): number {
        return Math.floor(Math.random() * max);
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