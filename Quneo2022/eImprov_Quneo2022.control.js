loadAPI(16);

load("../dist/setup.js");
const $ = require("../dist/index.js");
const Quneo = require("./QuneoController.js");


const USER_SETTINGS = {
  bigSlider: "endParam8", // "volume"
}


const controller = new Quneo.QuneoController();

function init() {
  const ei = new $.eImprov({
    banks: {
      height: 24,
      width: 6,
      sends: 8
    }
  });

  // ---- STATE ----

  const mainView = controller.createPadPainting("main", "main");

  const drumPadView = controller.createPadPainting("drum", "pad");
  const clipPadView = controller.createPadPainting("clip", "pad");
  const padMode = new $.Observable({ value: "clip" });
  function switchPadMode() {
    padMode.value = padMode.value === "clip" ? "drum" : "clip"
  }
  padMode.observe((mode) => {
    println(`Pad Mode: ${mode}`);
    mode === "clip" ? clipPadView.select() : drumPadView.select()
  });


  const eyeRecordView = controller.createPadPainting("record", "eyes");
  const eyeModeSelectView = controller.createPadPainting("mode", "eyes");
  const eyeMode = new $.Observable({ value: "record" });
  ei.banks.clips.observeIfSomeAre("rec-or-queued", {
    cb: (someAre) => eyeMode.value = someAre ? "record" : "modeSelect",
  })
  eyeMode.observe((mode) => {
    println(`Eye Mode: ${mode}`);
    mode === "record" ? eyeRecordView.select() : eyeModeSelectView.select()
  })

  const sliderVUView = controller.createPadPainting("VU", "sliders");

  // ---- INIT ----

  const { playPos, isPlaying } = ei.params;
  playPos.init();
  isPlaying.init();
  
  controller.init(); 
  

  // ---- ACTIONS ----

  const squareBtn = controller.action("square");

  const octDown = controller.action("bank1Left");
  const octUp = controller.action("bank1Right");

  const loopHalf = controller.action("bank2Left");
  const loopDouble = controller.action("bank2Right");

  const soloHoldStates = new Map();
  const soloHold = controller.action("bank3Left");
  const soloToggle = controller.action("bank3Right");

  const sliders = [
    "bank1SliderX", "bank2SliderX", "bank3SliderX", "bank4SliderX",
    "tooth1Y", "tooth2Y", "tooth3Y", "tooth4Y", 
  ];


  // ---- SETUP VIEWS ------
  
  setupClipPadView();
  setupEyeRecordView();
  setupEyeModeSelectView();
  setupTrackVUMeters();


  // ----- SHARED ACTION

  function trackSelectorPressState(bankNum, isPressed) {
    if (isPressed) {
      if (squareBtn.isOn) {
        ei.banks.stop(bankNum);

      } else if (soloHold.isOn) { 
        ei.banks.setSolo(bankNum, "on");
        soloHoldStates.set(bankNum);

      } else if (soloToggle.isOn) { 
        ei.banks.setSolo(bankNum, "toggle");

      } else {
        ei.banks.select(bankNum);
      } 
      
    } else {
      if (soloHoldStates.has(bankNum)) {
        ei.banks.setSolo(bankNum, "off");
        soloHoldStates.delete(bankNum);
      }
    }
  }


  // ----- ACTION LISTENERS

  // controller.onMidi((midi) => {
  //   println(midi.toString());
  //   // const action = controller.findActionFromMidi(midi);
  //   // println(!action ? `No action for ${midi.toString()}` : action.name)
  // });

  

  squareBtn.onUpdate((act) => {
    act.tapped() && ei.banks.stop("SELECTED");
  });

  controller.onAction("triangle", (act) => {
    if (act.isOff) { return; }
    if (squareBtn.isOn) {
      isPlaying.value = false;
    } else if (isPlaying.value) {
      ei.transport.isMetronomeEnabled().toggle();
    } else {
      isPlaying.value = true;
    }
  })

  controller.onAction("eye1", (act) => {
    if (act.isOff) { return; }
    if (eyeMode.value === "record") {
      ei.banks.redoRecordingClips();
    } else {
      ei.banks.queueRecordInNextEmptySlot("SELECTED");
      padMode.value = "drum";
    }
  });

  controller.onAction("eye2", (act) => {
    if (act.isOff) { return; }
    if (eyeMode.value === "record") {
      ei.banks.endAllRecordings();
    } else {
      switchPadMode();
    }
  });

  // Drum Pads
  for (let i = 1; i <= 16; i++) {
    const padName = `pad${i}`;
    controller.onAction(padName, (act) => {
      if (padMode.value === "drum") {
        if (act.isOn) {
          drumPadView.setPad(padName, { hue: 127 - act.value, value: 127 })
        } else {
          drumPadView.clearPad(padName);
        }
        controller.sendMidiTo("host", {
          status: act.isOn ? "noteOn" : "noteOff",
          index: act.index + 36,
          value: act.value
        })
      }
    })

    controller.onAction(padName + "Pressure", (act) => {
      if (padMode.value === "drum") {
        drumPadView.setPad(padName, { hue: "keep", value: act.value });
      }
    })
  }

  // Clip / Track Select
  for (let row = 0; row < 8; row++) {
    controller.onPadRowColAction({row, col: 0 }, (isPressed) => {
      if (padMode.value === "clip") {
        trackSelectorPressState(row, isPressed);
      }
    });
    controller.onPadRowColAction({row, col: 1 }, (isPressed) => {
      if (padMode.value === "clip") {
        if (isPressed) {
          if (ei.banks.getTrack(row).mute().get()) {
            ei.schedule({ bankId: row, time: "measure", action: "un-mute"});
          } else {
            ei.schedule({ bankId: row, time: "measure", action: "mute"});
          }
        }
      }
    });
    for (let col = 2; col < 8; col++) {
      controller.onPadRowColAction({row, col }, (isPressed) => {
        const sceneId = col - 2;
        if (padMode.value === "clip") {
          if (isPressed) {
            if (squareBtn.isOn) {
              ei.banks.clips.clearSlot(row, sceneId);
  
            } else if (octUp.isOn || octDown.isOn) {
              ei.banks.clips.transpose({ bankId: row, sceneId, steps: octUp.isOn ? 12 : -12 })
  
            } else if (loopHalf.isOn || loopDouble.isOn) {
              ei.banks.clips.modifyLoopLength({ bankId: row, sceneId, modAmount: loopHalf.isOn ? 1/2 : 2 })
            
            } else {
              const outcome = ei.banks.clips.hitSlot(row, sceneId);
              outcome === "NEW_RECORDING" && (padMode.value = "drum");
            }
          } 
        }
      });
    }
  };

  [
    octDown, octUp, loopHalf, loopDouble, "bank3Left", "bank3Right",
    "bank4Left", "bank4Right", "vertArrows1Up", "vertArrows1Down",
    "vertArrows2Up", "vertArrows2Down",
  ].forEach((actId) => {
    const action = typeof actId === "string" ? controller.action(actId) : actId;
    action.onUpdate((act) => {
      mainView.setItem(act.name, act.isOn ? 127 : 0);
    })
  });

  [octDown, octUp].forEach((actType) => 
    actType.onUpdate((act) => {
      act.isOn && ei.banks.clips.transpose({
        bankId: "SELECTED",
        sceneId: "SELECTED",
        steps: actType === octDown ? -12 : 12
      })
    })
  );
  
  [loopHalf, loopDouble].forEach((actType) => 
    actType.onUpdate((act) => {
      act.isOn && ei.banks.clips.modifyLoopLength({
        bankId: "SELECTED",
        sceneId: "SELECTED",
        modAmount: actType === loopHalf ? 1/2 : 2
      })
    })
  );
  
  controller.onAction("bank3Left", (act) => act.isOn && ei.undo());
  controller.onAction("bank3Right", (act) => act.isOn && ei.redo());

  controller.onAction("bank4Left", (act) => act.isOn && ei.undo());
  controller.onAction("bank4Right", (act) => act.isOn && ei.redo());

  controller.onAction("vertArrows1Up", (act) => act.isOn && ei.banks.moveTrackSelection(-1));
  controller.onAction("vertArrows1Down", (act) => act.isOn && ei.banks.moveTrackSelection(1));

  controller.onAction("vertArrows2Up", (act) => 
    act.isOn && ei.scheduler.scheduleAll({ time: "measure", action: "un-mute" })
  );
  controller.onAction("vertArrows2Down", (act) => 
    act.isOn && ei.showSubPanel(ei.showingSubPanel !== "devices" ? "devices" : "noteEditor")
  );

  controller.onAction("largeSliderX", (act) => {
    if (USER_SETTINGS.bigSlider === "volume") {
      ei.banks.getTrack("SELECTED").volume().setImmediately(act.value / 127);
    } else {
      ei.banks.get("SELECTED").endParams.getParameter(8).setImmediately(act.value / 127);
    }
  })

  sliders.forEach((actName, bankNum) => {
    controller.onAction(actName, (act) => {
      trackSelectorPressState(bankNum, act.isOn);
    })
  })


  // ---- DISPLAY ----


  function setupEyeModeSelectView() {
    padMode.observe((mode) => {
      const value = mode === "clip" ? Quneo.EYE_UP : Quneo.EYE_DOWN;
      eyeModeSelectView.setItem("eye1", value);
      eyeModeSelectView.setItem("eye2", value);
    })
  }

  function setupEyeRecordView() {
    ei.params.playPos.observe((pos) => {
      if (eyeMode.value === "record") {
        const value = (pos/4 % 1) * 127;
        eyeRecordView.setItem("eye1", value);
        eyeRecordView.setItem("eye2", 127 - value);
      }
    });
  }


  function setupClipPadView() {
    let currentSelection;
    function updateClipViewSelected() {
      const getPos = (index) => {
        const padNum = [13, 9, 5, 1][Math.floor(index/2)];
        return padNum !== undefined ? {
          name: `pad${padNum}`,
          corner: ["NW", "SW"][index % 2],
        } : undefined
      }
      currentSelection !== undefined && clipPadView.setPadCorner({
        ...currentSelection,
        color: { hue: 0, value: 0 }
      });
      currentSelection = getPos(ei.banks.selectedBankNum);
      if (!currentSelection) { return; }

      clipPadView.setPadCorner({
        ...currentSelection,
        color: { hue: 0, value: 127 }
      });
    }

    function blinkCurrentSelection(off) {
      if (!currentSelection) { return; }
      if (off) {
        clipPadView.setPadCorner({
          ...currentSelection,
          color: { hue: 0, value: 0 }
        });
      } else {
        clipPadView.setPadCorner({
          ...currentSelection,
          color: { hue: 0, value: 127 }
        });
      }
    }
    
    function updateClipViewClip(clip, bankNum, clipNum) {
      let color = { hue: 0, value: 0};
      if (bankNum >= ei.banks.maxTracksAvailable) {
        //
      } else if (clip.isPlaying().get()) {
        color = { hue: Quneo.GREEN, value: 127 }
      } else if (clip.hasContent().get()) {
        color = { 
          hue: clip.isRecording().get() ? Quneo.RED : Quneo.YELLOW, 
          value: 127
        }
      } else {
        color = { hue: Quneo.GREEN, value: 7}
      }
      clipPadView.setPadCornerRowCol({
        row: bankNum,
        col: clipNum + 2
      }, color);
    }

    function updateClipView() {
      ei.banks.all.slice(0, 8).forEach((bank, bankNum) => 
        bank.clips.forEach((clip, clipNum) => {
          updateClipViewClip(clip, bankNum, clipNum);
        })
      );
      updateClipViewSelected();
    }

    ei.banks.observeMaxTracksAvailable(() => updateClipView());
    ei.banks.all.slice(0, 8).forEach((bank, bankNum) => {
      bank.clips.forEach((clip, clipNum) => {
        [clip.hasContent, clip.isPlaying, clip.isRecording].forEach((boolVal) => {
          boolVal().addValueObserver(() => {
            updateClipViewClip(clip, bankNum, clipNum);
          });
        })
      });
      bank.track.mute().addValueObserver((muted) => {
        clipPadView.setPadCornerRowCol({
          row: bankNum,
          col: 1,
        }, {
          hue: Quneo.ORANGE,
          value: muted ? 127 : 0
        })
      })
    });
    ei.banks.observeSelectedBankNum(() => updateClipViewSelected());
    ei.scheduler.isOnDownBeat.observe((onBeat) => blinkCurrentSelection(!onBeat));
  }

  



  function setupTrackVUMeters() {
    sliders.forEach((actName, index) => {
      ei.banks.getTrack(index).addVuMeterObserver(128, -1, false, (value) => {
        sliderVUView.setItem(actName, value);
      })
    });
    
    ei.banks.all.forEach((bank, bankNum) => {
      const onValueChange = (vol) => {
        if (ei.banks.selectedBankNum !== bankNum) { return; }
        sliderVUView.setItem("largeSliderX", vol);
      };
      if (USER_SETTINGS.bigSlider === "volume") { 
        track.volume().addValueObserver(128, onValueChange)
      } else {
        bank.endParams.getParameter(8).addValueObserver(128, onValueChange)
      }
    });

    ei.banks.observeSelectedBankNum((bankNum) => {
      if (USER_SETTINGS.bigSlider === "volume") {
        sliderVUView.setItem("largeSliderX", ei.banks.getTrack(bankNum).volume().get() * 127);
      } else {
        sliderVUView.setItem("largeSliderX", ei.banks.get(bankNum).endParams.getParameter(8).get() * 127);
      }
    })
  }
}