load("BitwigObservers.js")


/******************************
*   TRACK DATA STORAGE:
*  used for quneo display
******************************/
var trackSceneSelectPositions = initArray(0, SUPER_BANK_MAX_TRACKS);
var trackSolos = initArray(0, LIVE_BANK_HEIGHT);
var trackMutes = initArray(0, LIVE_BANK_HEIGHT);
var trackRecs = initArray(0, LIVE_BANK_HEIGHT);
var trackVUs = initArray(0, LIVE_BANK_HEIGHT);


var IS_RECORDING = initArray(0, LIVE_BANK_TOTAL_SCENES);
var IS_QEUED = initArray(0, LIVE_BANK_TOTAL_SCENES);
var IS_PLAYING = initArray(0, LIVE_BANK_TOTAL_SCENES);



/******************************
*     VARIABLES
******************************/
var trackVolumes = initArray(0, LIVE_BANK_HEIGHT);
var trackSends = initArray(0, LIVE_BANK_HEIGHT * MAX_MODABLE_SENDS);
var trackMacros = initArray(0, LIVE_BANK_HEIGHT * MAX_DEVICES * MAX_MODABLE_MACROS);
var selectedSendPages = initArray(1, LIVE_BANK_HEIGHT);
var deviceBanks = initArray(null, LIVE_BANK_HEIGHT);
var macroPages = initArray(0, LIVE_BANK_HEIGHT * 4);
// var SELECTED_TRACK = 0;




/******************************
*     INITIALIZATION
******************************/

function initializeBitwigInterface()  {
    initializeBitwigObservers();
}








/******************************
*     SCENE BANK FUNCTIONS
******************************/

//hit clip.  This is the bulk of clip page interactions
//if the square mod button is held, the clip space is cleared
//if an empty space (no content) is hit, a recording is queued
//if a space has a clip launch or relaunch it
function hitClip(trackNum, sceneNum)  {
   //delete clip
  println("square" + squareButton.held);
  if(squareButton.held == true)  {
    squareButton.numUses++;
    removeClip(trackNum, sceneNum);  
  } else {
    var index = (trackNum*LIVE_BANK_WIDTH)+sceneNum;
     //record clip
    if (HAS_CONTENT[index] == false) {
      if(currentPage == CLIP_PAGE) {
        armSingleLiveTrack(trackNum); 
      }
      MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().record(sceneNum);
      // pageAutoSwitch = new CurrentlyRecording(trackNum, sceneNum); 
      // pageAutoSwitch.track = trackNum;
      // pageAutoSwitch.scene = sceneNum;
      // pageAutoSwitch.status = RECORDING_QUEUED;
      println("recording queued");
      // setPage(DRUM_PAGE);
      MDI_rememberRecEntryPoint();
      MDI_setPage(DRUM_PAGE);

        //if the scene being recorded in is the last visible one, automatically scroll
        //the clips so there will be another empty one available
      if(sceneNum == LIVE_BANK_WIDTH - 1)  {
        attemptScrollSceneUp(trackNum);  
      }


    //launch clip
    } else {
      MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().launch(sceneNum);
    }
  } 
}

//---------------------------------------------------------------------------

function soloTrack(trackNum, state)  {
    if(squareButton.held == true && state == true)  {
        squareButton.numUses++;
        getTrackFromBank(trackNum).getSolo().toggle();   }
    else if(squareButton.held == false)  {
        trackSolos[trackNum].setHeld(state);  }
}

//---------------------------------------------------------------------------

function muteTrack(trackNum, state)  {
    if(squareButton.held == true && state == true)  {
        squareButton.numUses++;
        getTrackFromBank(trackNum).getMute().toggle();   }
    else if(squareButton.held == false)  {
        trackMutes[trackNum].setHeld(state);  }
}



  
//---------------------------------------------------------------------------

//checks to see if scene bank for track can move right.  if it can, it moves 
//it right one scene
function attemptScrollSceneUp(trackNum)  {
  if(trackSceneSelectPositions[trackNum] < totalScenesAvailable - LIVE_BANK_WIDTH) {
    MDI_liveBank[trackNum].scrollScenesDown();  
    trackSceneSelectPositions[trackNum]++;  
  }
}

function attemptScrollSceneDown(trackNum)  {
  if(trackSceneSelectPositions[trackNum] > 0) {
    MDI_liveBank[trackNum].scrollScenesUp();  
    trackSceneSelectPositions[trackNum]--;  
  }
}

//---------------------------------------------------------------------------

//this is a still *buggy*.  only works if you have your cursor in the clip area.
//otherwise it deletes whatever you have selected.
//if your clip is in the right area, it selects a clip and delete's it
//Bitwig requires clipLauncher.delete(sceneNum) for this to be done correctly
function removeClip(trackNum, sceneNum)  {
  MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().getItemAt(sceneNum).deleteObject();
  // application.remove(); 
  // MDI_liveBank[trackNum].getChannel(trackNum).getClipLauncher().createEmptyClip(sceneNum, 0);
  var clipIndex = (trackNum*LIVE_BANK_WIDTH)+sceneNum;  
  HAS_CONTENT[clipIndex] = false;  
}


//---------------------------------------------------------------------------

//this scrolls all the track banks up or down x spaces, and then moves them
//left or right to match where they once were.  Kind of a hack.
function moveAllTrackBanks(spaces) {
  if(spaces == 0) { return; }
      //
  for(var t = 0; t < 8; t++) {
      //move bank up or down
    var bank = MDI_liveBank[t];
    for(var i = 0; i < Math.abs(spaces); i++) {
      if(spaces < 0) {
        bank.scrollTracksUp();  }
      else {
        bank.scrollTracksDown();  }
    }

     //finds the diffence in the leftmost scene position of this track vs the 
     //last track this bank once was on
    var trackIndex = MDI_liveBankPosition + t;
    var dScene = trackSceneSelectPositions[trackIndex] - trackSceneSelectPositions[trackIndex + spaces];
    

     //scrolls the scenes until the diffence is muted
    for(var i = 0; i < Math.abs(dScene); i++) {
      if(dScene > 0) {
        bank.scrollScenesUp();  }
      else {
        bank.scrollScenesDown();  }//
    }
  }

   //then the LED's are relit
  showClipPage();
}



function getRangedVU(trackNum)  {
  var range = 100;
  var out = trackVUs[trackNum] - (127-range);
  out = Math.max(0, out);
  out = Math.floor(127 * (out/range));
  out = Math.min(127, out);

  return out;
}












/******************************
*     MIDI FUNCTIONS
******************************/

function sendNoteOnToBitwig(midiNum, velocity)  {
  println("note, vel: "+midiNum+" "+velocity+" :: "+beatPosition);
  sendMidiToBitwig(144, midiNum, velocity);
}

//---------------------------------------------------------------------------

function sendMidiToBitwig(status, data1, data2)  {
  QUNEONoteIn.sendRawMidiEvent(status, data1, data2);  }









