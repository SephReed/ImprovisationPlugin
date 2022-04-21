
export type ObservableNeededFns<T> = {
  listener: (cb: Observer<T>) => void;
  set: (val: T) => void;
  // historyLength?: number;
}


export type ObservableArgs<T> = ObservableNeededFns<T> | {
  param: API.Parameter | API.SettableBooleanValue | API.SettableBeatTimeValue;
} | { value: T }

export type Observer<T> = (val: T) => void;

export class Observable<T> {
  protected observers?: Array<Observer<T>>;
  protected currentVal: T = undefined as any;
  protected neededFns: ObservableNeededFns<T> | undefined;
  // protected valHistory: T[] = [];

  constructor(protected args: ObservableArgs<T>) {
    if (!args) {
      throw new Error(`Args required`);

    } else if ("value" in args) {
      this.currentVal = args.value;
      this.init();

    } else if ("param" in args) {
      const { param } = args;
      if ("toggle" in param) {
        this.neededFns = {
          listener: (cb) => param.addValueObserver(cb as any),
          set: (val) => param.set(val as any),
        }
      } else if ("beatStepper" in param) {
        this.neededFns = {
          listener: (cb) => param.addValueObserver(cb as any),
          set: (val) => param.set(val as any),
        }
      } else {
        this.neededFns = {
          listener: (cb) => param.addRawValueObserver(cb as any),
          set: (val) => param.value().set(val as any),
        }
      }
    } else {
      this.neededFns = args;
      this.init();
    }
  }

  public ignoreRepeatValues: boolean = true;

  public get value() { return this.currentVal; }
  public set value(newVal: T) {
    if (this.ignoreRepeatValues && this.currentVal === newVal) { return; }
    this.forceSet(newVal);
  }

  public forceSet(newVal: T) {
    if (this.neededFns) {
      this.neededFns.set(newVal);
    } else {
      this.updateValAndDispatch(newVal);
    }
  }

  public init() {
    if (this.observers) { return; }
    this.observers = [];
    this.neededFns && this.neededFns.listener((val) => {
      this.updateValAndDispatch(val);
    })
  }

  protected updateValAndDispatch(newVal: T) {
    if (this.currentVal === newVal) { return; }
    this.currentVal = newVal;
    this.observers!.forEach(cb => cb(newVal))
  }

  public observe(cb: Observer<T | undefined>) {
    this.onChange(cb);
    cb(this.value);
  }

  public onChange(cb: Observer<T>) {
    this.observers!.push(cb);
  }
}