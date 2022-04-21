import { Observable } from "./Observable";
import { BankId, Banks } from "./Banks";


export enum SHARED_STATE {
  onBeat = "onB",
  onMeasure = "onM",
  nextRecord = "next",
}

export class SharedState {
  constructor(protected banks: Banks) {
    // --- 
  }

  public init() {
    this.banks.allTracks.forEach((track, bankNum) => {
      track.name().addValueObserver((name) => {
        const keyPairs = this.nameToKeyPairs(name);
        
        if (!this.vars.has(bankNum)) { 
          if (!keyPairs) { return; }
          this.vars.set(bankNum, new Map());
        }

        const bankVars = this.vars.get(bankNum)!;
        for (const key of bankVars.keys()) {
          bankVars.get(key)!.value = keyPairs ? keyPairs[key] : undefined;
          keyPairs && delete keyPairs[key];
        }
        if (keyPairs) {
          println(bankNum + "--" + JSON.stringify(keyPairs));
          for (const key in keyPairs) {
            const addMe = new Observable({value: (keyPairs as any)[key]});
            addMe.onChange(() => this.syncBankName(bankNum));
            bankVars.set(key, addMe);
          }
        }
      });
    })
  }

  protected vars = new Map<number, Map<string, Observable<string | undefined>>>();

  public get(bankId: BankId, varName: string) {
    const bankNum = this.banks.bankIdToNum(bankId);
    if (!this.vars.has(bankNum)) {
      this.vars.set(bankNum, new Map());
    }
    const bankVars = this.vars.get(bankNum)!;
    if (!bankVars.has(varName)) {
      const addMe = new Observable<string | undefined>({ value: undefined });
      addMe.ignoreRepeatValues = false;
      addMe.init();
      bankVars.set(varName, addMe);
      const keyPairs = this.nameToKeyPairs(
        this.banks.getTrack(bankNum).name().get()
      );
      keyPairs && (addMe.value = keyPairs[varName]);
      addMe.onChange(() => this.syncBankName(bankNum))
    }
    return bankVars.get(varName)!;
  }

  public entries() {
    return Array.from(this.vars.entries());
  }

  public nameToKeyPairs(name: string) {
    const match = name.match(/\{(.+)}/);
    if (!match) { return; }
    const keyPairs: Record<string, string> = {};
    match[1].split(",").map((keyPair) => {
      const [key, value] = keyPair.split(":");
      keyPairs[key] = value;
    })
    return keyPairs;
  }

  public syncBankName(bankNum: number) {
    const nameStore = this.banks.getTrack(bankNum).name();
    const currentName = nameStore.get().replace(/\{(.*)}/, "").replace(/[ -]+$/, "");
    let newStore = Array.from(this.vars.get(bankNum)!.entries()).map(([key, observer]) => {
      const { value } = observer;
      return value ? `${key}:${value}` : undefined;
    }).filter(it => !!it).join(",");
    newStore && (newStore = ` -- {${newStore}}`);
    nameStore.set(currentName + newStore);
  }
}