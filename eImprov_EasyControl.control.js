loadAPI(16);

load("/dist/setup.js");
const $ = require("./dist/index.js");


class EasyControl extends $.eIController {
  constructor() {
    super({
      define: {
        manufacturer: "eImprov", 
        productName: "Easy Control 0.9", 
        version: "1.0", 
        uuid: "88ca43e0-8e8e-11ec-b1e5-0800200c9a66",
        author: "Seph Reed",
      },
      ports: {
        in: 1,
        out: 1,
      },
      portNames: ["WORLDE easy CTRL"],
      actions: {
        bankBtn1: { status: "cc", index: 1 },
        bankBtn2: { status: "cc", index: 2 },

        slideAB: { status: "cc", index: 60 },
        prog: { status: "program" },
        progBtn1: { status: "cc", index: 67 },
        progBtn2: { status: "cc", index: 64 },

        btn1: { status: "cc", index: 23 },
        btn2: { status: "cc", index: 24 },
        btn3: { status: "cc", index: 25 },
        btn4: { status: "cc", index: 26 },
        btn5: { status: "cc", index: 27 },
        btn6: { status: "cc", index: 28 },
        btn7: { status: "cc", index: 29 },
        btn8: { status: "cc", index: 30 },
        btnV: { status: "cc", index: 31 },

        slide1: { status: "cc", index: 3 },
        slide2: { status: "cc", index: 4 },
        slide3: { status: "cc", index: 5 },
        slide4: { status: "cc", index: 6 },
        slide5: { status: "cc", index: 7 },
        slide6: { status: "cc", index: 8 },
        slide7: { status: "cc", index: 9 },
        slide8: { status: "cc", index: 10 },
        slideV: { status: "cc", index: 11 },

        knob1: { status: "cc", index: 14 },
        knob2: { status: "cc", index: 15 },
        knob3: { status: "cc", index: 16 },
        knob4: { status: "cc", index: 17 },
        knob5: { status: "cc", index: 18 },
        knob6: { status: "cc", index: 19 },
        knob7: { status: "cc", index: 20 },
        knob8: { status: "cc", index: 21 },
        knobV: { status: "cc", index: 22 },

        loop: { status: "cc", index: 49 },
        rewind: { status: "cc", index: 47 },
        ff: { status: "cc", index: 48 },
        stop: { status: "cc", index: 46 },
        play: { status: "cc", index: 45 },
        rec: { status: "cc", index: 44 },
      }
    })
  }
}

const controller = new EasyControl();


function init() {
  const ei = new $.eImprov({
    banks: {
      height: 24,
      width: 8,
      sends: 8
    }
  });

  controller.init();

  controller.onMidi((midi) => {
    println(midi.status + midi.channel + " " + midi.data1 + " " + midi.data2);
  });
  const { isPlaying } = ei.params;
  isPlaying.init();

  ei.tempo.tap.onUpdate((tempo) => {
    const { bpm, confidence } = tempo;
    // println(bpm + "bpm - confidence:" + confidence);
    if (confidence > 0.8) {
      const unit = tempo.bpmAsUnitOfRange();
      // println("set: "+unit);
      ei.transport.tempo().setImmediately(unit);
    }
  })

  
  controller.onActionNonZero("loop", (act) => {
    if (ei.banks.isRecording) {
      ei.banks.redoRecordingClips();
    } else {
      ei.banks.clips.reRiff({
        target: {
          bankId: "SELECTED",
          sceneId: "PLAYING",
        },
        recMode: "NO_LOOP"
      });
      // ei.banks.clips.duplicate({
      //   bankId: "SELECTED",
      //   sceneId: "PLAYING",
      // })
      // ei.banks.clips.reRecord({
      //   bankId: "SELECTED",
      //   sceneId: "PLAYING",
      //   recMode: "NO_LOOP"
      // })
    }
  });

  ["rewind", "ff"].forEach((name) => {
    controller.onAction(name, (act) => {
      if (!act.tapped()) { return; }
      ei.banks.clips.modifyLoopLength({ 
        bankId: "SELECTED", 
        sceneId: "PLAYING",
        modAmount: name === "rewind" ? 1/2 : 2
      })
    })
  });

  controller.onAction("stop", (act) => {
    if (act.tapped()) {
      ei.banks.stop("SELECTED");
    }
  });

  controller.onAction("play", (act) => {
    if (act.tapped()) { 
      ei.tempo.tap.impulse();
      return; 
    }
    if (act.isOn) { return; }
    if (isPlaying.value) {
      ei.transport.isMetronomeEnabled().toggle();
    } else {
      isPlaying.value = true;
    }
  });

  controller.onActionNonZero("rec", (act) => {
    ei.banks.hitRecordButton();
  });


  ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6", "btn7", "btn8"].forEach((name, index) => {
    controller.onActionNonZero(name, (act) => {
      const playBtn = controller.action("play");
      if (playBtn.isOn) {
        ei.banks.clips.hitSlot("SELECTED", index);
        return;
      }

      const undoBtn = controller.action("bankBtn1");
      if (undoBtn.isOn) {
        ei.banks.clips.getSlot("SELECTED", index).deleteObject();
        return;
      }

      const stopBtn = controller.action("stop");
      if (stopBtn.isOn) {
        ei.banks.stop(index);
        return;
      }

      const transposeDown = controller.action("progBtn1");
      if (transposeDown.isOn) {
        ei.banks.clips.transpose({
          bankId: "SELECTED",
          sceneId: index,
          steps: -12
        });
        return;
      }

      const transposeUp = controller.action("progBtn2");
      if (transposeUp.isOn) {
        ei.banks.clips.transpose({
          bankId: "SELECTED",
          sceneId: index,
          steps: 12
        });
        return;
      }

      if (ei.banks.isRecording) {
        ei.banks.nextRecordingBankNum = index;
        return;
      }

      ei.banks.select(index);
    })
  });


  ["slide1", "slide2", "slide3", "slide4", "slide5", "slide6", "slide7", "slide8"].forEach((name, index) => {
    controller.onAction(name, (act) => {
      ei.banks.param("SELECTED", index).set(act.value / 127);
    })
  });

  ["knob1", "knob2", "knob3", "knob4", "knob5", "knob6", "knob7", "knob8"].forEach((name, index) => {
    controller.onAction(name, (act) => {
      ei.banks.endParam("SELECTED", index).set(act.value / 127);
    })
  });


  controller.onAction("slideV", (act) => {
    ei.banks.selectedTrack.volume().set(act.value / 127);
  });


  controller.onAction("knobV", (act) => {
    ei.banks.selectedTrack.pan().set(act.value / 127);
  });

  controller.onAction("btnV", (act) => {
    println("Btnv");
    if (controller.action("stop").isOn) {
      ei.transport.stop();
    } else {
      ei.banks.selectedTrack.solo().set(act.isOn);
    }
  });



  ["progBtn1", "progBtn2"].forEach((name) => {
    controller.onAction(name, (act) => {
      if (!act.tapped()) { return; }
      ei.banks.clips.transpose({ 
        bankId: "SELECTED", 
        sceneId: "PLAYING_OR_SELECTED",
        steps: name === "progBtn1" ? -12 : 12
      })
    })
  });


  let lastProgVal = 0;
  controller.onAction("prog", (act) => {
    let newVal = act.data1;
    let steps = 0;
    switch (act.data1) {
      case 0: steps = -1; break;
      case 127: steps = 1; break;
      default: steps = newVal < lastProgVal ? -1 : 1; break;
    }
    lastProgVal = newVal;
    ei.banks.moveTrackSelection(steps);
  });


  ["bankBtn1", "bankBtn2"].forEach((name) => {
    controller.onAction(name, (act) => {
      if (!act.tapped()) { return; }
      // if (name === "bankBtn1") {
      //   ei.banks.clips.cursorNoteSteps;
      // }
      // name === "bankBtn1" ? ei.undo() : ei.redo();

      // println("" + ei.banks.get(1).scrollPosition().get());
      ei.banks.updateBankScrollPositions();
    })
  });
}