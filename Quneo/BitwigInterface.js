load("BitwigObservers.js")


/******************************
*   TRACK DATA STORAGE:
*  used for quneo display
******************************/
var trackSceneSelectPositions = initArray(0, 127);
var trackArms = initArray(0, MAX_TRACKS);
var trackSolos = initArray(0, MAX_TRACKS);
var trackMutes = initArray(0, MAX_TRACKS);
var trackRecs = initArray(0, MAX_TRACKS);
var trackVUs = initArray(0, MAX_TRACKS);


var numScenes = MAX_SCENES * MAX_TRACKS;

var IS_RECORDING = initArray(0, numScenes);
var HAS_CONTENT = initArray(0, numScenes);
var IS_QEUED = initArray(0, numScenes);
var IS_PLAYING = initArray(0, numScenes);



/******************************
*     VARIABLES
******************************/
var trackVolumes = initArray(0, MAX_TRACKS);
var trackSends = initArray(0, MAX_TRACKS * MAX_MODABLE_SENDS);
var trackMacros = initArray(0, MAX_TRACKS * MAX_DEVICES * MAX_MODABLE_MACROS);
var selectedSendPages = initArray(1, MAX_TRACKS);
var deviceBanks = initArray(null, MAX_TRACKS);
var macroPages = initArray(0, MAX_TRACKS * 4);
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
  if(squareButton.held == true)  {
    squareButton.numUses++;
    removeClip(trackNum, sceneNum);  }
  else  {
    var index = (trackNum*MAX_SCENES)+sceneNum;
     //record clip
    if(HAS_CONTENT[index] == false)  {
      if(currentPage == CLIP_PAGE)  {
        armSingleTrack(trackNum);  }
      TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().record(sceneNum);
      // pageAutoSwitch = new CurrentlyRecording(trackNum, sceneNum); 
      pageAutoSwitch.track = trackNum;
      pageAutoSwitch.scene = sceneNum;
      pageAutoSwitch.status = RECORDING_QUEUED;
      println("recording queued");
        setPage(DRUM_PAGE);

         //if the scene being recorded in is the last visible one, automatically scroll
         //the clips so there will be another empty one available
        if(sceneNum == MAX_SCENES - 1)  {
          attemptScrollSceneUp(trackNum);  }
      }

       //launch clip
      else  {  TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().launch(sceneNum);  }
} }

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

//arming is not done by selecting a track
function armSingleTrack(trackNum)  {
  if(numTracksArmed == 1 && trackArms[trackNum] == true){  return;  }

  if(trackArms[trackNum] != true)  {
    TRACK_BANKS[trackNum].getTrack(trackNum).getArm().set(true);  }
  for(var t = 0; t < 8; t++)  {
    if(t != trackNum && trackArms[t] == true) 
    { TRACK_BANKS[t].getTrack(t).getArm().set(false);  }
} }
  
//---------------------------------------------------------------------------

//checks to see if scene bank for track can move right.  if it can, it moves 
//it right one scene
function attemptScrollSceneUp(trackNum)  {
  if(trackSceneSelectPositions[trackNum] < totalScenesAvailable - MAX_SCENES) {
    TRACK_BANKS[trackNum].scrollScenesDown();  
    trackSceneSelectPositions[trackNum]++;  }
}

//---------------------------------------------------------------------------

//this is a still *buggy*.  only works if you have your cursor in the clip area.
//otherwise it deletes whatever you have selected.
//if your clip is in the right area, it selects a clip and delete's it
//Bitwig requires clipLauncher.delete(sceneNum) for this to be done correctly
function removeClip(trackNum, sceneNum)  {
  TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().select(sceneNum);
  application.remove(); 
  // TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().createEmptyClip(sceneNum, 0);
  var clipIndex = (trackNum*MAX_SCENES)+sceneNum;  
  HAS_CONTENT[clipIndex] = false;  
}

//---------------------------------------------------------------------------

//just a one liner
function createRecordingForCurrentTrack()  {
  createRecordingForTrack(selectedTrack);  }

//---------------------------------------------------------------------------

//iterates through all the visible clips in a bank and start's a recording
//on the first empty one
function createRecordingForTrack(trackNum)  {
  var offset = trackNum * MAX_SCENES;
  for(var sc = 0; sc < MAX_SCENES; sc++)  {
    if(HAS_CONTENT[offset + sc] == false) {
      hitClip(trackNum, sc);
      return;  }
} }

//---------------------------------------------------------------------------

//this scrolls all the track banks up or down x spaces, and then moves them
//left or right to match where they once were.  Kind of a hack.
function moveAllTrackBanks(spaces) {
  for(var t = 0; t < 8; t++) {
     //move bank up or down
    var bank = TRACK_BANKS[t];
    for(var i = 0; i < Math.abs(spaces); i++) {
      if(spaces < 0) {
        bank.scrollTracksUp();  }
      else {
        bank.scrollTracksDown();  }
    }

     //finds the diffence in the leftmost scene position of this track vs the 
     //last track this bank once was on
     //*buggy* 1 is a magic number
    var dScene 
    if(spaces > 0) {
      dScene = trackSceneSelectPositions[topTrackInBank + t] - trackSceneSelectPositions[topTrackInBank + t + 1];  }
    else  {
      dScene = trackSceneSelectPositions[topTrackInBank + t] - trackSceneSelectPositions[topTrackInBank + t - 1];  }

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









