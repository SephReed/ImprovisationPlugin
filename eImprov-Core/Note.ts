


export class Note {
  public static numSteps = 16 * 3;

  constructor(public args: {
    noteStep: API.NoteStep;
    xOffset: number;
  }) {
    // ----
  }

  // public get clipPos() {
  //   // return this.args.xOffset + this.noteStep
  // }
}