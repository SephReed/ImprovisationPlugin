import { BankId, Banks, SceneId } from "./Banks";
import { Note } from "./Note";
import { Observable } from "./Observable";
import { PolyfilledCursorClip } from "./TypePolyfills";



export type ClipCoordinate = {
  bankId: BankId;
  sceneId: SceneId;
}


export type ReRecMode = 
  | "LOOP_LAYER"            // keeps loop same length, additions layer on top of each-other
  | "LOOP_EXTEND"           // repeats the original content with the looping, extending the length
  | "NO_LOOP"               // original content stays in place as is

export type SomeAreMode = "recording" | "rec-queued" | "rec-or-queued";


export class Clips {
  protected cursor: PolyfilledCursorClip = null as any;

  constructor(protected banks: Banks) {
    // ------
  }

  public get all() {
    const out: API.ClipLauncherSlot[] = [];
    this.banks.all.forEach((bank) => {
      bank.clips.forEach((clip) => out.push(clip));
    });
    return out;
  }

  public isRecording(bankId?: BankId) {
    const clips: API.ClipLauncherSlot[] = bankId ? this.banks.get(bankId).clips : this.all;
    return clips.some((clip) => clip.isRecording().get());
  }

  protected someAreObservers: Record<
    SomeAreMode, 
    Map<number | "all", {
      observable: Observable<boolean>;
      hasHooks: boolean;
    }>
  > = {
    "recording": new Map(),
    "rec-queued": new Map(),
    "rec-or-queued": new Map(),
  }

  protected getSomeAreObserver(mode: SomeAreMode, bankNum: number | "all") {
    const observers = this.someAreObservers[mode];
    if (!observers.has(bankNum)) {
      observers.set(bankNum, {
        observable: new Observable({value: false as boolean}),
        hasHooks: false,
      });
    }
    return observers.get(bankNum)!;
  }

  protected updateSomeAreObserver(mode: SomeAreMode, bankNum: number | "all") {
    const clips: API.ClipLauncherSlot[] = bankNum !== "all" ? this.banks.get(bankNum).clips : this.all;
    const getValue = () => clips.some((clip) => {
      switch (mode) {
        case "recording": return clip.isRecording().get();
        case "rec-queued": return clip.isRecordingQueued().get();
        case "rec-or-queued": return clip.isRecording().get() || clip.isRecordingQueued().get();
      }
    });
    this.getSomeAreObserver(mode, bankNum).observable.value = getValue();
  }

  public someAre(
    mode: SomeAreMode,
    args: {
      bankId: BankId | "all"
    } = {
      bankId: "all"
    }
  ) {
    const bankNum = args.bankId !== "all" ? this.banks.bankIdToNum(args.bankId) : "all";
    const item = this.getSomeAreObserver(mode, bankNum);
    item.hasHooks === false && this.updateSomeAreObserver(mode, bankNum);
    return item.observable.value;
  }

  public observeIfSomeAre(
    mode: SomeAreMode,
    args: {
      bankId?: BankId | "all";
      cb: (someAre: boolean) => any
    }
  ) {
    const bankNum = args.bankId !== "all" && args.bankId ? this.banks.bankIdToNum(args.bankId) : "all";
    const item = this.getSomeAreObserver(mode, bankNum);
    if (item.hasHooks !== true) {
      const clips: API.ClipLauncherSlot[] = bankNum !== "all" ? this.banks.get(bankNum).clips : this.all;
      clips.forEach((clip) => {
        let hooks: API.BooleanValue[] = [];
        switch (mode) {
          case "recording": hooks = [clip.isRecording()]; break;
          case "rec-queued":  hooks = [clip.isRecordingQueued()]; break;
          case "rec-or-queued": hooks = [clip.isRecording(), clip.isRecordingQueued()]; break;
        }
        hooks.forEach((hook) => hook.addValueObserver(() => this.updateSomeAreObserver(mode, bankNum)))
      });
      item.hasHooks = true;
    }
    item.observable.observe((val) => args.cb(!!val));
  }

  

  public get selectedSlot() {
    return this.all.find((it) => it.isSelected())
  }

  public get selectedSlotIndex() {
    return this.all.findIndex((it) => it.isSelected())
  }

  public get cursorNoteSteps() {
    let noteSteps = [];
    // println(this.cursor.canScrollStepsForwards().get() + " can scroll");
    const bars = Math.ceil(this.cursor.getLoopLength().get());
    for (let b = 0; b < bars; b++) {
      for (let x = 0; x < Note.numSteps; x++) {
        for (let y = 0; y < 127; y++) {
          const step = this.cursor.getStep(0, x, y);
          if (String(step.state()) === "NoteOn") {
            noteSteps.push(x);
            this.cursor.moveStep(x, y, 1, 0);
          }
        } 
      }
      this.cursor.scrollToStep(Note.numSteps);
    }
    this.cursor.scrollToStep(-bars * Note.numSteps);
    println(`steps found: [${noteSteps.join()}]`);
    return true;
  }


  public init() {
    this.cursor = host.createLauncherCursorClip(Math.floor(Note.numSteps * 1.25), 127) as any;
    this.cursor.getLoopLength().markInterested();
    this.cursor.canScrollStepsForwards().markInterested();
    this.cursor.setStepSize(1 / Note.numSteps);
    // this.cursor.playingStep().addValueObserver()

    const clipRecEndObserver = (isRec: boolean) => {
      if (isRec) { return; }
      const nextUp = this.banks.nextRecordingBankNum;
      if (nextUp === undefined || nextUp as number < 0) { return; }
      this.banks.nextRecordingBankNum = undefined;
      this.banks.select(nextUp);
    }

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
    })
  }


  public bankAndSceneIdToNum(bankId: BankId, sceneId: SceneId) {
    const bankNum = this.banks.bankIdToNum(bankId);
    let sceneNum: number;
    if (typeof sceneId === "number") {
      sceneNum = sceneId;
    } else {
      const track = this.banks.getTrack(bankNum);
      const clipBank = track.clipLauncherSlotBank();
      let clips: API.ClipLauncherSlot[] = []; 
      const numClips = clipBank.getSizeOfBank();
      for (let c = 0; c < numClips; c++) {
        clips.push(clipBank.getItemAt(c))
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
          case "LAST_CONTENT":  // clips reversed above
          case "FIRST_CONTENT": return clip.hasContent().get();
        }
      });

      reverseSearch && sceneNum !== -1 && (sceneNum = numClips - 1 - sceneNum)
    }
    println(`${bankId}, ${sceneId} --> ${bankNum}, ${sceneNum}`);
    return { bankNum, sceneNum };
  }




  public getSlot(clipCoord: ClipCoordinate): API.ClipLauncherSlot | undefined;
  public getSlot(bankId: BankId, sceneId: SceneId): API.ClipLauncherSlot | undefined;
  public getSlot(bankIdOrCoord: BankId | ClipCoordinate, maybeSceneId?: SceneId) {
    let bankId: BankId, sceneId: SceneId;
    if (typeof bankIdOrCoord === "object") {
      bankId = bankIdOrCoord.bankId;
      sceneId = bankIdOrCoord.sceneId;
    } else {
      bankId = bankIdOrCoord;
      sceneId = maybeSceneId!;
    }
    const { bankNum, sceneNum } = this.bankAndSceneIdToNum(bankId, sceneId);
    if (bankNum === -1 || sceneNum === -1) {
      return undefined;
    }
    return this.banks.getTrack(bankNum).clipLauncherSlotBank().getItemAt(sceneNum);
  }

  public getClipSlotCoordinates(clipSlot: API.ClipLauncherSlot): ClipCoordinate | "NOT_FOUND" {
    let bankId = -1; 
    let sceneId = -1;;
    const found = this.banks.all.some((bank, index) => {
      sceneId = bank.clips.indexOf(clipSlot);
      if (sceneId > -1) {
        bankId = index;
        return true;
      }
    })
    return found ? { bankId, sceneId } : "NOT_FOUND";
  }

  public getPlayingSlot(bankId: BankId) {
    return this.getSlot(bankId, "PLAYING");
  }

  public getNextEmptySlot(bankId: BankId) {
    return this.getSlot(
      bankId,
      "FIRST_OPEN"
    )
  }

  public hitSlot(bankId: BankId, sceneId: SceneId) {
    const clip = this.getSlot(bankId, sceneId);
    if (!clip) { return; }
    clip.select();
    if (clip.hasContent().get()) {
      clip.launch();
      return "LAUNCH";
    } else {
      this.banks.select(bankId);
      clip.record();
      return "NEW_RECORDING";
    }
  }

  public clearSlot(bankId: BankId, sceneId: SceneId) {
    this.getSlot(bankId, sceneId)!.deleteObject();
  }

  public duplicate(args: ClipCoordinate | {
    from: ClipCoordinate
    to?: ClipCoordinate,
  }) {
    let from: ClipCoordinate = "from" in args ? args.from : args; 
    let to: ClipCoordinate = ("to" in args && args.to) || {
      bankId: from.bankId,
      sceneId: "FIRST_OPEN"
    }
    const target = this.getSlot(to)!.replaceInsertionPoint();
    target.copySlotsOrScenes(this.getSlot(from)!);
    return to;
  }

  public reRecord(args: ClipCoordinate & {
    recMode: ReRecMode
  }) {
    this.getSlot(args)!.record();
  }

  public reRiff(args: {
    target: ClipCoordinate;
    placement?: ClipCoordinate;
    recMode: ReRecMode;
  }) {
    const copyLoc = this.duplicate({
      from: args.target,
      to: args.placement
    });
    this.reRecord({
      ...copyLoc,
      recMode: "NO_LOOP"
    })
  }



  public tempSelectClip(
    args: ClipCoordinate,
    cb: (clip: API.Clip, bankNum: number, sceneNum: number) => any
  ) {
    const { bankNum, sceneNum } = this.bankAndSceneIdToNum(args.bankId, args.sceneId);
    const selected = this.getSlot("SELECTED", "SELECTED");
    const target = this.getSlot(args)!;
    target.select()
    cb(this.cursor, bankNum, sceneNum);
    selected && selected.select();
  }

  
  public transpose(args: ClipCoordinate & {
    steps: number;
  }) {
    this.tempSelectClip(args, (clip) => {
      clip.transpose(args.steps);
    })
  }

  public quantize(args: ClipCoordinate & {
    quantAmount?: number;
  }) {
    this.tempSelectClip(args, (clip) => {
      clip.quantize(args.quantAmount !== undefined ? args.quantAmount : 1);
    })
  }

  public modifyLoopLength(args: ClipCoordinate & {
    modAmount: number;
  }) {
    this.tempSelectClip(args, (clip) => {
      const loopLen = clip.getLoopLength();
      const current = loopLen.get();
      loopLen.set(current * args.modAmount);
    })
  }
}