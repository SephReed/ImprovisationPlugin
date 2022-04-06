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
    exports.TempoState = void 0;
    class TempoState {
        constructor(args = {}) {
            this.startTapTime = -1;
            this.impulses = [];
            this._bpm = -1;
            this._confidence = 0;
            this.listeners = [];
            this.args = Object.assign({ maxImpulseSpace: 2000 }, args);
        }
        get mostRecentImpulse() {
            return this.impulses[this.impulses.length - 1];
        }
        clearOldImpulses() {
            if (!this.mostRecentImpulse) {
                return;
            }
            if ((Date.now() - this.mostRecentImpulse.time) > this.args.maxImpulseSpace) {
                this.impulses = [];
                this._bpm = -1;
                this._confidence = 0;
                this.startTapTime = -1;
            }
        }
        get bpm() {
            return this._bpm;
        }
        bpmAsUnitOfRange(range = {
            min: 20,
            max: 666,
        }) {
            return (this.bpm - range.min) / (range.max - range.min);
        }
        get confidence() {
            return this._confidence;
        }
        impulse() {
            const now = Date.now();
            this.clearOldImpulses();
            this.impulses.push({
                time: now
            });
            if (this.startTapTime < 0) {
                this.startTapTime = now;
            }
            else {
                const msPerBeat = (now - this.startTapTime) / (this.impulses.length - 1);
                // println(msPerBeat +"ms / beat")
                this._bpm = (60 * 1000) / msPerBeat;
                this._confidence = 1 - (1 / (this.impulses.length - 1));
                this._confidence = Math.round(this._confidence * 1000) / 1000;
                this.listeners.forEach((cb) => cb(this));
            }
        }
        onUpdate(cb) {
            this.listeners.push(cb);
        }
    }
    exports.TempoState = TempoState;
});
