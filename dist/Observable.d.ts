/// <reference types="typed-bitwig-api" />
export type ObservableNeededFns<T> = {
    listener: (cb: Observer<T>) => void;
    set: (val: T) => void;
};
export type ObservableArgs<T> = ObservableNeededFns<T> | {
    param: API.Parameter | API.SettableBooleanValue | API.SettableBeatTimeValue;
} | {
    value: T;
};
export type Observer<T> = (val: T) => void;
export declare class Observable<T> {
    protected args: ObservableArgs<T>;
    protected observers?: Array<Observer<T>>;
    protected currentVal: T;
    protected neededFns: ObservableNeededFns<T> | undefined;
    constructor(args: ObservableArgs<T>);
    ignoreRepeatValues: boolean;
    get value(): T;
    set value(newVal: T);
    forceSet(newVal: T): void;
    init(): void;
    protected updateValAndDispatch(newVal: T): void;
    observe(cb: Observer<T | undefined>): void;
    onChange(cb: Observer<T>): void;
}
