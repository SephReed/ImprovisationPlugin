export declare type TempoListener = (state: TempoState) => void;
export interface Impulse {
    time: number;
    absBeat?: number;
}
export interface TempoStateArgs {
    maxImpulseSpace: number;
}
export declare class TempoState {
    protected args: TempoStateArgs;
    constructor(args?: Partial<TempoStateArgs>);
    protected startTapTime: number;
    protected impulses: Impulse[];
    protected get mostRecentImpulse(): null | Impulse;
    protected clearOldImpulses(): void;
    protected _bpm: number;
    get bpm(): number;
    bpmAsUnitOfRange(range?: {
        min: number;
        max: number;
    }): number;
    protected _confidence: number;
    get confidence(): number;
    impulse(): void;
    protected listeners: TempoListener[];
    onUpdate(cb: TempoListener): void;
}
