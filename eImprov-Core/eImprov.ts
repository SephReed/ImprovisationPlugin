import { Banks, BanksArgs } from "./Banks";
import { Observable } from "./Observable";
import { Scheduler } from "./Scheduler";
import { SharedState } from "./SharedStates";
import { TempoState } from "./Tempo";


export type SubPanel =  "devices" | "noteEditor" | "mixer" | "automation";

export class eImprov {
  public static _singleton?: eImprov;

  // -------------

  public readonly app = host.createApplication();
  public readonly vars!: SharedState;
  public readonly transport = host.createTransport();
  public readonly banks!: Banks;
  public readonly scheduler!: Scheduler;

  public get schedule() { return this.scheduler.schedule.bind(this.scheduler); }

  public readonly tempo = {
    tap: new TempoState()
  }
  
  constructor(protected args: {
    banks: BanksArgs
  }) {
    if (eImprov._singleton) {
      return eImprov._singleton;
    }
    eImprov._singleton = this;
    this.banks = new Banks(args.banks);
    this.banks.init();
    this.vars = new SharedState(this.banks);
    this.vars.init();
    this.scheduler = new Scheduler();
    this.scheduler.init();
  }

  protected _params: Params = null as any;
  public get params() {
    if (!this._params) {
      this._params = new Params();
    }
    return this._params;
  }

  protected _showingSubPanel: SubPanel | undefined;
  public get showingSubPanel() {
    return this._showingSubPanel;
  }

  public undo() { this.app.undo(); }
  public redo() { this.app.redo(); }

  
  public showSubPanel(item: SubPanel) { 
    item !== "mixer" ? this.app.toggleMixer() : this.app.toggleDevices();
    switch (item) {
      case "devices": this.app.toggleDevices(); break;
      case "noteEditor": this.app.toggleNoteEditor(); break;
      case "mixer": this.app.toggleMixer(); break;
      case "automation": this.app.toggleAutomationEditor(); break;
    }
    this._showingSubPanel = item;
  }

}


export class Params {
  public tempo = new Observable<number>({ param: eI().transport.tempo() });
  public isPlaying = new Observable<number>({ param: eI().transport.isPlaying() });
  public playPos = new Observable<number>({ param: eI().transport.getPosition() });
}

export function eI() {
  const out = eImprov._singleton;
  if (!out) {
    throw new Error(`An eImprov must be created first`);
  }
  return out;
}