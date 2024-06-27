/// <reference types="typed-bitwig-api" />
import { MidiNote, StatusType } from "./MidiNote";
import { Painting, PaintingArgs, PixelChangeListener } from "./Painting";
export type RawMidiFilter = {
    channel?: number;
    value?: number | "non-zero";
} & ({
    status?: StatusType | "note";
    index?: number;
} | {
    note?: number;
} | {
    cc?: number;
});
export declare class MidiFilter {
    protected args: RawMidiFilter;
    static from(arg: MidiFilter | RawMidiFilter): MidiFilter;
    readonly status?: StatusType | "note";
    readonly index?: number;
    get channel(): number | undefined;
    get value(): number | "non-zero" | undefined;
    get statusByte(): 128 | 144 | 160 | 176 | 192 | 208 | 224 | 240;
    constructor(args: RawMidiFilter);
    toMididNote(): MidiNote;
    matchesMidiNote(midi: MidiNote): boolean;
    toString(): string;
}
export interface eIControllerArgs<ADD_ACT extends object = {}> {
    define: {
        manufacturer: string;
        productName: string;
        version: string;
        uuid: string;
        author: string;
    };
    ports: {
        in: number;
        out: number;
    };
    portNames: string[] | {
        in: string[];
        out: string[];
    };
    actions: Record<string, RawMidiFilter & ADD_ACT>;
}
export interface ControllerPaintingArgs<PAINT_LOC, PAINT_VAL> extends PaintingArgs<PAINT_LOC> {
    id: string;
    group: string | null;
    zIndex?: number;
    paintCb: PixelChangeListener<PAINT_LOC, PAINT_VAL>;
    select: () => any;
}
export declare class ControllerPainting<LOC = any, VALUE = any> extends Painting<LOC, VALUE> {
    protected args: ControllerPaintingArgs<LOC, VALUE>;
    constructor(args: ControllerPaintingArgs<LOC, VALUE>);
    get id(): string;
    get group(): string | null;
    get zIndex(): number | undefined;
    select(): void;
}
export declare abstract class eIController<ADD_ACT extends object = {}> {
    protected args: eIControllerArgs<ADD_ACT>;
    protected actions: Map<string, ControllerAction>;
    protected paintings: Array<ControllerPainting>;
    protected selectedPaintings: Map<string | null, ControllerPainting<any, any>>;
    constructor(args: eIControllerArgs<ADD_ACT>);
    protected registerDevice(): void;
    init(): void;
    protected midiListeners?: Map<number, Array<((midi: MidiNote) => void)>>;
    protected midiNoteInputs: Array<API.NoteInput>;
    onMidi(cb: (midi: MidiNote) => void, { port }?: {
        port: number;
    }): void;
    onMidiType(filter: MidiFilter | RawMidiFilter, cb: (midi: MidiNote) => void): void;
    onAction(actionName: string, cb: (act: ControllerAction) => void): void;
    onActionNonZero(actionName: string, cb: (act: ControllerAction) => void): void;
    action(actionName: string): ControllerAction;
    getActionArgs(actionName: string): RawMidiFilter & ADD_ACT;
    findActionFromMidi(midi: MidiNote): ControllerAction | undefined;
    sendMidiTo(targetArg: "host" | "device" | {
        target: "host" | "device";
        port: number;
    }, midiArg: MidiNote | MidiFilter | RawMidiFilter): void;
    createPainting<PAINT_LOC, PAINT_VAL>(args: Omit<ControllerPaintingArgs<PAINT_LOC, PAINT_VAL>, "select">): ControllerPainting<PAINT_LOC, PAINT_VAL>;
    getSelectedPainting(group: string | null): ControllerPainting<any, any> | undefined;
}
declare class ControllerAction {
    protected controller: eIController;
    readonly name: string;
    static MAX_TAP_TIME: number;
    static MAX_CHAIN_TIME: number;
    protected history: Array<{
        time: number;
        note: MidiNote;
    }>;
    protected filter: MidiFilter;
    constructor(controller: eIController, name: string, _filter: MidiFilter | RawMidiFilter);
    matchesMidi(midi: MidiNote): boolean;
    get currentState(): MidiNote | undefined;
    tryConsumeUpdate(midi: MidiNote): void;
    update(newState: MidiNote): void;
    get atZero(): boolean;
    get isOn(): boolean;
    get isOff(): boolean;
    get data1(): number | undefined;
    get data2(): number | undefined;
    get index(): number | undefined;
    get value(): number | undefined;
    protected updateListeners: Array<((act: ControllerAction) => void)>;
    onUpdate(cb: (act: ControllerAction) => void, filter?: MidiFilter | RawMidiFilter): void;
    onTap(cb: (act: ControllerAction) => void, args?: {
        nTimes: number;
    }): void;
    protected tapWaitTimeout: number;
    onHold(cb: (act: ControllerAction) => void, args?: {
        time: number;
    }): void;
    tapped(args?: {
        nTimes: number;
    }): boolean;
    toDevice(midi?: MidiFilter | RawMidiFilter): void;
}
export {};
