import { Clips } from "./Clips";
import { eI } from "./eImprov";
import { Observable } from "./Observable";
import { SharedState, SHARED_STATE } from "./SharedStates";



export interface BanksArgs {
  height: number;
  width: number;
  sends: number
};

export type BankId = number | "SELECTED" | "MASTER";

export type SceneId = number | "SELECTED" 
  | "PLAY_QUEUED" | "PLAYING" | "RECORDING" 
  | "RECORDING_QUEUED" | "STOP_QUEUED" | "FIRST_OPEN" 
  | "PLAYING_OR_SELECTED" | "LAST_CONTENT" | "FIRST_CONTENT";




export type eIBankDecorators = {
  track: API.Track;
  isSelected: boolean;
  params: API.CursorRemoteControlsPage;
  endParams: API.CursorRemoteControlsPage;
  endDeviceBank: API.DeviceBank;
  select(): void;
  clips: API.ClipLauncherSlot[];
}
export type eIBank = API.TrackBank & eIBankDecorators;


  
export class Banks {
  protected liveBanks: Array<eIBank> = [];

  protected _selectedBankNum = new Observable({ value: 0});
  public get selectedBankNum() {
    return this._selectedBankNum.value;
  }
  public get observeSelectedBankNum() {
    return this._selectedBankNum.observe.bind(this._selectedBankNum);
  }

  protected _maxTracksAvailable = new Observable({ value: 0});;
  public get maxTracksAvailable() {
    return this._maxTracksAvailable.value;
  }
  public get observeMaxTracksAvailable() {
    return this._maxTracksAvailable.observe.bind(this._maxTracksAvailable);
  }

  // public readonly vars = new SharedState(this);
  public readonly clips = new Clips(this);

  constructor(protected args: BanksArgs) {}

  protected _assertScroll = false;
  protected assertScroll() {
    if (this._assertScroll) { return; }
    this._assertScroll = true;
    this.updateBankScrollPositions();
    this.liveBanks.forEach((bank, index) => {
      this.scrollEndDeviceBank(bank.endDeviceBank);
    })
  }

  public updateBankScrollPositions() {
    const offset = this.liveBanks[0].scrollPosition().get();
    this.liveBanks.forEach((bank, index) => {
      bank.scrollPosition().set(offset + index);
    })
  }

  protected scrollEndDeviceBank(deviceBank: API.DeviceBank) {
    const distToEnd = (deviceBank.itemCount().get() - 1) - deviceBank.scrollPosition().get();
    if (!distToEnd) { return; }
    deviceBank.scrollBy(distToEnd);
  }

  public get width() { return this.args.width; }
  public get height() { return this.args.height; }

  public get all() {
    this.assertScroll();
    return this.liveBanks.slice(0);
  }

  public get allTracks() {
    return this.all.map(({track}) => track);
  }

  public get selected() {
    return this.get("SELECTED");
  }

  public get selectedTrack() {
    return this.getTrack("SELECTED");
  }

  public get isRecording() {
    return this.clips.all.some((clip) => clip.isRecording().get());
  }

  public get nextRecordingBankNum() {
    const out = eI().vars.get("MASTER", SHARED_STATE.nextRecord);
    println("nextRecordingBankNu:m" + JSON.stringify(out));
    return out && out.value ? parseInt(out.value) : undefined;
  }

  public set nextRecordingBankNum(bankId: BankId | undefined) {
    const bankNum = bankId === undefined ? undefined : this.bankIdToNum(bankId);
    eI().vars.get("MASTER", SHARED_STATE.nextRecord)!.value = bankNum === undefined ? undefined : String(bankNum);
  }

  public bankIdToNum(bankId: BankId) {
    switch (bankId) {
      case "MASTER": return Math.max(0, this.maxTracksAvailable - 1);
      case "SELECTED": return this.selectedBankNum;
      default: return bankId;
    }
  }

  public get(bankId: BankId) {
    this.assertScroll();
    const bankConf = this.liveBanks[this.bankIdToNum(bankId)];
    if (!bankConf) {
      throw new Error(`Bank of id ${bankId} could not be found`);
    }
    return bankConf;
  }

  public getTrack(bankId: BankId): API.Track {
    return this.get(bankId).getItemAt(0);
  }

  

  public moveTrackSelection(numSteps: number) {
    if (numSteps === 0) { return; }
    const target = Math.max(0, Math.min(this.maxTracksAvailable - 1, this.selectedBankNum + numSteps));
    println(target + " " + numSteps + " select: " + this.selectedBankNum);
    if (target === this.selectedBankNum) { return; }
    this.focus(target);
    this.arm(target);
  }


  public init() {
    this.initLiveBanks();
    this.clips.init();
    this._assertScroll = false;
  }

  protected initLiveBanks() {
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
      }, -1)

      const banks = this;
      const decorators: eIBankDecorators = {
        params,
        endDeviceBank,
        endParams,
        get track() { return bitwigBank.getItemAt(0); },
        get isSelected() { return banks.selectedBankNum === t; },
        select() { banks.select(t); },
        get clips() {
          const out: API.ClipLauncherSlot[] = [];
          const clips = bitwigBank.getItemAt(0).clipLauncherSlotBank();
          for (let c = 0; c < banks.width; c++) {
            out.push(clips.getItemAt(c));
          }
          return out;
        }
      }
      this.liveBanks[t] = new Proxy(bitwigBank, {
        get: (self, key) => {
          if (key in decorators) {
            return (decorators as any)[key];
          }
          return (self as any)[key];
        }
      }) as any;

      track.addIsSelectedInEditorObserver((isSelected) => {
        if (t >= this.maxTracksAvailable) { return; }
        if (isSelected) {
          this._selectedBankNum.value = t;
          println("select" + t)
          this.scrollEndDeviceBank(endDeviceBank)
        }
      })

      track.color().markInterested();
    }
  }


  public scrollTrackBankScenes(bankId: BankId, numScenes: number) {
    this.get(bankId).scrollBy(numScenes);
  }

  public select(bankId: BankId) {
    println("selecting "+bankId);
    this.focus(bankId);
    this.arm(bankId);
  }

  public focus(bankId: BankId) {
    this.getTrack(bankId).selectInEditor();
    const getClip = (sceneId: SceneId) => this.clips.getSlot({ bankId, sceneId});
    const selectClip = getClip("PLAYING") || getClip("LAST_CONTENT") || getClip("FIRST_OPEN");
    selectClip!.select();
  }

  public stop(bankId: BankId) {
    this.getTrack(bankId).stop()
  }

  public setSolo(bankId: BankId, mode: "on" | "off" | "toggle") {
    const solo = this.getTrack(bankId).solo();
    mode === "toggle" ? solo.toggle(false) : solo.set(mode === "on");
  }

  public getSolo(bankId: BankId) {
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


  public arm(bankId: BankId) {
    const bankNum = this.bankIdToNum(bankId);
    const item = this.getTrack(bankNum);
    const color = item.color();
  
    this.liveBanks.forEach((bank, index) => {
      if (index === bankNum) { return; }

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


  public param(bankId: BankId, macroNum: number) {
    this.assertScroll();
    return this.liveBanks[this.bankIdToNum(bankId)].params.getParameter(macroNum);
  }

  public endParam(bankId: BankId, macroNum: number) {
    this.assertScroll();
    const config = this.liveBanks[this.bankIdToNum(bankId)];
    return config.endParams.getParameter(macroNum);
  }


  public hitRecordButton() {
    const nothingEnded = this.endAllRecordings() === false;
    nothingEnded && this.queueRecordInNextEmptySlot("SELECTED")
  }

  public queueRecordInNextEmptySlot(bankId: BankId) {
    const clip = this.clips.getNextEmptySlot(bankId);
    if (clip) {
      clip.record(); 
      clip.select();
    }
  }


  public redoRecordingClips() {
    this.clips.all.forEach((clip) => {
      if (clip.isRecording().get()) {
        clip.deleteObject();
        clip.record();
      }
    })
  }

  public endAllRecordings(next: "play" | "stop" = "play") {
    let result = false;
    this.clips.all.forEach((clip) => {
      if (clip.isRecording().get()) {
        result = true;
        if (next == "play") {
          clip.launch();
        } else {
          const coord = this.clips.getClipSlotCoordinates(clip);
          if (coord == "NOT_FOUND") {
            console.warn("Unable to find clip")
          } else {
            this.stop(coord.bankId)
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