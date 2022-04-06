import { ControllerPainting, eIController } from "../dist/index";
export declare const PadCornerList: readonly ["SW", "SE", "NW", "NE"];
export declare type PadCorner = typeof PadCornerList[number];
export interface RG {
    r: number;
    g: number;
}
export interface HV {
    hue: number | "keep";
    value: number | "keep";
}
export declare const DEFAULT_HUE = 64;
export declare const RED = 0;
export declare const ORANGE = 45;
export declare const YELLOW = 104;
export declare const GREEN = 127;
export declare const DEFAULT_VALUE = 127;
export declare const EYE_UP = 0;
export declare const EYE_DOWN = 64;
export declare type PadCornerInputState = {
    x: number;
    y: number;
    noteOn: boolean;
    listeners: Record<PadCorner, Array<(isOn: boolean) => any>>;
};
export declare type QuneoActionArgs = {
    out: {
        cc: number;
    } | {
        note: number;
        rg?: true;
    };
};
declare const controllerActions: {
    diamond: {
        note: number;
        out: {
            note: number;
        };
    };
    square: {
        note: number;
        out: {
            note: number;
        };
    };
    triangle: {
        note: number;
        out: {
            note: number;
        };
    };
    bank1Left: {
        note: number;
        out: {
            note: number;
        };
    };
    bank1Right: {
        note: number;
        out: {
            note: number;
        };
    };
    bank1SliderX: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    bank1SliderPressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    bank2Left: {
        note: number;
        out: {
            note: number;
        };
    };
    bank2Right: {
        note: number;
        out: {
            note: number;
        };
    };
    bank2SliderX: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    bank2SliderPressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    bank3Left: {
        note: number;
        out: {
            note: number;
        };
    };
    bank3Right: {
        note: number;
        out: {
            note: number;
        };
    };
    bank3SliderX: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    bank3SliderPressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    bank4Left: {
        note: number;
        out: {
            note: number;
        };
    };
    bank4Right: {
        note: number;
        out: {
            note: number;
        };
    };
    bank4SliderX: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    bank4SliderPressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    eye1: {
        note: number;
        out: {
            cc: number;
        };
    };
    eye2: {
        note: number;
        out: {
            cc: number;
        };
    };
    nose: {
        note: number;
        out: {
            note: number;
            rg: true;
        };
    };
    tooth1Y: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    tooth1Pressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    tooth2Y: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    tooth2Pressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    tooth3Y: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    tooth3Pressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    tooth4Y: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    tooth4Pressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    vertArrows1Up: {
        note: number;
        out: {
            note: number;
        };
    };
    vertArrows1Down: {
        note: number;
        out: {
            note: number;
        };
    };
    vertArrows2Up: {
        note: number;
        out: {
            note: number;
        };
    };
    vertArrows2Down: {
        note: number;
        out: {
            note: number;
        };
    };
    largeSliderX: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
    largeSliderPressure: {
        cc: number;
        channel: number;
        out: {
            cc: number;
        };
    };
};
export declare class QuneoController extends eIController<QuneoActionArgs> {
    static readonly padLeds: Map<string, Record<"SW" | "SE" | "NW" | "NE", number>>;
    constructor();
    padPosFromRowCol(rowCol: {
        row: number;
        col: number;
    }): {
        num: number;
        corner: "SW" | "SE" | "NW" | "NE";
    };
    protected padCornerInputStates: Map<number, PadCornerInputState>;
    onPadRowColAction(rowCol: {
        row: number;
        col: number;
    }, cb: (isOn: boolean) => any): void;
    createPadPainting(id: string, group: string): ControllerPainting<{
        cc: number;
        channel: number;
    } | {
        note: number;
        channel: number;
    }, number | Record<keyof HV, number>> & {
        setItem(name: keyof typeof controllerActions, value: HV | number): void;
        setPad(name: string, color: HV): void;
        setPadCornerRowCol(pos: {
            row: number;
            col: number;
        }, color: HV): void;
        setPadCorner(args: {
            name: string;
            corner: PadCorner;
            color: HV;
        }): void;
        clearPad(name: string): void;
        clearAllPads(): void;
    };
}
export {};
