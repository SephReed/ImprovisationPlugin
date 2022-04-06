(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./MidiNote", "./Painting"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.eIController = exports.ControllerPainting = exports.MidiFilter = void 0;
    const MidiNote_1 = require("./MidiNote");
    const Painting_1 = require("./Painting");
    class MidiFilter {
        constructor(args) {
            this.args = args;
            if ("status" in args) {
                this.status = args.status;
                this.index = args.index;
            }
            else if ("note" in args) {
                this.status = "note";
                this.index = args.note;
            }
            else if ("cc" in args) {
                this.status = "cc";
                this.index = args.cc;
            }
        }
        static from(arg) {
            return arg instanceof MidiFilter ? arg : new MidiFilter(arg);
        }
        get channel() { return this.args.channel; }
        get value() { return this.args.value; }
        get statusByte() {
            return MidiNote_1.statusBytes[(!this.status || this.status === "note") ? "noteOn" : this.status];
        }
        toMididNote() {
            const { statusByte, channel, index, value } = this;
            return new MidiNote_1.MidiNote(statusByte + (channel || 0), index || 0, value === "non-zero" ? 127 : value || 0);
        }
        matchesMidiNote(midi) {
            const { status, channel, index, value } = this;
            // println(this.toString() + "  " + midi.toString())
            if (status) {
                if (status === "note") {
                    if (midi.status !== "noteOff" && midi.status !== "noteOn") {
                        return false;
                    }
                }
                else if (midi.status !== status) {
                    return false;
                }
            }
            if (channel !== undefined && midi.channel !== channel) {
                return false;
            }
            if (index !== undefined && midi.index !== index) {
                return false;
            }
            if (value !== undefined && midi.value !== value) {
                if (value === "non-zero" && !!midi.value) {
                    return true;
                }
                return false;
            }
            return true;
        }
        toString() {
            const { status, channel, index, value } = this;
            return `s:${status} c:${channel} i:${index} v:${value}`;
        }
    }
    exports.MidiFilter = MidiFilter;
    class ControllerPainting extends Painting_1.Painting {
        constructor(args) {
            super();
            this.args = args;
            this.onUpdate(args.paintCb);
        }
        get id() { return this.args.id; }
        get group() { return this.args.group; }
        get zIndex() { return this.args.zIndex; }
        select() { this.args.select(); }
    }
    exports.ControllerPainting = ControllerPainting;
    class eIController {
        constructor(args) {
            this.args = args;
            this.actions = new Map();
            this.paintings = [];
            this.selectedPaintings = new Map();
            this.midiNoteInputs = [];
            this.registerDevice();
        }
        registerDevice() {
            const { ports, portNames, define } = this.args;
            const { manufacturer, productName, version, uuid, author } = define;
            host.defineController(manufacturer, productName, version, uuid, author);
            host.defineMidiPorts(ports.in, ports.out);
            host.addDeviceNameBasedDiscoveryPair(Array.isArray(portNames) ? portNames : portNames.in, Array.isArray(portNames) ? portNames : portNames.out);
            for (let name in this.args.actions) {
                this.actions.set(name, new ControllerAction(this, name, this.args.actions[name]));
            }
        }
        init() {
            this.onMidi((midi) => this.actions.forEach((act) => act.tryConsumeUpdate(midi)));
            const { portNames } = this.args;
            (Array.isArray(portNames) ? portNames : portNames.in).forEach((portName, port) => {
                const addMe = host.getMidiInPort(port).createNoteInput(portName, "000000"); // feed nothing directly to Bitwig
                addMe.setShouldConsumeEvents(false);
                this.midiNoteInputs.push(addMe);
            });
        }
        onMidi(cb, { port } = { port: 0 }) {
            if (!this.midiListeners) {
                this.midiListeners = new Map();
            }
            if (!this.midiListeners.has(port)) {
                this.midiListeners.set(port, []);
                host.getMidiInPort(port).setMidiCallback((status, data1, data2) => {
                    const midi = new MidiNote_1.MidiNote(status, data1, data2);
                    this.midiListeners.get(port).forEach((cb) => cb(midi));
                });
            }
            this.midiListeners.get(port).push(cb);
        }
        onMidiType(filter, cb) {
            this.onMidi((midi) => MidiFilter.from(filter).matchesMidiNote(midi) && cb(midi));
        }
        onAction(actionName, cb) {
            this.action(actionName).onUpdate(cb);
        }
        onActionNonZero(actionName, cb) {
            this.action(actionName).onUpdate(cb, {
                value: "non-zero"
            });
        }
        action(actionName) {
            const act = this.actions.get(actionName);
            if (!act) {
                throw new Error(`Can not find action "${actionName}"`);
            }
            ;
            return act;
        }
        getActionArgs(actionName) {
            return this.args.actions[actionName];
        }
        findActionFromMidi(midi) {
            for (let [name, action] of this.actions) {
                if (action.matchesMidi(midi)) {
                    return action;
                }
            }
            return undefined;
        }
        sendMidiTo(targetArg, midiArg) {
            const midi = midiArg instanceof MidiNote_1.MidiNote ? midiArg : (MidiFilter.from(midiArg).toMididNote());
            const { target, port } = typeof targetArg === "string" ? { target: targetArg, port: 0 } : targetArg;
            if (target === "device") {
                host.getMidiOutPort(port).sendMidi(...MidiNote_1.MidiNote.cleanData(midi.statusByte, midi.index, midi.value));
            }
            else {
                this.midiNoteInputs[port].sendRawMidiEvent(midi.statusByte, midi.index, midi.value);
            }
        }
        createPainting(args) {
            if (this.paintings.some(({ group, id }) => group === args.group && id === args.id)) {
                throw new Error(`Painting already created`);
            }
            const addMe = new ControllerPainting(Object.assign(Object.assign({}, args), { select: () => {
                    const selected = this.selectedPaintings.get(addMe.group);
                    selected && selected.unPaint();
                    this.selectedPaintings.set(addMe.group, addMe);
                    addMe.repaint();
                }, paintCb: (updates) => {
                    if (this.getSelectedPainting(addMe.group) === addMe) {
                        args.paintCb(updates);
                    }
                } }));
            this.paintings.push(addMe);
            if (this.selectedPaintings.has(args.group) === false) {
                this.selectedPaintings.set(args.group, addMe);
            }
            return addMe;
        }
        getSelectedPainting(group) {
            return this.selectedPaintings.get(group);
        }
    }
    exports.eIController = eIController;
    class ControllerAction {
        constructor(controller, name, _filter) {
            this.controller = controller;
            this.name = name;
            this.history = [];
            this.updateListeners = [];
            this.filter = MidiFilter.from(_filter);
        }
        matchesMidi(midi) {
            return this.filter.matchesMidiNote(midi);
        }
        get currentState() {
            const item = this.history[this.history.length - 1];
            return item ? item.note : undefined;
        }
        tryConsumeUpdate(midi) {
            if (this.matchesMidi(midi)) {
                this.update(midi);
            }
        }
        update(newState) {
            this.history.push({
                note: newState,
                time: Date.now(),
            });
            this.history = this.history.slice(-10);
            this.updateListeners.forEach((cb) => {
                try {
                    cb(this);
                }
                catch (err) {
                    host.showPopupNotification("Error caught.  See Console.");
                    println(`ERR: ` + err);
                }
            });
        }
        get atZero() {
            return !(this.value);
        }
        get isOn() {
            var _a;
            switch ((_a = this.currentState) === null || _a === void 0 ? void 0 : _a.status) {
                case "noteOn": return true;
                case "noteOff": return false;
            }
            return !this.atZero;
        }
        get isOff() { return !this.isOn; }
        get data1() { var _a; return (_a = this.currentState) === null || _a === void 0 ? void 0 : _a.data1; }
        get data2() { var _a; return (_a = this.currentState) === null || _a === void 0 ? void 0 : _a.data2; }
        get index() { return this.data1; }
        get value() { return this.data2; }
        onUpdate(cb, filter) {
            if (filter) {
                const oldCb = cb;
                cb = (act) => {
                    const midi = act.currentState;
                    if (midi && this.filter.matchesMidiNote(midi)) {
                        oldCb(act);
                    }
                };
            }
            this.updateListeners.push(cb);
        }
        tapped(args = { nTimes: 1 }) {
            if (this.isOn) {
                return false;
            }
            let release = this.history[this.history.length - 1].time;
            let lastTapStart;
            let tapCount = 0;
            for (let i = this.history.length - 2; i >= 0; i--) {
                const { time, note } = this.history[i];
                if (lastTapStart && ((lastTapStart - time) > ControllerAction.MAX_CHAIN_TIME)) {
                    return false;
                }
                if (release) {
                    if ((release - time) > ControllerAction.MAX_TAP_TIME) {
                        return false;
                    }
                    if (!!note.value) {
                        tapCount++;
                        release = undefined;
                        lastTapStart = time;
                        if (tapCount >= args.nTimes) {
                            return true;
                        }
                    }
                }
                else if (!note.value) {
                    release = time;
                }
            }
            return false;
        }
        toDevice(midi) {
            const out = Object.assign(Object.assign({}, this.filter), midi);
            if (out.status && out.status === "note") {
                out.status = "noteOn";
            }
            this.controller.sendMidiTo("device", out);
        }
    }
    ControllerAction.MAX_TAP_TIME = 200;
    ControllerAction.MAX_CHAIN_TIME = 250;
});
