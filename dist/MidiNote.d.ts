export declare const statusBytes: {
    readonly noteOff: 128;
    readonly noteOn: 144;
    readonly poly: 160;
    readonly cc: 176;
    readonly program: 192;
    readonly chanelAftertouch: 208;
    readonly pitchBend: 224;
    readonly system: 240;
};
export type StatusType = keyof typeof statusBytes;
export declare class MidiNote {
    statData: number;
    data1: number;
    data2: number;
    protected statusMap: Map<number, "noteOff" | "noteOn" | "poly" | "cc" | "program" | "chanelAftertouch" | "pitchBend" | "system">;
    static cleanData(stat: number, data1: number, data2: number): [number, number, number];
    constructor(statData: number, data1: number, data2: number);
    get status(): keyof typeof statusBytes;
    get statusByte(): number;
    get channel(): number;
    get index(): number;
    get value(): number;
    toString(): string;
}
