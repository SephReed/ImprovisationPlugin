import { Banks, BanksArgs } from "./Banks";
import { Observable } from "./Observable";
import { TempoState } from "./Tempo";


export type SubPanel =  "devices" | "noteEditor" | "mixer" | "automation";

export class eImprov {
  public static _singleton?: eImprov;

  // -------------

  public readonly app = host.createApplication();
  public undo() { this.app.undo(); }
  public redo() { this.app.redo(); }

  protected _showingSubPanel: SubPanel | undefined;
  public get showingSubPanel() {
    return this._showingSubPanel;
  }
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

	public readonly transport = host.createTransport();
  public readonly banks: Banks;
  public readonly tempo = {
    tap: new TempoState()
  }
  
  constructor(protected args: {
    banks: BanksArgs
  }) {
    this.banks = new Banks(args.banks);
    if (eImprov._singleton) {
      return eImprov._singleton;
    }
    eImprov._singleton = this;
    this.banks.init();
  }

  protected _params: Params = null as any;
  public get params() {
    if (!this._params) {
      this._params = new Params();
    }
    return this._params;
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