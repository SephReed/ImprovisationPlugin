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
    exports.Note = void 0;
    class Note {
        constructor(args) {
            this.args = args;
            // ----
        }
    }
    exports.Note = Note;
    Note.numSteps = 16 * 3;
});
