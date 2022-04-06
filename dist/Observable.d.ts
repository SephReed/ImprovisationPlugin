/// <reference types="typed-bitwig-api" />
export declare type ObservableNeededFns<T> = {
    listener: (cb: Observer<T>) => void;
    set: (val: T) => void;
};
export declare type ObservableArgs<T> = ObservableNeededFns<T> | {
    param: API.Parameter | API.SettableBooleanValue | API.SettableBeatTimeValue;
} | {
    value: T;
};
export declare type Observer<T> = (val: T) => void;
export declare class Observable<T> {
    protected args: ObservableArgs<T>;
    protected observers?: Array<Observer<T>>;
    protected currentVal: T;
    protected neededFns: ObservableNeededFns<T> | undefined;
    constructor(args: ObservableArgs<T>);
    get value(): T;
    set value(newVal: T);
    init(): void;
    protected updateValAndDispatch(newVal: T): void;
    observe(cb: Observer<T | undefined>): void;
    onChange(cb: Observer<T>): void;
}
