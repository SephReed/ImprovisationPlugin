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
    exports.MidiNote = exports.statusBytes = void 0;
    exports.statusBytes = {
        noteOff: 0b10000000,
        noteOn: 0b10010000,
        poly: 0b10100000,
        cc: 0b10110000,
        program: 0b11000000,
        chanelAftertouch: 0b11010000,
        pitchBend: 0b11100000,
        system: 0b11110000,
    };
    const statusMap = new Map();
    for (let key in exports.statusBytes) {
        statusMap.set(exports.statusBytes[key] >> 4, key);
    }
    // export function getStatusByteFromType(type: StatusType) {
    //   return statusBytes
    // }
    class MidiNote {
        static cleanData(stat, data1, data2) {
            const limit = (val, limit = 127) => Math.max(0, Math.min(limit, Math.floor(val)));
            const out = [limit(stat, 255), limit(data1), limit(data2)];
            // println(out.join());
            return out;
        }
        constructor(statData, data1, data2) {
            this.statData = statData;
            this.data1 = data1;
            this.data2 = data2;
            this.statusMap = new Map();
        }
        get status() {
            const statusOnly = this.statData >> 4;
            return statusMap.get(statusOnly);
        }
        get statusByte() {
            return this.statData;
        }
        get channel() {
            return this.statData & 0b00001111;
        }
        get index() {
            return this.data1;
        }
        get value() {
            return this.data2;
        }
        toString() {
            return ["s", this.status, "-c", this.channel, "-i", this.index, "-v", this.value].join("");
        }
    }
    exports.MidiNote = MidiNote;
});
