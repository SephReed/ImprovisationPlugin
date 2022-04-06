

export type PixelChangeListener<LOC, VAL> = (changes: PixelValue<LOC, VAL>[]) => any
export type PixelValue<LOC, VAL> = [LOC, VAL | "unset"];

export type PaintingArgs<LOC> = {
  toId?: (loc: LOC) => string | number
};

export class Painting<LOC, VAL> {
  protected pixels = new Map<string | number, [LOC, VAL]>();

  constructor(protected args: PaintingArgs<LOC> = {}) {
    // --
  }

  public setToIdFn(toIdFn: (loc: LOC) => string | number) {
    this.args.toId = toIdFn;
  }

  protected toId(loc: LOC) {
    let id: string | number;
    if (typeof loc === "object") {
      const toIdArg = this.args.toId;
      if (!toIdArg) {
        throw new Error(`eI Paintings which use non string or number for location must have a toId function`);
      }
      id = toIdArg(loc);
    } else {
      id = loc as any;
    }
    return id;
  }

  public get(loc: LOC) {
    const item = this.pixels.get(this.toId(loc));
    return item ? item[1] : "unset";
  }

  public set(loc: LOC, val: VAL) {
    this.pixels.set(this.toId(loc), [loc, val]);
    this.dispatch([[loc, val]]);
  }

  public get allPixels(): PixelValue<LOC, VAL>[] {
    return Array.from(this.pixels.values());
  }

  public clear() {
    const items = Array.from(this.pixels.values());
    this.pixels.clear();
    this.dispatch(items.map((item) => [item[0], "unset"]));
  }

  protected listeners: Array<PixelChangeListener<LOC, VAL>> = [];
  public onUpdate(cb: PixelChangeListener<LOC, VAL>) {
    this.listeners.push(cb);
  }

  protected dispatch(updates: PixelValue<LOC, VAL>[]) {
    this.listeners.forEach((listener) => listener(updates));
  }

  public repaint() {
    this.dispatch(this.allPixels.filter(
      ([loc, val]) => !!val && val !== "unset"
    ));
  }

  public unPaint() {
    const out = this.allPixels.filter(
      ([loc, val]) => !!val && val !== "unset"
    ).map(
      ([loc, val]) => [loc, "unset"] as PixelValue<LOC, VAL>
    )
    this.dispatch(out);
  }
}