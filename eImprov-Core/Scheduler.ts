import { BankId } from "./Banks";
import { eI } from "./eImprov";
import { Observable } from "./Observable";
import { SHARED_STATE } from "./SharedStates";



export type ScheduleTime = "beat" | "measure";
export type ScheduleAction = "mute" | "un-mute" | "solo" | "un-solo";


export class Scheduler {

  public readonly isOnDownBeat = new Observable({value: false});
  public readonly isAtMeasureStart = new Observable({value: false});

  public init() {
    eI().transport.getPosition().addValueObserver((pos) => {
      const beatPos = pos % 1;
      this.isOnDownBeat.value = (beatPos < (1/2) || beatPos > (63/64));

      const measurePos = (pos % 4) / 4;
      let prevValue = this.isAtMeasureStart.value;
      const atStart = this.isAtMeasureStart.value = (measurePos < 1/16 || measurePos > (15/16));
      if (!atStart || prevValue === atStart) {
        return;
      }
      // const timeTill = 
      println("measureStart " + JSON.stringify(eI().vars.entries()));
      eI().vars.entries().forEach(([bankNum, vars]) => {
        const onMeasure = vars.get(SHARED_STATE.onMeasure);
        if (!onMeasure || !onMeasure.value) { return; }
        const actions = onMeasure.value.split(",") as ScheduleAction[];
        const track = eI().banks.getTrack(bankNum);
        actions.forEach((action) => {
          switch (action) {
            case "mute": return track.mute().set(true);
            case "un-mute": return track.mute().set(false);
            case "solo": return track.solo().set(true);
            case "un-solo": return track.solo().set(false);
          }
        })
        onMeasure.value = undefined;
      })
    });
  }

  public schedule(args: {
    bankId: BankId;
    time: ScheduleTime;
    action: ScheduleAction;
    remove?: true;
  }) {
    const store = eI().vars.get(args.bankId, args.time === "beat" ?  SHARED_STATE.onBeat : SHARED_STATE.onMeasure);
    if (!store.value) { return store.value = args.action }

    let values = store.value.split(",");
    if (values.includes(args.action)) { 
      if (args.remove !== true) { return; }
      return store.value = values.filter(it => it !== args.action).join(",");
    } else if (args.remove) {
      return;
    }
    values.push(args.action);
    store.value = values.filter(it => {
      return it !== {
        "mute": "un-mute",
        "un-mute": "mute",
        "solo": "un-solo",
        "un-solo": "solo"
      }[args.action];
    }).join(",");
  }

  public scheduleAll(args: {
    time: ScheduleTime;
    action: ScheduleAction;
    remove?: true;
  }) {
    eI().banks.all.forEach((bank, bankId) => {
      this.schedule({
        ...args,
        bankId
      });
    })
  }
}