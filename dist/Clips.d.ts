/// <reference types="typed-bitwig-api" />
import { BankId, Banks, SceneId } from "./Banks";
import { Observable } from "./Observable";
import { PolyfilledCursorClip } from "./TypePolyfills";
export type ClipCoordinate = {
    bankId: BankId;
    sceneId: SceneId;
};
export type ReRecMode = "LOOP_LAYER" | "LOOP_EXTEND" | "NO_LOOP";
export type SomeAreMode = "recording" | "rec-queued" | "rec-or-queued";
export declare class Clips {
    protected banks: Banks;
    protected cursor: PolyfilledCursorClip;
    constructor(banks: Banks);
    get all(): API.ClipLauncherSlot[];
    isRecording(bankId?: BankId): boolean;
    protected someAreObservers: Record<SomeAreMode, Map<number | "all", {
        observable: Observable<boolean>;
        hasHooks: boolean;
    }>>;
    protected getSomeAreObserver(mode: SomeAreMode, bankNum: number | "all"): {
        observable: Observable<boolean>;
        hasHooks: boolean;
    };
    protected updateSomeAreObserver(mode: SomeAreMode, bankNum: number | "all"): void;
    someAre(mode: SomeAreMode, args?: {
        bankId: BankId | "all";
    }): boolean;
    observeIfSomeAre(mode: SomeAreMode, args: {
        bankId?: BankId | "all";
        cb: (someAre: boolean) => any;
    }): void;
    get selectedSlot(): API.ClipLauncherSlot | undefined;
    get selectedSlotIndex(): number;
    get cursorNoteSteps(): boolean;
    init(): void;
    bankAndSceneIdToNum(bankId: BankId, sceneId: SceneId): {
        bankNum: number;
        sceneNum: number;
    };
    getSlot(clipCoord: ClipCoordinate): API.ClipLauncherSlot | undefined;
    getSlot(bankId: BankId, sceneId: SceneId): API.ClipLauncherSlot | undefined;
    getClipSlotCoordinates(clipSlot: API.ClipLauncherSlot): ClipCoordinate | "NOT_FOUND";
    getPlayingSlot(bankId: BankId): API.ClipLauncherSlot | undefined;
    getNextEmptySlot(bankId: BankId): API.ClipLauncherSlot | undefined;
    hitSlot(bankId: BankId, sceneId: SceneId): "LAUNCH" | "NEW_RECORDING" | undefined;
    clearSlot(bankId: BankId, sceneId: SceneId): void;
    duplicate(args: ClipCoordinate | {
        from: ClipCoordinate;
        to?: ClipCoordinate;
    }): ClipCoordinate;
    reRecord(args: ClipCoordinate & {
        recMode: ReRecMode;
    }): void;
    reRiff(args: {
        target: ClipCoordinate;
        placement?: ClipCoordinate;
        recMode: ReRecMode;
    }): void;
    tempSelectClip(args: ClipCoordinate, cb: (clip: API.Clip, bankNum: number, sceneNum: number) => any): void;
    transpose(args: ClipCoordinate & {
        steps: number;
    }): void;
    quantize(args: ClipCoordinate & {
        quantAmount?: number;
    }): void;
    modifyLoopLength(args: ClipCoordinate & {
        modAmount: number;
    }): void;
}
