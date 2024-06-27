export type PixelChangeListener<LOC, VAL> = (changes: PixelValue<LOC, VAL>[]) => any;
export type PixelValue<LOC, VAL> = [LOC, VAL | "unset"];
export type PaintingArgs<LOC> = {
    toId?: (loc: LOC) => string | number;
};
export declare class Painting<LOC, VAL> {
    protected args: PaintingArgs<LOC>;
    protected pixels: Map<string | number, [LOC, VAL]>;
    constructor(args?: PaintingArgs<LOC>);
    setToIdFn(toIdFn: (loc: LOC) => string | number): void;
    protected toId(loc: LOC): string | number;
    get(loc: LOC): "unset" | VAL;
    set(loc: LOC, val: VAL): void;
    get allPixels(): PixelValue<LOC, VAL>[];
    clear(): void;
    protected listeners: Array<PixelChangeListener<LOC, VAL>>;
    onUpdate(cb: PixelChangeListener<LOC, VAL>): void;
    protected dispatch(updates: PixelValue<LOC, VAL>[]): void;
    repaint(): void;
    unPaint(): void;
}
