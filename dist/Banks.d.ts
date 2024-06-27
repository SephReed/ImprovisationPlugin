/// <reference types="typed-bitwig-api" />
import { Clips } from "./Clips";
import { Observable } from "./Observable";
export interface BanksArgs {
    height: number;
    width: number;
    sends: number;
}
export declare type BankId = number | "SELECTED" | "MASTER";
export declare type SceneId = number | "SELECTED" | "PLAY_QUEUED" | "PLAYING" | "RECORDING" | "RECORDING_QUEUED" | "STOP_QUEUED" | "FIRST_OPEN" | "PLAYING_OR_SELECTED" | "LAST_CONTENT" | "FIRST_CONTENT";
export declare type eIBankDecorators = {
    track: API.Track;
    isSelected: boolean;
    params: API.CursorRemoteControlsPage;
    endParams: API.CursorRemoteControlsPage;
    endDeviceBank: API.DeviceBank;
    select(): void;
    clips: API.ClipLauncherSlot[];
};
export declare type eIBank = API.TrackBank & eIBankDecorators;
export declare class Banks {
    protected args: BanksArgs;
    protected liveBanks: Array<eIBank>;
    protected _selectedBankNum: Observable<number>;
    get selectedBankNum(): number;
    get observeSelectedBankNum(): (cb: import("./Observable").Observer<number | undefined>) => void;
    protected _maxTracksAvailable: Observable<number>;
    get maxTracksAvailable(): number;
    get observeMaxTracksAvailable(): (cb: import("./Observable").Observer<number | undefined>) => void;
    readonly clips: Clips;
    constructor(args: BanksArgs);
    protected _assertScroll: boolean;
    protected assertScroll(): void;
    updateBankScrollPositions(): void;
    protected scrollEndDeviceBank(deviceBank: API.DeviceBank): void;
    get width(): number;
    get height(): number;
    get all(): eIBank[];
    get allTracks(): API.Track[];
    get selected(): eIBank;
    get selectedTrack(): API.Track;
    get isRecording(): boolean;
    get nextRecordingBankNum(): BankId | undefined;
    set nextRecordingBankNum(bankId: BankId | undefined);
    bankIdToNum(bankId: BankId): number;
    get(bankId: BankId): eIBank;
    getTrack(bankId: BankId): API.Track;
    moveTrackSelection(numSteps: number): void;
    init(): void;
    protected initLiveBanks(): void;
    scrollTrackBankScenes(bankId: BankId, numScenes: number): void;
    select(bankId: BankId): void;
    focus(bankId: BankId): void;
    stop(bankId: BankId): void;
    setSolo(bankId: BankId, mode: "on" | "off" | "toggle"): void;
    getSolo(bankId: BankId): void;
    arm(bankId: BankId): void;
    param(bankId: BankId, macroNum: number): API.RemoteControl;
    endParam(bankId: BankId, macroNum: number): API.RemoteControl;
    hitRecordButton(): void;
    queueRecordInNextEmptySlot(bankId: BankId): void;
    redoRecordingClips(): void;
    endAllRecordings(next?: "play" | "stop"): boolean;
}
