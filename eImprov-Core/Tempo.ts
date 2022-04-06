

export type TempoListener = (state: TempoState) => void;

export interface Impulse {
  time: number;
  absBeat?: number;
}

export interface TempoStateArgs {
  maxImpulseSpace: number;
}

export class TempoState {
  protected args: TempoStateArgs;

  constructor(args: Partial<TempoStateArgs> = {}) {
    this.args = {
      maxImpulseSpace: 2000,
      ...args,
    }
  }

  protected startTapTime: number = -1;
  protected impulses: Impulse[] = [];
  protected get mostRecentImpulse(): null | Impulse {
    return this.impulses[this.impulses.length - 1];
  }

  protected clearOldImpulses() {
    if (!this.mostRecentImpulse) { return; }
    if ((Date.now() - this.mostRecentImpulse.time) > this.args.maxImpulseSpace) {
      this.impulses = [];
      this._bpm = -1;
      this._confidence = 0;
      this.startTapTime = -1;
    }
  }

  protected _bpm: number = -1;
  public get bpm() {
    return this._bpm;
  }

  public bpmAsUnitOfRange(range = {
    min: 20,
    max: 666,
  }) {
    return (this.bpm - range.min)/(range.max - range.min);
  }

  protected _confidence: number = 0;
  public get confidence() {
    return this._confidence;
  }

  public impulse() {
    const now = Date.now();
    this.clearOldImpulses();
    this.impulses.push({
      time: now
    });
    if (this.startTapTime < 0) {
      this.startTapTime = now;
    } else {
      const msPerBeat = (now - this.startTapTime) / (this.impulses.length - 1);
      // println(msPerBeat +"ms / beat")
      this._bpm = (60 * 1000) / msPerBeat;
      this._confidence = 1 - (1/(this.impulses.length - 1));
      this._confidence = Math.round(this._confidence * 1000) / 1000;
      this.listeners.forEach((cb) => cb(this));
    }
  }

  protected listeners: TempoListener[] = [];
  public onUpdate(cb: TempoListener) {
    this.listeners.push(cb);
  }
}