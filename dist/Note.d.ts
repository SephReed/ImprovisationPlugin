/// <reference types="typed-bitwig-api" />
export declare class Note {
    args: {
        noteStep: API.NoteStep;
        xOffset: number;
    };
    static numSteps: number;
    constructor(args: {
        noteStep: API.NoteStep;
        xOffset: number;
    });
}
