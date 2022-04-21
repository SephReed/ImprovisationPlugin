import { Observable } from "./Observable";
import { BankId, Banks } from "./Banks";
export declare enum SHARED_STATE {
    onBeat = "onB",
    onMeasure = "onM",
    nextRecord = "next"
}
export declare class SharedState {
    protected banks: Banks;
    constructor(banks: Banks);
    init(): void;
    protected vars: Map<number, Map<string, Observable<string | undefined>>>;
    get(bankId: BankId, varName: string): Observable<string | undefined>;
    entries(): [number, Map<string, Observable<string | undefined>>][];
    nameToKeyPairs(name: string): Record<string, string> | undefined;
    syncBankName(bankNum: number): void;
}
