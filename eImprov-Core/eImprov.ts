import { Observable } from "./Observable";



export class eImprov {
  public static _singleton?: eImprov;

  // -------------

  public readonly app = host.createApplication();
	public readonly transport = host.createTransport();
  
  constructor() {
    if (eImprov._singleton) {
      return eImprov._singleton;
    }
    eImprov._singleton = this;
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
  return eImprov._singleton || new eImprov();
}