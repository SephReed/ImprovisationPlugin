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
    exports.Observable = void 0;
    class Observable {
        // protected valHistory: T[] = [];
        constructor(args) {
            this.args = args;
            this.currentVal = undefined;
            this.ignoreRepeatValues = true;
            if (!args) {
                throw new Error(`Args required`);
            }
            else if ("value" in args) {
                this.currentVal = args.value;
                this.init();
            }
            else if ("param" in args) {
                const { param } = args;
                if ("toggle" in param) {
                    this.neededFns = {
                        listener: (cb) => param.addValueObserver(cb),
                        set: (val) => param.set(val),
                    };
                }
                else if ("beatStepper" in param) {
                    this.neededFns = {
                        listener: (cb) => param.addValueObserver(cb),
                        set: (val) => param.set(val),
                    };
                }
                else {
                    this.neededFns = {
                        listener: (cb) => param.addRawValueObserver(cb),
                        set: (val) => param.value().set(val),
                    };
                }
            }
            else {
                this.neededFns = args;
                this.init();
            }
        }
        get value() { return this.currentVal; }
        set value(newVal) {
            if (this.ignoreRepeatValues && this.currentVal === newVal) {
                return;
            }
            this.forceSet(newVal);
        }
        forceSet(newVal) {
            if (this.neededFns) {
                this.neededFns.set(newVal);
            }
            else {
                this.updateValAndDispatch(newVal);
            }
        }
        init() {
            if (this.observers) {
                return;
            }
            this.observers = [];
            this.neededFns && this.neededFns.listener((val) => {
                this.updateValAndDispatch(val);
            });
        }
        updateValAndDispatch(newVal) {
            if (this.currentVal === newVal) {
                return;
            }
            this.currentVal = newVal;
            this.observers.forEach(cb => cb(newVal));
        }
        observe(cb) {
            this.onChange(cb);
            cb(this.value);
        }
        onChange(cb) {
            this.observers.push(cb);
        }
    }
    exports.Observable = Observable;
});
