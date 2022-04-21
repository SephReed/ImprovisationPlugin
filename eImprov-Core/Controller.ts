import { MidiNote, statusBytes, StatusType } from "./MidiNote";
import { Painting, PaintingArgs, PixelChangeListener } from "./Painting";




export type RawMidiFilter = {
  channel?: number;
  value?: number | "non-zero";
} & (
  { status?: StatusType | "note"; index?: number; }
  | { note?: number; }
  | { cc?: number; }
);
export class MidiFilter {
  public static from(arg: MidiFilter | RawMidiFilter) {
    return arg instanceof MidiFilter ? arg : new MidiFilter(arg);
  }

  public readonly status?: StatusType | "note";
  public readonly index?: number;
  public get channel() { return this.args.channel; }
  public get value() { return this.args.value; }
  public get statusByte() { 
    return statusBytes[(!this.status || this.status === "note") ? "noteOn" : this.status]; 
  }

  constructor(protected args: RawMidiFilter) {
    if ("status" in args) {
      this.status = args.status;
      this.index = args.index;
    } else if ("note" in args) { 
      this.status = "note";
      this.index = args.note;
    } else if ("cc" in args) {
      this.status = "cc";
      this.index = args.cc;
    }
  }

  public toMididNote() {
    const { statusByte, channel, index, value } = this;
    return new MidiNote(
      statusByte + (channel || 0),
      index || 0,
      value === "non-zero" ? 127 : value || 0
    )
  }

  public matchesMidiNote(midi: MidiNote) {
    const { status, channel, index, value } = this;
    // println(this.toString() + "  " + midi.toString())
    if (status) {
      if (status === "note") {
        if (midi.status !== "noteOff" && midi.status !== "noteOn") {
          return false;
        }
      } else if (midi.status !== status) {
        return false; 
      }
    }
    if (channel !== undefined && midi.channel !== channel) { return false; }
    if (index !== undefined && midi.index !== index) { return false; }
    if (value !== undefined && midi.value !== value) { 
      if (value === "non-zero" && !!midi.value) {
        return true;
      }
      return false; 
    }
    return true;
  }

  public toString() {
    const { status, channel, index, value } = this;
    return `s:${status} c:${channel} i:${index} v:${value}`;
  }
}










export interface eIControllerArgs<ADD_ACT extends object = {}>{
  define: {
    manufacturer: string;
    productName: string;
    version: string;
    uuid: string;
    author: string;
  },
  ports: {
    in: number;
    out: number;
  };
  portNames: string[] | {
    in: string[];
    out: string[]
  };
  actions: Record<string, RawMidiFilter & ADD_ACT>
}







export interface ControllerPaintingArgs<PAINT_LOC, PAINT_VAL> extends PaintingArgs<PAINT_LOC> {
  id: string;
  group: string | null;
  zIndex?: number;
  paintCb: PixelChangeListener<PAINT_LOC, PAINT_VAL>;
  select: () => any;
}

export class ControllerPainting<LOC = any, VALUE = any> extends Painting<LOC, VALUE> {
  constructor(protected args: ControllerPaintingArgs<LOC, VALUE>){
    super();
    this.onUpdate(args.paintCb);
  }

  public get id() { return this.args.id; }
  public get group() { return this.args.group; }
  public get zIndex() { return this.args.zIndex; }
  
  public select() { this.args.select(); }
}


export abstract class eIController<ADD_ACT extends object = {}> {
  protected actions = new Map<string, ControllerAction>();
  protected paintings: Array<ControllerPainting> = [];
  protected selectedPaintings = new Map<string | null, ControllerPainting>();

  constructor(protected args: eIControllerArgs<ADD_ACT>) {
    this.registerDevice();
  }

  protected registerDevice() {
    const { ports, portNames, define } = this.args;
    const { manufacturer, productName, version, uuid, author } = define;

    host.defineController(manufacturer, productName, version, uuid, author);
    host.defineMidiPorts(ports.in, ports.out); 
    host.addDeviceNameBasedDiscoveryPair(
      Array.isArray(portNames) ? portNames : portNames.in,
      Array.isArray(portNames) ? portNames : portNames.out,
    );

    for (let name in this.args.actions) {
      this.actions.set(name, new ControllerAction(this, name, (this.args.actions as any)[name]));
    }
  }

  public init() {
    this.onMidi((midi) => this.actions.forEach((act) => act.tryConsumeUpdate(midi)));
    const { portNames } = this.args;
    (Array.isArray(portNames) ? portNames : portNames.in).forEach((portName, port) => {
      const addMe = host.getMidiInPort(port).createNoteInput(portName, "000000"); // feed nothing directly to Bitwig
      addMe.setShouldConsumeEvents(false);
      this.midiNoteInputs.push(addMe);
    })
  }

  protected midiListeners?: Map<number, Array<((midi: MidiNote) => void)>>;
  protected midiNoteInputs: Array<API.NoteInput> = [];
  public onMidi(
    cb: (midi: MidiNote) => void,
    { port } = { port: 0}, 
  ) {
    if (!this.midiListeners) {
      this.midiListeners = new Map();
    }
    if (!this.midiListeners.has(port)) {
      this.midiListeners.set(port, []);
      host.getMidiInPort(port).setMidiCallback(
        (status, data1, data2) => {
          const midi = new MidiNote(status, data1, data2);
          this.midiListeners!.get(port)!.forEach((cb) => cb(midi));
        }
      );
    }
    this.midiListeners!.get(port)!.push(cb);
  }

  public onMidiType(
    filter: MidiFilter | RawMidiFilter,
    cb: (midi: MidiNote) => void,
  ) {
    this.onMidi((midi) => 
      MidiFilter.from(filter).matchesMidiNote(midi) && cb(midi)
    )
  }
  

  public onAction(
    actionName: string,
    cb: (act: ControllerAction) => void,
  ) {
    this.action(actionName).onUpdate(cb);
  }

  public onActionNonZero(
    actionName: string,
    cb: (act: ControllerAction) => void,
  ) {
    this.action(actionName).onUpdate(cb, {
      value: "non-zero"
    });
  }

  public action(actionName: string) {
    const act = this.actions.get(actionName);
    if (!act) { throw new Error(`Can not find action "${actionName}"`)};
    return act;
  }

  public getActionArgs(actionName: string) {
    return this.args.actions[actionName];
  }

  public findActionFromMidi(midi: MidiNote) {
    for (let [name, action] of this.actions) {
      if (action.matchesMidi(midi)) {
        return action;
      }
    }
    return undefined;
  }

  public sendMidiTo(
    targetArg: "host" | "device" | { target: "host" | "device", port: number}, 
    midiArg: MidiNote | MidiFilter | RawMidiFilter
  ) {
    const midi = midiArg instanceof MidiNote ? midiArg : (
      MidiFilter.from(midiArg).toMididNote() 
    );
    const { target, port} = typeof targetArg === "string" ? { target: targetArg, port: 0} : targetArg
    if (target === "device") {
      host.getMidiOutPort(port).sendMidi(...MidiNote.cleanData(midi.statusByte, midi.index, midi.value))
    } else {
      this.midiNoteInputs[port].sendRawMidiEvent(midi.statusByte, midi.index, midi.value);
    }
  }

  public createPainting<PAINT_LOC, PAINT_VAL>(args: Omit<ControllerPaintingArgs<PAINT_LOC, PAINT_VAL>, "select">) {
    if (this.paintings.some(({group, id}) => group === args.group && id === args.id)) {
      throw new Error(`Painting already created`);
    }
    const addMe: ControllerPainting<PAINT_LOC, PAINT_VAL> = new ControllerPainting({
      ...args,
      select: () => {
        const selected = this.selectedPaintings.get(addMe.group);
        selected && selected.unPaint();
        this.selectedPaintings.set(addMe.group, addMe)
        addMe.repaint();
      },
      paintCb: (updates) => {
        if (this.getSelectedPainting(addMe.group) === addMe) {
          args.paintCb(updates);
        }
      }
    });
    this.paintings.push(addMe);
    if (this.selectedPaintings.has(args.group) === false) {
      this.selectedPaintings.set(args.group, addMe);
    }
    return addMe;
  }

  public getSelectedPainting(group: string | null) {
    return this.selectedPaintings.get(group);
  }
}













class ControllerAction {
  public static MAX_TAP_TIME = 200;
  public static MAX_CHAIN_TIME = 250;

  protected history: Array<{time: number, note: MidiNote}> = [];
  protected filter: MidiFilter;

  constructor(
    protected controller: eIController,
    public readonly name: string,
    _filter: MidiFilter | RawMidiFilter
  ) {
    this.filter = MidiFilter.from(_filter);
  }

  public matchesMidi(midi: MidiNote) {
    return this.filter.matchesMidiNote(midi);
  }

  public get currentState() {
    const item = this.history[this.history.length - 1];
    return item ? item.note : undefined;
  }

  public tryConsumeUpdate(midi: MidiNote) {
    if (this.matchesMidi(midi)) {
      this.update(midi);
    }
  }

  public update(newState: MidiNote) {
    this.history.push({
      note: newState,
      time: Date.now(),
    });
    this.history = this.history.slice(-10);
    this.updateListeners.forEach((cb) => {
      try {
        cb(this)
      } catch(err) {
        host.showPopupNotification("Error caught.  See Console.")
        println(`ERR: ` + err);
        println((new Error()).stack + "");
      }
    });
  }

  public get atZero() {
    return !(this.value);
  }
  public get isOn() { 
    switch (this.currentState?.status) {
      case "noteOn": return true;
      case "noteOff": return false;
    }
    return !this.atZero; 
  }
  public get isOff() { return !this.isOn; }

  public get data1() { return this.currentState?.data1; }
  public get data2() { return this.currentState?.data2; }
  public get index() { return this.data1; }
  public get value() { return this.data2; }

  protected updateListeners: Array<((act: ControllerAction) => void)> = [];
  public onUpdate(
    cb: (act: ControllerAction) => void,
    filter?: MidiFilter | RawMidiFilter,
  ) {
    if (filter) {
      const oldCb = cb;
      cb = (act) => {
        const midi = act.currentState;
        if (midi && this.filter.matchesMidiNote(midi)) {
          oldCb(act);
        }
      }
    }
    this.updateListeners.push(cb);
  }

  public tapped(args: { nTimes: number } = { nTimes: 1 }) {
    if (this.isOn) { return false; }
    let release: number | undefined = this.history[this.history.length - 1].time;

    let lastTapStart: undefined | number;
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
      } else if (!note.value) {
        release = time;
      }
    }
    return false;
  }

  public toDevice(midi?: MidiFilter | RawMidiFilter) {
    const out = {
      ...this.filter,
      ...midi
    };
    if (out.status && out.status === "note") {
      out.status = "noteOn";
    }
    this.controller.sendMidiTo("device", out);
  }
}