(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Clips", "./eImprov", "./Observable", "./SharedStates"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Banks = void 0;
    const Clips_1 = require("./Clips");
    const eImprov_1 = require("./eImprov");
    const Observable_1 = require("./Observable");
    const SharedStates_1 = require("./SharedStates");
    ;
    class Banks {
        get selectedBankNum() {
            return this._selectedBankNum.value;
        }
        get observeSelectedBankNum() {
            return this._selectedBankNum.observe.bind(this._selectedBankNum);
        }
        ;
        get maxTracksAvailable() {
            return this._maxTracksAvailable.value;
        }
        get observeMaxTracksAvailable() {
            return this._maxTracksAvailable.observe.bind(this._maxTracksAvailable);
        }
        constructor(args) {
            this.args = args;
            this.liveBanks = [];
            this._selectedBankNum = new Observable_1.Observable({ value: 0 });
            this._maxTracksAvailable = new Observable_1.Observable({ value: 0 });
            // public readonly vars = new SharedState(this);
            this.clips = new Clips_1.Clips(this);
            this._assertScroll = false;
        }
        assertScroll() {
            if (this._assertScroll) {
                return;
            }
            this._assertScroll = true;
            this.updateBankScrollPositions();
            this.liveBanks.forEach((bank, index) => {
                this.scrollEndDeviceBank(bank.endDeviceBank);
            });
        }
        updateBankScrollPositions() {
            const offset = this.liveBanks[0].scrollPosition().get();
            this.liveBanks.forEach((bank, index) => {
                bank.scrollPosition().set(offset + index);
            });
        }
        scrollEndDeviceBank(deviceBank) {
            const distToEnd = (deviceBank.itemCount().get() - 1) - deviceBank.scrollPosition().get();
            if (!distToEnd) {
                return;
            }
            deviceBank.scrollBy(distToEnd);
        }
        get width() { return this.args.width; }
        get height() { return this.args.height; }
        get all() {
            this.assertScroll();
            return this.liveBanks.slice(0);
        }
        get allTracks() {
            return this.all.map(({ track }) => track);
        }
        get selected() {
            return this.get("SELECTED");
        }
        get selectedTrack() {
            return this.getTrack("SELECTED");
        }
        get isRecording() {
            return this.clips.all.some((clip) => clip.isRecording().get());
        }
        get nextRecordingBankNum() {
            const out = (0, eImprov_1.eI)().vars.get("MASTER", SharedStates_1.SHARED_STATE.nextRecord);
            println("nextRecordingBankNu:m" + JSON.stringify(out));
            return out && out.value ? parseInt(out.value) : undefined;
        }
        set nextRecordingBankNum(bankId) {
            const bankNum = bankId === undefined ? undefined : this.bankIdToNum(bankId);
            (0, eImprov_1.eI)().vars.get("MASTER", SharedStates_1.SHARED_STATE.nextRecord).value = bankNum === undefined ? undefined : String(bankNum);
        }
        bankIdToNum(bankId) {
            switch (bankId) {
                case "MASTER": return Math.max(0, this.maxTracksAvailable - 1);
                case "SELECTED": return this.selectedBankNum;
                default: return bankId;
            }
        }
        get(bankId) {
            this.assertScroll();
            const bankConf = this.liveBanks[this.bankIdToNum(bankId)];
            if (!bankConf) {
                throw new Error(`Bank of id ${bankId} could not be found`);
            }
            return bankConf;
        }
        getTrack(bankId) {
            return this.get(bankId).getItemAt(0);
        }
        moveTrackSelection(numSteps) {
            if (numSteps === 0) {
                return;
            }
            const target = Math.max(0, Math.min(this.maxTracksAvailable - 1, this.selectedBankNum + numSteps));
            println(target + " " + numSteps + " select: " + this.selectedBankNum);
            if (target === this.selectedBankNum) {
                return;
            }
            this.focus(target);
            this.arm(target);
        }
        init() {
            this.initLiveBanks();
            this.clips.init();
            this._assertScroll = false;
        }
        initLiveBanks() {
            for (let t = 0; t < this.height; t++) {
                const bitwigBank = host.createTrackBank(1, this.args.sends, this.width);
                const track = bitwigBank.getItemAt(0);
                const params = track.createDeviceBank(1).getItemAt(0).createCursorRemoteControlsPage(9);
                if (t === 0) {
                    bitwigBank.channelCount().addValueObserver((num) => {
                        this._maxTracksAvailable.value = num;
                        this.updateBankScrollPositions();
                    }, 0);
                    this._maxTracksAvailable.value = bitwigBank.channelCount().get();
                }
                bitwigBank.scrollPosition().addValueObserver(() => {
                    this.updateBankScrollPositions();
                }, 0);
                const endDeviceBank = track.createDeviceBank(1);
                track.exists().markInterested();
                track.volume().markInterested();
                track.mute().markInterested();
                track.solo().markInterested();
                endDeviceBank.itemCount().markInterested();
                endDeviceBank.scrollPosition().markInterested();
                const endParams = endDeviceBank.getItemAt(0).createCursorRemoteControlsPage(9);
                endParams.hasNext().markInterested();
                let skipFirst = false;
                endDeviceBank.itemCount().addValueObserver((count) => {
                    if (!skipFirst) {
                        skipFirst = true;
                        return;
                    }
                    this.scrollEndDeviceBank(endDeviceBank);
                }, -1);
                const banks = this;
                const decorators = {
                    params,
                    endDeviceBank,
                    endParams,
                    get track() { return bitwigBank.getItemAt(0); },
                    get isSelected() { return banks.selectedBankNum === t; },
                    select() { banks.select(t); },
                    get clips() {
                        const out = [];
                        const clips = bitwigBank.getItemAt(0).clipLauncherSlotBank();
                        for (let c = 0; c < banks.width; c++) {
                            out.push(clips.getItemAt(c));
                        }
                        return out;
                    }
                };
                this.liveBanks[t] = new Proxy(bitwigBank, {
                    get: (self, key) => {
                        if (key in decorators) {
                            return decorators[key];
                        }
                        return self[key];
                    }
                });
                track.addIsSelectedInEditorObserver((isSelected) => {
                    if (t >= this.maxTracksAvailable) {
                        return;
                    }
                    if (isSelected) {
                        this._selectedBankNum.value = t;
                        println("select" + t);
                        this.scrollEndDeviceBank(endDeviceBank);
                    }
                });
                track.color().markInterested();
            }
        }
        scrollTrackBankScenes(bankId, numScenes) {
            this.get(bankId).scrollBy(numScenes);
        }
        select(bankId) {
            println("selecting " + bankId);
            this.focus(bankId);
            this.arm(bankId);
        }
        focus(bankId) {
            this.getTrack(bankId).selectInEditor();
            const getClip = (sceneId) => this.clips.getSlot({ bankId, sceneId });
            const selectClip = getClip("PLAYING") || getClip("LAST_CONTENT") || getClip("FIRST_OPEN");
            selectClip.select();
        }
        stop(bankId) {
            this.getTrack(bankId).stop();
        }
        setSolo(bankId, mode) {
            const solo = this.getTrack(bankId).solo();
            mode === "toggle" ? solo.toggle(false) : solo.set(mode === "on");
        }
        getSolo(bankId) {
            this.getTrack(bankId).solo().get();
        }
        // public schedule(args: {
        //   bankId: BankId;
        //   time: "beat" | "measure";
        //   action: "mute" | "un-mute" | "solo" | "un-solo";
        //   remove?: true;
        // }) {
        //   const store = this.vars.get(args.bankId, args.time === "beat" ?  SHARED_STATE.onBeat : SHARED_STATE.onMeasure);
        //   if (!store.value) { return store.value = args.action }
        //   let values = store.value.split(",");
        //   if (values.includes(args.action)) { 
        //     if (args.remove !== true) { return; }
        //     return store.value = values.filter(it => it !== args.action).join(",");
        //   } else if (args.remove) {
        //     return;
        //   }
        //   values.push(args.action);
        //   store.value = values.filter(it => {
        //     return it !== {
        //       "mute": "un-mute",
        //       "un-mute": "mute",
        //       "solo": "un-solo",
        //       "un-solo": "solo"
        //     }[args.action];
        //   }).join(",");
        // }
        arm(bankId) {
            const bankNum = this.bankIdToNum(bankId);
            const item = this.getTrack(bankNum);
            const color = item.color();
            this.liveBanks.forEach((bank, index) => {
                if (index === bankNum) {
                    return;
                }
                const checkMe = bank.getItemAt(0);
                const a = color;
                const b = checkMe.color();
                const match = a.red() === b.red() && a.green() === b.green() && a.blue() === b.blue() && a.alpha() === b.alpha();
                if (match) {
                    checkMe.arm().set(false);
                }
            });
            item.arm().set(true);
        }
        param(bankId, macroNum) {
            this.assertScroll();
            return this.liveBanks[this.bankIdToNum(bankId)].params.getParameter(macroNum);
        }
        endParam(bankId, macroNum) {
            this.assertScroll();
            const config = this.liveBanks[this.bankIdToNum(bankId)];
            return config.endParams.getParameter(macroNum);
        }
        hitRecordButton() {
            const nothingEnded = this.endAllRecordings() === false;
            nothingEnded && this.queueRecordInNextEmptySlot("SELECTED");
        }
        queueRecordInNextEmptySlot(bankId) {
            const clip = this.clips.getNextEmptySlot(bankId);
            if (clip) {
                clip.record();
                clip.select();
            }
        }
        redoRecordingClips() {
            this.clips.all.forEach((clip) => {
                if (clip.isRecording().get()) {
                    clip.deleteObject();
                    clip.record();
                }
            });
        }
        endAllRecordings(next = "play") {
            let result = false;
            this.clips.all.forEach((clip) => {
                if (clip.isRecording().get()) {
                    result = true;
                    if (next == "play") {
                        clip.launch();
                    }
                    else {
                        const coord = this.clips.getClipSlotCoordinates(clip);
                        if (coord == "NOT_FOUND") {
                            console.warn("Unable to find clip");
                        }
                        else {
                            this.stop(coord.bankId);
                        }
                    }
                    clip.select();
                    const nextUp = this.nextRecordingBankNum;
                    nextUp !== undefined && this.queueRecordInNextEmptySlot(nextUp);
                }
            });
            return result;
        }
    }
    exports.Banks = Banks;
});
