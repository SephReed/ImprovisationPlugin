(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Painting = void 0;
    class Painting {
        constructor(args = {}) {
            this.args = args;
            this.pixels = new Map();
            this.listeners = [];
            // --
        }
        setToIdFn(toIdFn) {
            this.args.toId = toIdFn;
        }
        toId(loc) {
            let id;
            if (typeof loc === "object") {
                const toIdArg = this.args.toId;
                if (!toIdArg) {
                    throw new Error(`eI Paintings which use non string or number for location must have a toId function`);
                }
                id = toIdArg(loc);
            }
            else {
                id = loc;
            }
            return id;
        }
        get(loc) {
            const item = this.pixels.get(this.toId(loc));
            return item ? item[1] : "unset";
        }
        set(loc, val) {
            this.pixels.set(this.toId(loc), [loc, val]);
            this.dispatch([[loc, val]]);
        }
        get allPixels() {
            return Array.from(this.pixels.values());
        }
        clear() {
            const items = Array.from(this.pixels.values());
            this.pixels.clear();
            this.dispatch(items.map((item) => [item[0], "unset"]));
        }
        onUpdate(cb) {
            this.listeners.push(cb);
        }
        dispatch(updates) {
            this.listeners.forEach((listener) => listener(updates));
        }
        repaint() {
            this.dispatch(this.allPixels.filter(([loc, val]) => !!val && val !== "unset"));
        }
        unPaint() {
            const out = this.allPixels.filter(([loc, val]) => !!val && val !== "unset").map(([loc, val]) => [loc, "unset"]);
            this.dispatch(out);
        }
    }
    exports.Painting = Painting;
});
