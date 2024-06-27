/// <reference types="typed-bitwig-api" />
import { Banks, BanksArgs } from "./Banks";
import { Observable } from "./Observable";
import { Scheduler } from "./Scheduler";
import { SharedState } from "./SharedStates";
import { TempoState } from "./Tempo";
export type SubPanel = "devices" | "noteEditor" | "mixer" | "automation";
export declare class eImprov {
    protected args: {
        banks: BanksArgs;
    };
    static _singleton?: eImprov;
    readonly app: API.Application;
    readonly vars: SharedState;
    readonly transport: API.Transport;
    readonly banks: Banks;
    readonly scheduler: Scheduler;
    get schedule(): (args: {
        bankId: import("./Banks").BankId;
        time: import("./Scheduler").ScheduleTime;
        action: import("./Scheduler").ScheduleAction;
        remove?: true | undefined;
    }) => string | undefined;
    readonly tempo: {
        tap: TempoState;
    };
    constructor(args: {
        banks: BanksArgs;
    });
    protected _params: Params;
    get params(): Params;
    protected _showingSubPanel: SubPanel | undefined;
    get showingSubPanel(): SubPanel | undefined;
    undo(): void;
    redo(): void;
    showSubPanel(item: SubPanel): void;
}
export declare class Params {
    tempo: Observable<number>;
    isPlaying: Observable<number>;
    playPos: Observable<number>;
    fillMode: Observable<boolean>;
}
export declare function eI(): eImprov;
