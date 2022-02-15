
export type ObservableNeededFns<T> = {
  listener: (cb: Observer<T>) => void;
  set: (val: T) => void;
  // historyLength?: number;
}


export type ObservableArgs<T> = ObservableNeededFns<T>| {
  param: API.Parameter | API.SettableBooleanValue | API.SettableBeatTimeValue;
}

export type Observer<T> = (val: T) => void;

export class Observable<T> {
  protected observers?: Array<Observer<T>>;
  protected currentVal: T = undefined as any;
  protected neededFns: ObservableNeededFns<T>;
  // protected valHistory: T[] = [];

  constructor(protected args: ObservableArgs<T>) {
    if ("param" in args) {
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
    }
  }

  public get value() { return this.currentVal; }
  public set value(newVal: T) {
    this.neededFns.set(newVal);
  }

  public init() {
    if (this.observers) { return; }
    this.observers = [];
    this.neededFns.listener((val) => {
      this.currentVal = val;
      this.observers!.forEach(cb => cb(val))
    })
  }

  public observe(cb: Observer<T | undefined>) {
    this.onChange(cb);
    cb(this.value);
  }

  public onChange(cb: Observer<T>) {
    this.observers!.push(cb);
  }
}