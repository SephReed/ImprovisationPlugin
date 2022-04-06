/// <reference types="typed-bitwig-api" />
import { Banks, BanksArgs } from "./Banks";
import { Observable } from "./Observable";
import { TempoState } from "./Tempo";
export declare type SubPanel = "devices" | "noteEditor" | "mixer" | "automation";
export declare class eImprov {
    protected args: {
        banks: BanksArgs;
    };
    static _singleton?: eImprov;
    readonly app: API.Application;
    undo(): void;
    redo(): void;
    protected _showingSubPanel: SubPanel | undefined;
    get showingSubPanel(): SubPanel | undefined;
    showSubPanel(item: SubPanel): void;
    readonly transport: API.Transport;
    readonly banks: Banks;
    readonly tempo: {
        tap: TempoState;
    };
    constructor(args: {
        banks: BanksArgs;
    });
    protected _params: Params;
    get params(): Params;
}
export declare class Params {
    tempo: Observable<number>;
    isPlaying: Observable<number>;
    playPos: Observable<number>;
}
export declare function eI(): eImprov;
