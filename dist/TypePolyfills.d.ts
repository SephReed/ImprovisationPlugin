/// <reference types="typed-bitwig-api" />
export type Quantization = "default" | "none" | "8" | "4" | "2" | "1" | "1/2" | "1/4" | "1/8" | "1/16";
export type LaunchMode = "play_with_quantization" | "continue_immediately" | "continue_with_quantization";
export type PolyfilledClipSlot = API.ClipLauncherSlot & {
    launchWithOptions(quantization: Quantization, launchMode: LaunchMode): void;
};
export type PolyfilledCursorClip = API.CursorClip & {
    moveStep(x: number, y: number, dx: number, dy: number): void;
};
