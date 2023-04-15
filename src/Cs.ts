import { StainColor } from "./Stain";

export default class Cs {

    public static SCREEN_SIZE = { WIDTH: 1000, HEIGHT: 750 };

    public static STRAIN_RENDER_SIZE = 512;

    public static STAINS: { color: StainColor, count: number}[] = [
        { color: StainColor.RED, count: 4 },
        { color: StainColor.BEIGE, count: 6 },
        { color: StainColor.BROWN, count: 5 },
        { color: StainColor.YELLOW, count: 3 }
    ];

    public static PLATE_WEIGHTS: { plateId: number, weight: number}[] = [
        { plateId: 0, weight: 30 },
        { plateId: 1, weight: 10 },
        { plateId: 2, weight: 15 },
        { plateId: 3, weight: 10 },
        { plateId: 4, weight: 20 },
        { plateId: 5, weight: 5 },
        { plateId: 6, weight: 10 }
    ];


}
