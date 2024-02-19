(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../dist/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuneoController = exports.EYE_DOWN = exports.EYE_UP = exports.DEFAULT_VALUE = exports.GREEN = exports.YELLOW = exports.ORANGE = exports.RED = exports.DEFAULT_HUE = exports.PadCornerList = void 0;
    const index_1 = require("../dist/index");
    exports.PadCornerList = ["SW", "SE", "NW", "NE"];
    exports.DEFAULT_HUE = 64;
    exports.RED = 0;
    exports.ORANGE = 45;
    exports.YELLOW = 104;
    exports.GREEN = 127;
    exports.DEFAULT_VALUE = 127;
    exports.EYE_UP = 0;
    exports.EYE_DOWN = 64;
    function hvToRg(hv, keepCb) {
        const hue = hv.hue === "keep" ? (keepCb ? keepCb("hue") : exports.DEFAULT_HUE) : hv.hue;
        const value = hv.value === "keep" ? (keepCb ? keepCb("value") : exports.DEFAULT_VALUE) : hv.value;
        let g = Math.min(127, hue * 5);
        g *= (value / 127);
        let r = Math.min(127, 127 - ((hue - (.2 * 127)) * 5 / 4));
        r *= (value / 127);
        return { r, g };
    }
    const satisfies = () => (u) => u;
    const controllerActions = satisfies()({
        // Top
        diamond: { note: 85, out: { note: 33 } },
        square: { note: 86, out: { note: 34 } },
        triangle: { note: 87, out: { note: 35 } },
        // Banks
        bank1Left: { note: 77, out: { note: 36 } },
        bank1Right: { note: 78, out: { note: 37 } },
        bank1SliderX: { cc: 4, channel: 1, out: { cc: 11 } },
        bank1SliderPressure: { cc: 12, channel: 1, out: { cc: 11 } },
        bank2Left: { note: 79, out: { note: 38 } },
        bank2Right: { note: 80, out: { note: 39 } },
        bank2SliderX: { cc: 5, channel: 1, out: { cc: 10 } },
        bank2SliderPressure: { cc: 13, channel: 1, out: { cc: 10 } },
        bank3Left: { note: 81, out: { note: 40 } },
        bank3Right: { note: 82, out: { note: 41 } },
        bank3SliderX: { cc: 6, channel: 1, out: { cc: 9 } },
        bank3SliderPressure: { cc: 14, channel: 1, out: { cc: 9 } },
        bank4Left: { note: 83, out: { note: 42 } },
        bank4Right: { note: 84, out: { note: 43 } },
        bank4SliderX: { cc: 7, channel: 1, out: { cc: 8 } },
        bank4SliderPressure: { cc: 15, channel: 1, out: { cc: 8 } },
        // Face
        eye1: { note: 75, out: { cc: 6 } },
        eye2: { note: 76, out: { cc: 7 } },
        nose: { note: 74, out: { note: 44, rg: true } },
        tooth1Y: { cc: 0, channel: 1, out: { cc: 1 } },
        tooth1Pressure: { cc: 8, channel: 1, out: { cc: 1 } },
        tooth2Y: { cc: 1, channel: 1, out: { cc: 2 } },
        tooth2Pressure: { cc: 9, channel: 1, out: { cc: 2 } },
        tooth3Y: { cc: 2, channel: 1, out: { cc: 3 } },
        tooth3Pressure: { cc: 10, channel: 1, out: { cc: 3 } },
        tooth4Y: { cc: 3, channel: 1, out: { cc: 4 } },
        tooth4Pressure: { cc: 11, channel: 1, out: { cc: 4 } },
        // Bottom
        vertArrows1Up: { note: 71, out: { note: 46 } },
        vertArrows1Down: { note: 70, out: { note: 47 } },
        vertArrows2Up: { note: 73, out: { note: 48 } },
        vertArrows2Down: { note: 72, out: { note: 49 } },
        largeSliderX: { cc: 16, channel: 1, out: { cc: 5 } },
        largeSliderPressure: { cc: 17, channel: 1, out: { cc: 5 } },
    });
    const controllerDef = {
        define: {
            manufacturer: "eImprov",
            productName: "Quneo",
            version: "1.0",
            uuid: "33eec3eb-8deb-4a8d-af2c-00f4f63cd763",
            author: "Seph Reed",
        },
        ports: {
            in: 1,
            out: 1,
        },
        portNames: ["QUNEOennae"],
        actions: Object.assign(Object.assign({}, controllerActions), (() => {
            const gridItems = {};
            for (let i = 0; i < 16; i++) {
                const name = `pad${i + 1}`;
                gridItems[name] = { note: i };
                gridItems[`${name}Pressure`] = { status: "cc", channel: 0, index: i };
                gridItems[`${name}X`] = { status: "cc", channel: 0, index: 20 + i };
                gridItems[`${name}Y`] = { status: "cc", channel: 0, index: 40 + i };
            }
            return gridItems;
        })())
    };
    class QuneoController extends index_1.eIController {
        constructor() {
            super(controllerDef);
            this.padCornerInputStates = new Map();
            for (let i = 0; i < 16; i++) {
                let SW = (i % 4) * 4;
                SW += Math.floor(i / 4) * 32;
                QuneoController.padLeds.set(`pad${i + 1}`, {
                    SW,
                    SE: SW + 2,
                    NW: SW + 16,
                    NE: SW + 18
                });
            }
        }
        padPosFromRowCol(rowCol) {
            const { row, col } = rowCol;
            if (row >= 8 || col >= 8) {
                throw new Error(`Position out of bounds: ` + JSON.stringify(rowCol));
            }
            const padNums = [
                [13, 14, 15, 16],
                [9, 10, 11, 12],
                [5, 6, 7, 8],
                [1, 2, 3, 4],
            ];
            const num = padNums[Math.floor(row / 2)][Math.floor(col / 2)];
            const isNorth = !(row % 2);
            const isWest = !(col % 2);
            return {
                num,
                corner: (isNorth ? (isWest ? "NW" : "NE") : (isWest ? "SW" : "SE")),
            };
        }
        onPadRowColAction(rowCol, cb) {
            const pad = this.padPosFromRowCol(rowCol);
            const note = pad.num - 1;
            if (this.padCornerInputStates.has(pad.num) === false) {
                const addMe = {
                    x: 0, y: 0,
                    noteOn: false,
                    listeners: { NW: [], NE: [], SW: [], SE: [], }
                };
                const { NW, NE, SW, SE } = addMe.listeners;
                this.padCornerInputStates.set(pad.num, addMe);
                this.onMidiType({ note }, ({ status }) => {
                    addMe.noteOn = status === "noteOn";
                    const listeners = addMe.y >= 64 ? (addMe.x < 64 ? NW : NE) : (addMe.x < 64 ? SW : SE);
                    listeners.forEach((listener) => listener(addMe.noteOn));
                });
                this.onMidiType({ status: "cc", channel: 0 }, ({ index, value }) => {
                    const getChange = (last, now) => {
                        switch (true) {
                            case addMe.noteOn === false: return;
                            case last < 64 && now >= 64: return "UP";
                            case last >= 64 && now < 64: return "DOWN";
                        }
                    };
                    let change;
                    let flips;
                    if (index === note + 20) {
                        change = getChange(addMe.x, value);
                        addMe.x = value;
                        if (change) {
                            flips = addMe.y < 64 ? [SW, SE] : [NW, NE];
                        }
                    }
                    else if (index === note + 40) {
                        change = getChange(addMe.y, value);
                        addMe.y = value;
                        if (change) {
                            flips = addMe.x < 64 ? [SW, NW] : [SE, NE];
                        }
                    }
                    if (change && flips) {
                        change === "DOWN" && (flips = flips.reverse());
                        flips[0].forEach((cb) => cb(false));
                        flips[1].forEach((cb) => cb(true));
                    }
                });
            }
            const padState = this.padCornerInputStates.get(pad.num);
            padState.listeners[pad.corner].push(cb);
        }
        createPadPainting(id, group) {
            const painting = this.createPainting({
                group,
                id,
                toId: (loc) => {
                    return "cc" in loc ? `${loc.channel}cc${loc.cc}` : `${loc.channel}note${loc.note}`;
                },
                paintCb: (updates) => {
                    // println(`# updates` + updates.length);
                    updates.forEach(([loc, val]) => {
                        if ("cc" in loc) {
                            val === "unset" && (val = 0);
                            val = val;
                            this.sendMidiTo("device", {
                                channel: loc.channel || 0,
                                status: "cc",
                                index: loc.cc,
                                value: val
                            });
                        }
                        else if ("note" in loc) {
                            if (typeof val === "number") {
                                this.sendMidiTo("device", {
                                    channel: loc.channel || 0,
                                    status: "noteOn",
                                    index: loc.note,
                                    value: val
                                });
                                return;
                            }
                            let hv = val === "unset" ? { hue: 0, value: 0 } : val;
                            const { r, g } = hvToRg(hv, (type) => {
                                const state = painting.get(loc);
                                if (state === "unset") {
                                    return type === "hue" ? exports.DEFAULT_HUE : exports.DEFAULT_VALUE;
                                }
                                if (typeof state !== "object") {
                                    throw new Error(`Someone assigned something other than HV to a pad corner...`);
                                }
                                return state[type];
                            });
                            this.sendMidiTo("device", {
                                channel: loc.channel || 0,
                                status: "noteOn",
                                index: loc.note,
                                value: g
                            });
                            this.sendMidiTo("device", {
                                channel: loc.channel || 0,
                                status: "noteOn",
                                index: loc.note + 1,
                                value: r
                            });
                        }
                    });
                }
            });
            const controller = this;
            const fns = {
                setItem(name, value) {
                    const action = controller.getActionArgs(name);
                    const needsHV = "rg" in action.out;
                    if (typeof value === "object") {
                        if (!needsHV) {
                            if (value.value === "keep") {
                                return;
                            }
                            value = value.value;
                        }
                    }
                    else if (needsHV) {
                        value = { hue: exports.DEFAULT_HUE, value };
                    }
                    const loc = Object.assign({ channel: 0 }, action.out);
                    let state;
                    if (typeof value === "object") {
                        state = painting.get(loc);
                        state === "unset" && (state = { hue: exports.DEFAULT_HUE, value: exports.DEFAULT_VALUE });
                        typeof state === "number" && (state = { hue: exports.DEFAULT_HUE, value: state });
                        value = {
                            hue: value.hue !== "keep" ? value.hue : state.hue,
                            value: value.value !== "keep" ? value.value : state.value,
                        };
                    }
                    else {
                        if (name === "eye1" || name === "eye2") {
                            //Spinners are not actually symmetrical.  Here's a hack to make them look like it though.
                            if (value < 64) {
                                value = (value / 64) * 70;
                            }
                            else { }
                            value = value < 64 ? (value = (value / 64) * 70) : (((value % 64) / 64 * 77) + 70);
                            if (value > 127) {
                                value = 0;
                            }
                        }
                        state = value;
                    }
                    painting.set(loc, state);
                },
                setPad(name, color) {
                    // println(name + JSON.stringify(color));
                    exports.PadCornerList.forEach((corner) => fns.setPadCorner({ name, corner, color }));
                },
                setPadCornerRowCol(pos, color) {
                    const pad = controller.padPosFromRowCol(pos);
                    fns.setPadCorner({
                        name: `pad${pad.num}`,
                        corner: pad.corner,
                        color
                    });
                },
                setPadCorner(args) {
                    const leds = QuneoController.padLeds.get(args.name);
                    const led = { note: leds[args.corner], channel: 1 };
                    let state = { hue: exports.DEFAULT_HUE, value: exports.DEFAULT_VALUE };
                    if (painting.get(led) !== "unset") {
                        state = painting.get(led);
                    }
                    const newState = {
                        hue: args.color.hue !== "keep" ? args.color.hue : state.hue,
                        value: args.color.value !== "keep" ? args.color.value : state.value,
                    };
                    painting.set(led, newState);
                },
                clearPad(name) {
                    fns.setPad(name, { hue: "keep", value: 0 });
                },
                clearAllPads() {
                    for (let i = 1; i <= 16; i++) {
                        fns.clearPad(`pad${i}`);
                    }
                }
            };
            Object.entries(fns).forEach(([name, fn]) => painting[name] = fn);
            return painting;
        }
    }
    exports.QuneoController = QuneoController;
    QuneoController.padLeds = new Map();
});
