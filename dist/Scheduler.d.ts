import { BankId } from "./Banks";
import { Observable } from "./Observable";
export type ScheduleTime = "beat" | "measure";
export type ScheduleAction = "mute" | "un-mute" | "solo" | "un-solo";
export declare class Scheduler {
    readonly isOnDownBeat: Observable<boolean>;
    readonly isAtMeasureStart: Observable<boolean>;
    readonly timeoutListeners: Map<number, {
        targetPos: number;
        cb: () => any;
    }>;
    init(): void;
    schedule(args: {
        bankId: BankId;
        time: ScheduleTime;
        action: ScheduleAction;
        remove?: true;
    }): string | undefined;
    scheduleAll(args: {
        time: ScheduleTime;
        action: ScheduleAction;
        remove?: true;
    }): void;
    protected timeoutID: number;
    setTimeout(cb: () => any, ms: number): number;
    clearTimeout(id: number): void;
}
