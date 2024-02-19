loadAPI(16);

load("/dist/setup.js");
const $ = require("./dist/index.js");


class NanoKontrol extends $.eIController {
  constructor() {
    super({
      define: {
        manufacturer: "eImprov", 
        productName: "Korg nanoKONTROL2", 
        version: "1.0", 
        uuid: "e61094a0-0e21-11ee-8f7a-0800200c9a66",
        author: "Seph Reed",
      },
      ports: {
        in: 1,
        out: 1,
      },
      portNames: ["nanoKONTROL2 SLIDER/KNOB"],
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
  isPlaying.init();


  const REC_BUTTONS = ["recBtn1", "recBtn2", "recBtn3", "recBtn4", "recBtn5", "recBtn6", "recBtn7", "recBtn8"];
  const SOLO_BUTTONS = ["soloBtn1", "soloBtn2", "soloBtn3", "soloBtn4", "soloBtn5", "soloBtn6", "soloBtn7", "soloBtn8"];
  const MUTE_BUTTONS = ["muteBtn1", "muteBtn2", "muteBtn3", "muteBtn4", "muteBtn5", "muteBtn6", "muteBtn7", "muteBtn8"];

  // ei.tempo.tap.onUpdate((tempo) => {
  //   const { bpm, confidence } = tempo;
  //   // println(bpm + "bpm - confidence:" + confidence);
  //   if (confidence > 0.8) {
  //     const unit = tempo.bpmAsUnitOfRange();
  //     // println("set: "+unit);
  //     ei.transport.tempo().setImmediately(unit);
  //   }
  // })

  
  // controller.onActionNonZero("loop", (act) => {
  //   if (ei.banks.isRecording) {
  //     ei.banks.redoRecordingClips();
  //   } else {
  //     ei.banks.clips.reRiff({
  //       target: {
  //         bankId: "SELECTED",
  //         sceneId: "PLAYING",
  //       },
  //       recMode: "NO_LOOP"
  //     });
  //     // ei.banks.clips.duplicate({
  //     //   bankId: "SELECTED",
  //     //   sceneId: "PLAYING",
  //     // })
  //     // ei.banks.clips.reRecord({
  //     //   bankId: "SELECTED",
  //     //   sceneId: "PLAYING",
  //     //   recMode: "NO_LOOP"
  //     // })
  //   }
  // });

  ["rewind", "ff"].forEach((name) => {
    controller.onAction(name, (act) => {
      if (!act.tapped()) { return; }
      "rewind" ? ei.undo() : ei.redo();
      
      // ei.banks.clips.modifyLoopLength({ 
      //   bankId: "SELECTED", 
      //   sceneId: "PLAYING",
      //   modAmount: name === "rewind" ? 1/2 : 2
      // })
    })
  });

  controller.onAction("stop", (act) => {
    if (act.tapped()) {
      ei.banks.stop("SELECTED");
    }
  });

  controller.onAction("play", (act) => {
    if (act.tapped()) { 
      if(ei.banks.isRecording) {
        ei.banks.endAllRecordings("play");
      } else {
        ei.banks.clips.hitSlot("SELECTED", "SELECTED");
      }
      return; 
    }
    // if (act.isOn) { return; }
    // if (isPlaying.value) {
    //   ei.transport.isMetronomeEnabled().toggle();
    // } else {
    //   isPlaying.value = true;
    // }
  });

  controller.onActionNonZero("rec", (act) => {
    if (act.tapped()) {
      if (ei.banks.isRecording) { 
        ei.banks.redoRecordingClips();
      } else {
        ei.banks.hitRecordButton();
      }
    }
  });

  function tryConsumeBankCombo(bankNum) {
    const playBtn = controller.action("play");
    if (playBtn.isOn) {
      ei.banks.clips.hitSlot("SELECTED", bankNum);
      return true;
    }

    // const undoBtn = controller.action("bankBtn1");
    // if (undoBtn.isOn) {
    //   ei.banks.clips.getSlot("SELECTED", index).deleteObject();
    //   return;
    // }

    const stopBtn = controller.action("stop");
    if (stopBtn.isOn) {
      ei.banks.stop(bankNum);
      return true;
    }

    // ei.banks.endAllRecordings("play");

    // const transposeDown = controller.action("progBtn1");
    // if (transposeDown.isOn) {
    //   ei.banks.clips.transpose({
    //     bankId: "SELECTED",
    //     sceneId: index,
    //     steps: -12
    //   });
    //   return;
    // }

    // const transposeUp = controller.action("progBtn2");
    // if (transposeUp.isOn) {
    //   ei.banks.clips.transpose({
    //     bankId: "SELECTED",
    //     sceneId: index,
    //     steps: 12
    //   });
    //   return;
    // }
    return false;
  }



  REC_BUTTONS.forEach((name, index) => {
    controller.onActionNonZero(name, (act) => {
      println(name + "REC" + act.value);
      // if (tryConsumeBankCombo(index)) {
      //   return;
      // }
      
      if (ei.banks.selectedBankNum === index) {
        ei.banks.hitRecordButton();
        return;
      }

      if (ei.banks.isRecording) {
        ei.banks.nextRecordingBankNum = index;
        return;
      }

      ei.banks.select(index);
    })
  });

  let skipRelease = false;
  SOLO_BUTTONS.forEach((name, index) => {
    controller.onAction(name, (act) => {
      if (act.isOn && tryConsumeBankCombo(index)) {
        return;
      }
      const solo = ei.banks.getTrack(index).solo();
      if (act.isOn && solo.get() === false) {
        solo.set(true);
        skipRelease = true
      } else if (act.isOff) {
        if (skipRelease === false) {
          solo.set(false);
        }
        skipRelease = false;
      }
    })
  });


  ["slide1", "slide2", "slide3", "slide4", "slide5", "slide6", "slide7"].forEach((name, index) => {
    controller.onAction(name, (act) => {
      ei.banks.param("SELECTED", index).set(act.value / 127);
    })
  });

  ["knob1", "knob2", "knob3", "knob4", "knob5", "knob6", "knob7", "knob8"].forEach((name, index) => {
    controller.onAction(name, (act) => {
      ei.banks.endParam("SELECTED", index).set(act.value / 127);
    })
  });


  controller.onAction("slide8", (act) => {
    ei.banks.selectedTrack.volume().set(act.value / 127);
  });


  // controller.onAction("knobV", (act) => {
  //   ei.banks.selectedTrack.pan().set(act.value / 127);
  // });

  // controller.onAction("btnV", (act) => {
  //   println("Btnv");
  //   if (controller.action("stop").isOn) {
  //     ei.transport.stop();
  //   } else {
  //     ei.banks.selectedTrack.solo().set(act.isOn);
  //   }
  // });



  // ["progBtn1", "progBtn2"].forEach((name) => {
  //   controller.onAction(name, (act) => {
  //     if (!act.tapped()) { return; }
  //     ei.banks.clips.transpose({ 
  //       bankId: "SELECTED", 
  //       sceneId: "PLAYING_OR_SELECTED",
  //       steps: name === "progBtn1" ? -12 : 12
  //     })
  //   })
  // });


  // let lastProgVal = 0;
  // controller.onAction("prog", (act) => {
  //   let newVal = act.data1;
  //   let steps = 0;
  //   switch (act.data1) {
  //     case 0: steps = -1; break;
  //     case 127: steps = 1; break;
  //     default: steps = newVal < lastProgVal ? -1 : 1; break;
  //   }
  //   lastProgVal = newVal;
  //   ei.banks.moveTrackSelection(steps);
  // });


  ["trackLeft", "trackRight"].forEach((name) => {
    controller.onAction(name, (act) => {
      if (!act.tapped()) { return; }


      const steps = name === "trackLeft" ? -1 : 1;
      return ei.banks.moveTrackSelection(steps); 
      // if (controller.action("cycle").isOn) {
      // }
      // if (name === "bankBtn1") {
      //   ei.banks.clips.cursorNoteSteps;
      // }
      // name === "bankBtn1" ? ei.undo() : ei.redo();

      // println("" + ei.banks.get(1).scrollPosition().get());
      // ei.banks.updateBankScrollPositions();

      // ei.banks.clips.moveClipSelection();
    });


    ei.banks.observeSelectedBankNum((bankNum) => {
      REC_BUTTONS.forEach((name, index) => {
        controller.sendMidiTo("device", {
          channel: 0,
          status: "cc",
          index: controller.action(name).data1,
          value: index === bankNum ? 127 : 0
        });
      });
    });

    ei.banks.allTracks.forEach((track, bankNum) => {
      console.log("track num" + bankNum);
      // track.solo().addValueObserver((isOn) => {
      //   controller.sendMidiTo("device", {
      //     channel: 0,
      //     status: "cc",
      //     index: controller.action(SOLO_BUTTONS[bankNum]).value,
      //     value: isOn ? 127 : 0
      //   });
      // })
    });
  });


  
}