export const statusBytes = {
  noteOff: 0b10000000,
  noteOn: 0b10010000,
  poly: 0b10100000,
  cc: 0b10110000,
  program: 0b11000000,
  chanelAftertouch: 0b11010000,
  pitchBend: 0b11100000,
  system: 0b11110000,
} as const

export type StatusType = keyof typeof statusBytes;

const statusMap = new Map<number, StatusType>();
for (let key in statusBytes) {
  statusMap.set((statusBytes as any)[key] >> 4, key as any);
}
// export function getStatusByteFromType(type: StatusType) {
//   return statusBytes
// }


export class MidiNote {
  protected statusMap = new Map<number, StatusType>();

  public static cleanData(stat: number, data1: number, data2: number): [number, number, number] {
    const limit = (val: number, limit = 127) => Math.max(0, Math.min(limit, Math.floor(val)));
    const out = [limit(stat, 255), limit(data1), limit(data2)];
    // println(out.join());
    return out as any;
  }

  constructor(
    public statData: number, 
    public data1: number, 
    public data2: number
  ) {
  }

  public get status(): keyof typeof statusBytes {
    const statusOnly = this.statData >> 4;
    return statusMap.get(statusOnly)!;
  }

  public get statusByte() {
    return this.statData;
  }

  public get channel() {
    return this.statData & 0b00001111;
  }

  public get index() {
    return this.data1;
  }

  public get value() {
    return this.data2;
  }

  public toString() {
    return ["s",this.status, "-c", this.channel, "-i", this.index, "-v", this.value].join("");
  }
}