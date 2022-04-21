(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./eImprov", "./Observable", "./SharedStates"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scheduler = void 0;
    const eImprov_1 = require("./eImprov");
    const Observable_1 = require("./Observable");
    const SharedStates_1 = require("./SharedStates");
    class Scheduler {
        constructor() {
            this.isOnDownBeat = new Observable_1.Observable({ value: false });
            this.isAtMeasureStart = new Observable_1.Observable({ value: false });
        }
        init() {
            (0, eImprov_1.eI)().transport.getPosition().addValueObserver((pos) => {
                const beatPos = pos % 1;
                this.isOnDownBeat.value = (beatPos < (1 / 2) || beatPos > (63 / 64));
                const measurePos = (pos % 4) / 4;
                let prevValue = this.isAtMeasureStart.value;
                const atStart = this.isAtMeasureStart.value = (measurePos < 1 / 16 || measurePos > (15 / 16));
                if (!atStart || prevValue === atStart) {
                    return;
                }
                // const timeTill = 
                println("measureStart " + JSON.stringify((0, eImprov_1.eI)().vars.entries()));
                (0, eImprov_1.eI)().vars.entries().forEach(([bankNum, vars]) => {
                    const onMeasure = vars.get(SharedStates_1.SHARED_STATE.onMeasure);
                    if (!onMeasure || !onMeasure.value) {
                        return;
                    }
                    const actions = onMeasure.value.split(",");
                    const track = (0, eImprov_1.eI)().banks.getTrack(bankNum);
                    actions.forEach((action) => {
                        switch (action) {
                            case "mute": return track.mute().set(true);
                            case "un-mute": return track.mute().set(false);
                            case "solo": return track.solo().set(true);
                            case "un-solo": return track.solo().set(false);
                        }
                    });
                    onMeasure.value = undefined;
                });
            });
        }
        schedule(args) {
            const store = (0, eImprov_1.eI)().vars.get(args.bankId, args.time === "beat" ? SharedStates_1.SHARED_STATE.onBeat : SharedStates_1.SHARED_STATE.onMeasure);
            if (!store.value) {
                return store.value = args.action;
            }
            let values = store.value.split(",");
            if (values.includes(args.action)) {
                if (args.remove !== true) {
                    return;
                }
                return store.value = values.filter(it => it !== args.action).join(",");
            }
            else if (args.remove) {
                return;
            }
            values.push(args.action);
            store.value = values.filter(it => {
                return it !== {
                    "mute": "un-mute",
                    "un-mute": "mute",
                    "solo": "un-solo",
                    "un-solo": "solo"
                }[args.action];
            }).join(",");
        }
        scheduleAll(args) {
            (0, eImprov_1.eI)().banks.all.forEach((bank, bankId) => {
                this.schedule(Object.assign(Object.assign({}, args), { bankId }));
            });
        }
    }
    exports.Scheduler = Scheduler;
});
