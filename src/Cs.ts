import { StainColor } from "./types";

export default class Cs {

    public static SCREEN_SIZE = { WIDTH: 1000, HEIGHT: 750 };
    public static PLATE_POS = { X: 650, Y: 320 };
    public static RINSE_POS = { X: 695, Y: 620 };
    public static STARTING_POS = { X: Cs.SCREEN_SIZE.WIDTH / 2, Y: Cs.SCREEN_SIZE.HEIGHT / 2 + 75 };

    public static STAIN_RENDER_SIZE = 512;
    public static STAIN_OFFSET = 50;
    public static STAIN_SCALE_RATIO = 0.35;

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


    public static LAYER = {
        BG_0: 0,
        BG_1: 1,
        PLATE: 2,
        FG: 3,
        SPONGE: 4,
        FX: 5
    };


}
