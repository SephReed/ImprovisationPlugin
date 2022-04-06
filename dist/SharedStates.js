(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Observable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedState = void 0;
    const Observable_1 = require("./Observable");
    class SharedState {
        constructor(banks) {
            this.banks = banks;
            this.vars = new Map();
            // --- 
        }
        init() {
            this.banks.allTracks.forEach((track, bankNum) => {
                track.name().addValueObserver((name) => {
                    const bankVars = this.vars.get(bankNum);
                    if (!bankVars) {
                        return;
                    }
                    const keyPairs = this.nameToKeyPairs(name);
                    if (!keyPairs) {
                        return;
                    }
                    for (const key of bankVars.keys()) {
                        bankVars.get(key).value = keyPairs[key];
                    }
                });
            });
        }
        get(bankId, varName) {
            const bankNum = this.banks.bankIdToNum(bankId);
            if (!this.vars.has(bankNum)) {
                this.vars.set(bankNum, new Map());
            }
            const bankVars = this.vars.get(bankNum);
            if (!bankVars.has(varName)) {
                const addMe = new Observable_1.Observable({ value: undefined });
                addMe.init();
                bankVars.set(varName, addMe);
                const keyPairs = this.nameToKeyPairs(this.banks.getTrack(bankNum).name().get());
                keyPairs && (addMe.value = keyPairs[varName]);
                addMe.onChange(() => this.syncBankName(bankNum));
            }
            return bankVars.get(varName);
        }
        nameToKeyPairs(name) {
            const match = name.match(/\{(.+)}/);
            if (!match) {
                return;
            }
            const keyPairs = {};
            match[1].split(",").map((keyPair) => {
                const [key, value] = keyPair.split(":");
                keyPairs[key] = value;
            });
            return keyPairs;
        }
        syncBankName(bankNum) {
            const nameStore = this.banks.getTrack(bankNum).name();
            const currentName = nameStore.get().replace(/\{(.*)}/, "").replace(/[ -]+$/, "");
            let newStore = Array.from(this.vars.get(bankNum).entries()).map(([key, observer]) => {
                const { value } = observer;
                return value ? `${key}:${value}` : undefined;
            }).filter(it => !!it).join(",");
            newStore && (newStore = ` -- {${newStore}}`);
            nameStore.set(currentName + newStore);
        }
    }
    exports.SharedState = SharedState;
});
