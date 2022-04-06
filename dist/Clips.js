(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Note", "./Observable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Clips = void 0;
    const Note_1 = require("./Note");
    const Observable_1 = require("./Observable");
    class Clips {
        constructor(banks) {
            this.banks = banks;
            this.cursor = null;
            this.someAreObservers = {
                "recording": new Map(),
                "rec-queued": new Map(),
                "rec-or-queued": new Map(),
            };
            // ------
        }
        get all() {
            const out = [];
            this.banks.all.forEach((bank) => {
                bank.clips.forEach((clip) => out.push(clip));
            });
            return out;
        }
        isRecording(bankId) {
            const clips = bankId ? this.banks.get(bankId).clips : this.all;
            return clips.some((clip) => clip.isRecording().get());
        }
        getSomeAreObserver(mode, bankNum) {
            const observers = this.someAreObservers[mode];
            if (!observers.has(bankNum)) {
                observers.set(bankNum, {
                    observable: new Observable_1.Observable({ value: false }),
                    hasHooks: false,
                });
            }
            return observers.get(bankNum);
        }
        updateSomeAreObserver(mode, bankNum) {
            const clips = bankNum !== "all" ? this.banks.get(bankNum).clips : this.all;
            const getValue = () => clips.some((clip) => {
                switch (mode) {
                    case "recording": return clip.isRecording().get();
                    case "rec-queued": return clip.isRecordingQueued().get();
                    case "rec-or-queued": return clip.isRecording().get() || clip.isRecordingQueued().get();
                }
            });
            this.getSomeAreObserver(mode, bankNum).observable.value = getValue();
        }
        someAre(mode, args = {
            bankId: "all"
        }) {
            const bankNum = args.bankId !== "all" ? this.banks.bankIdToNum(args.bankId) : "all";
            const item = this.getSomeAreObserver(mode, bankNum);
            item.hasHooks === false && this.updateSomeAreObserver(mode, bankNum);
            return item.observable.value;
        }
        observeIfSomeAre(mode, args) {
            const bankNum = args.bankId !== "all" && args.bankId ? this.banks.bankIdToNum(args.bankId) : "all";
            const item = this.getSomeAreObserver(mode, bankNum);
            if (item.hasHooks !== true) {
                const clips = bankNum !== "all" ? this.banks.get(bankNum).clips : this.all;
                clips.forEach((clip) => {
                    let hooks = [];
                    switch (mode) {
                        case "recording":
                            hooks = [clip.isRecording()];
                            break;
                        case "rec-queued":
                            hooks = [clip.isRecordingQueued()];
                            break;
                        case "rec-or-queued":
                            hooks = [clip.isRecording(), clip.isRecordingQueued()];
                            break;
                    }
                    hooks.forEach((hook) => hook.addValueObserver(() => this.updateSomeAreObserver(mode, bankNum)));
                });
                item.hasHooks = true;
            }
            item.observable.observe((val) => args.cb(!!val));
        }
        get selectedSlot() {
            return this.all.find((it) => it.isSelected());
        }
        get selectedSlotIndex() {
            return this.all.findIndex((it) => it.isSelected());
        }
        get cursorNoteSteps() {
            let noteSteps = [];
            // println(this.cursor.canScrollStepsForwards().get() + " can scroll");
            const bars = Math.ceil(this.cursor.getLoopLength().get());
            for (let b = 0; b < bars; b++) {
                for (let x = 0; x < Note_1.Note.numSteps; x++) {
                    for (let y = 0; y < 127; y++) {
                        const step = this.cursor.getStep(0, x, y);
                        if (String(step.state()) === "NoteOn") {
                            noteSteps.push(x);
                            this.cursor.moveStep(x, y, 1, 0);
                        }
                    }
                }
                this.cursor.scrollToStep(Note_1.Note.numSteps);
            }
            this.cursor.scrollToStep(-bars * Note_1.Note.numSteps);
            println(`steps found: [${noteSteps.join()}]`);
            return true;
        }
        init() {
            this.cursor = host.createLauncherCursorClip(Math.floor(Note_1.Note.numSteps * 1.25), 127);
            this.cursor.getLoopLength().markInterested();
            this.cursor.canScrollStepsForwards().markInterested();
            this.cursor.setStepSize(1 / Note_1.Note.numSteps);
            // this.cursor.playingStep().addValueObserver()
            const clipRecEndObserver = (isRec) => {
                if (isRec) {
                    return;
                }
                const nextUp = this.banks.nextRecordingBankNum;
                if (nextUp === undefined || nextUp < 0) {
                    return;
                }
                this.banks.nextRecordingBankNum = undefined;
                this.banks.select(nextUp);
            };
            this.banks.allTracks.forEach((track) => {
                const clips = track.clipLauncherSlotBank();
                for (let c = 0; c < this.banks.width; c++) {
                    const clip = clips.getItemAt(c);
                    clip.hasContent().markInterested();
                    clip.isRecording().addValueObserver(clipRecEndObserver);
                    clip.isPlaying().markInterested();
                    clip.isSelected().markInterested();
                    clip.isStopQueued().markInterested();
                    clip.isRecordingQueued().markInterested();
                }
            });
        }
        bankAndSceneIdToNum(bankId, sceneId) {
            const bankNum = this.banks.bankIdToNum(bankId);
            let sceneNum;
            if (typeof sceneId === "number") {
                sceneNum = sceneId;
            }
            else {
                const track = this.banks.getTrack(bankNum);
                const clipBank = track.clipLauncherSlotBank();
                let clips = [];
                const numClips = clipBank.getSizeOfBank();
                for (let c = 0; c < numClips; c++) {
                    clips.push(clipBank.getItemAt(c));
                }
                const reverseSearch = ["LAST_CONTENT"].includes(sceneId);
                reverseSearch && (clips = clips.reverse());
                sceneNum = clips.findIndex((clip) => {
                    switch (sceneId) {
                        case "PLAYING": return clip.isPlaying().get();
                        case "PLAY_QUEUED": return clip.isPlaybackQueued().get();
                        case "STOP_QUEUED": return clip.isStopQueued().get();
                        case "SELECTED": return clip.isSelected().get();
                        case "RECORDING": return clip.isRecording().get();
                        case "RECORDING_QUEUED": return clip.isRecordingQueued().get();
                        case "FIRST_OPEN": return clip.hasContent().get() === false;
                        case "PLAYING_OR_SELECTED": return clip.isPlaying().get() || clip.isSelected().get();
                        case "LAST_CONTENT": // clips reversed above
                        case "FIRST_CONTENT": return clip.hasContent().get();
                    }
                });
                reverseSearch && sceneNum !== -1 && (sceneNum = numClips - 1 - sceneNum);
            }
            println(`${bankId}, ${sceneId} --> ${bankNum}, ${sceneNum}`);
            return { bankNum, sceneNum };
        }
        getSlot(bankIdOrCoord, maybeSceneId) {
            let bankId, sceneId;
            if (typeof bankIdOrCoord === "object") {
                bankId = bankIdOrCoord.bankId;
                sceneId = bankIdOrCoord.sceneId;
            }
            else {
                bankId = bankIdOrCoord;
                sceneId = maybeSceneId;
            }
            const { bankNum, sceneNum } = this.bankAndSceneIdToNum(bankId, sceneId);
            if (bankNum === -1 || sceneNum === -1) {
                return undefined;
            }
            return this.banks.getTrack(bankNum).clipLauncherSlotBank().getItemAt(sceneNum);
        }
        getPlayingSlot(bankId) {
            return this.getSlot(bankId, "PLAYING");
        }
        getNextEmptySlot(bankId) {
            return this.getSlot(bankId, "FIRST_OPEN");
        }
        hitSlot(bankId, sceneId) {
            const clip = this.getSlot(bankId, sceneId);
            if (!clip) {
                return;
            }
            clip.select();
            if (clip.hasContent().get()) {
                clip.launch();
                return "LAUNCH";
            }
            else {
                this.banks.select(bankId);
                clip.record();
                return "NEW_RECORDING";
            }
        }
        clearSlot(bankId, sceneId) {
            this.getSlot(bankId, sceneId).deleteObject();
        }
        duplicate(args) {
            let from = "from" in args ? args.from : args;
            let to = ("to" in args && args.to) || {
                bankId: from.bankId,
                sceneId: "FIRST_OPEN"
            };
            const target = this.getSlot(to).replaceInsertionPoint();
            target.copySlotsOrScenes(this.getSlot(from));
            return to;
        }
        reRecord(args) {
            this.getSlot(args).record();
        }
        reRiff(args) {
            const copyLoc = this.duplicate({
                from: args.target,
                to: args.placement
            });
            this.reRecord(Object.assign(Object.assign({}, copyLoc), { recMode: "NO_LOOP" }));
        }
        tempSelectClip(args, cb) {
            const { bankNum, sceneNum } = this.bankAndSceneIdToNum(args.bankId, args.sceneId);
            const selected = this.getSlot("SELECTED", "SELECTED");
            const target = this.getSlot(args);
            target.select();
            cb(this.cursor, bankNum, sceneNum);
            selected && selected.select();
        }
        transpose(args) {
            this.tempSelectClip(args, (clip) => {
                clip.transpose(args.steps);
            });
        }
        quantize(args) {
            this.tempSelectClip(args, (clip) => {
                clip.quantize(args.quantAmount !== undefined ? args.quantAmount : 1);
            });
        }
        modifyLoopLength(args) {
            this.tempSelectClip(args, (clip) => {
                const loopLen = clip.getLoopLength();
                const current = loopLen.get();
                loopLen.set(current * args.modAmount);
            });
        }
    }
    exports.Clips = Clips;
});
