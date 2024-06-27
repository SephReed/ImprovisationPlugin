loadAPI(16);

load("/dist/setup.js");
const $ = require("./dist/index.js");

class Step12 extends $.eIController {
  constructor() {
    super({
      define: {
        manufacturer: "eImprov", 
        productName: "12 Step", 
        version: "1.0", 
        uuid: "FE086F1E-6173-11E5-9380-A8E688D887A8",
        author: "Seph Reed",
      },
      ports: {
        in: 1,
        out: 1,
      },
      portNames: ["12 Step"],
      actions: {
        trackLeft: { status: "cc", index: 58 },
        trackRight: { status: "cc", index: 59 },

        cycle: { status: "cc", index: 46 },

        markerSet: { status: "cc", index: 60 },
        markerLeft: { status: "cc", index: 61 },
        markerRight: { status: "cc", index: 62 },

        rewind: { status: "cc", index: 43 },
        ff: { status: "cc", index: 44 },
        stop: { status: "cc", index: 42 },
        play: { status: "cc", index: 41 },
        rec: { status: "cc", index: 45 },

        soloBtn1: { status: "cc", channel: 0, index: 32 },
        soloBtn2: { status: "cc", channel: 0, index: 33 },
        soloBtn3: { status: "cc", channel: 0, index: 34 },
        soloBtn4: { status: "cc", channel: 0, index: 35 },
        soloBtn5: { status: "cc", channel: 0, index: 36 },
        soloBtn6: { status: "cc", channel: 0, index: 37 },
        soloBtn7: { status: "cc", channel: 0, index: 38 },
        soloBtn8: { status: "cc", channel: 0, index: 39 },

        muteBtn1: { status: "cc", channel: 0, index: 48 },
        muteBtn2: { status: "cc", channel: 0, index: 49 },
        muteBtn3: { status: "cc", channel: 0, index: 50 },
        muteBtn4: { status: "cc", channel: 0, index: 51 },
        muteBtn5: { status: "cc", channel: 0, index: 52 },
        muteBtn6: { status: "cc", channel: 0, index: 53 },
        muteBtn7: { status: "cc", channel: 0, index: 54 },
        muteBtn8: { status: "cc", channel: 0, index: 55 },

        recBtn1: { status: "cc", channel: 0, index: 64 },
        recBtn2: { status: "cc", channel: 0, index: 65 },
        recBtn3: { status: "cc", channel: 0, index: 66 },
        recBtn4: { status: "cc", channel: 0, index: 67 },
        recBtn5: { status: "cc", channel: 0, index: 68 },
        recBtn6: { status: "cc", channel: 0, index: 69 },
        recBtn7: { status: "cc", channel: 0, index: 70 },
        recBtn8: { status: "cc", channel: 0, index: 71 },

        slide1: { status: "cc", channel: 0, index: 0 },
        slide2: { status: "cc", channel: 0, index: 1 },
        slide3: { status: "cc", channel: 0, index: 2 },
        slide4: { status: "cc", channel: 0, index: 3 },
        slide5: { status: "cc", channel: 0, index: 4 },
        slide6: { status: "cc", channel: 0, index: 5 },
        slide7: { status: "cc", channel: 0, index: 6 },
        slide8: { status: "cc", channel: 0, index: 7 },

        knob1: { status: "cc", channel: 0, index: 16 },
        knob2: { status: "cc", channel: 0, index: 17 },
        knob3: { status: "cc", channel: 0, index: 18 },
        knob4: { status: "cc", channel: 0, index: 19 },
        knob5: { status: "cc", channel: 0, index: 20 },
        knob6: { status: "cc", channel: 0, index: 21 },
        knob7: { status: "cc", channel: 0, index: 22 },
        knob8: { status: "cc", channel: 0, index: 23 },
      }
    });
  }
}

const controller = new NanoKontrol();


function init() {
  println("KORG test");

  const ei = new $.eImprov({
    banks: {
      height: 24,
      width: 8,
      sends: 8
    }
  });

  controller.init();

  controller.onMidi((midi) => {
    const action = controller.findActionFromMidi(midi);
    action && println(action.name);
    println(midi.status + midi.channel + " " + midi.data1 + " " + midi.data2);
  });
  const { isPlaying } = ei.params;