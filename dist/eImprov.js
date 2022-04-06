(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Banks", "./Observable", "./Tempo"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.eI = exports.Params = exports.eImprov = void 0;
    const Banks_1 = require("./Banks");
    const Observable_1 = require("./Observable");
    const Tempo_1 = require("./Tempo");
    class eImprov {
        constructor(args) {
            this.args = args;
            // -------------
            this.app = host.createApplication();
            this.transport = host.createTransport();
            this.tempo = {
                tap: new Tempo_1.TempoState()
            };
            this._params = null;
            this.banks = new Banks_1.Banks(args.banks);
            if (eImprov._singleton) {
                return eImprov._singleton;
            }
            eImprov._singleton = this;
            this.banks.init();
        }
        undo() { this.app.undo(); }
        redo() { this.app.redo(); }
        get showingSubPanel() {
            return this._showingSubPanel;
        }
        showSubPanel(item) {
            item !== "mixer" ? this.app.toggleMixer() : this.app.toggleDevices();
            switch (item) {
                case "devices":
                    this.app.toggleDevices();
                    break;
                case "noteEditor":
                    this.app.toggleNoteEditor();
                    break;
                case "mixer":
                    this.app.toggleMixer();
                    break;
                case "automation":
                    this.app.toggleAutomationEditor();
                    break;
            }
            this._showingSubPanel = item;
        }
        get params() {
            if (!this._params) {
                this._params = new Params();
            }
            return this._params;
        }
    }
    exports.eImprov = eImprov;
    class Params {
        constructor() {
            this.tempo = new Observable_1.Observable({ param: eI().transport.tempo() });
            this.isPlaying = new Observable_1.Observable({ param: eI().transport.isPlaying() });
            this.playPos = new Observable_1.Observable({ param: eI().transport.getPosition() });
        }
    }
    exports.Params = Params;
    function eI() {
        const out = eImprov._singleton;
        if (!out) {
            throw new Error(`An eImprov must be created first`);
        }
        return out;
    }
    exports.eI = eI;
});
