/// <reference types="typed-bitwig-api" />
export declare type Quantization = "default" | "none" | "8" | "4" | "2" | "1" | "1/2" | "1/4" | "1/8" | "1/16";
export declare type LaunchMode = "play_with_quantization" | "continue_immediately" | "continue_with_quantization";
export declare type PolyfilledClipSlot = API.ClipLauncherSlot & {
    launchWithOptions(quantization: Quantization, launchMode: LaunchMode): void;
};
export declare type PolyfilledCursorClip = API.CursorClip & {
    moveStep(x: number, y: number, dx: number, dy: number): void;
};
