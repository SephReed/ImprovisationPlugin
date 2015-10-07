/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	QUNEO_init.js:  This is where all of the initializations and non page specific functionality for
+		the Quneo is found.  Things like led functions, shared data (ie volume, solo), 
+		and midi processing
+     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/



/*****
TODO:  remove *bad code*
* change name of Flare.js
*/


/******************************
*     DEPENDENCIES:
******************************/
// load("Flair.js")
load("QuneoConstants.js")
load("HelperClasses.js");
load("BitwigInterface.js")
load("DrumPage.js")
load("ClipPage.js")
load("ConductorPage.js")
load("DeviceControls.js")










// var currentPage = DRUM_PAGE;





/******************************
* TRACK INTERACTION VARIABLES:
******************************/
var pageAutoSwitch = new CurrentlyRecording(-1, -1);
pageAutoSwitch.status = RECORDING_CLOSED;

var selectedTrack = 0;





/******************************
*   BUTTON STATE VARIABLES:
******************************/
// var modButton1 = BTN_RELEASED;  //when an *mod button is used*, it's state changes
// var modButton2 = BTN_RELEASED;

var diamondButton = new ModButton();  //when an *mod button is used*, it's state changes
var squareButton = new ModButton();

var stalledPadHits = initArray(null, 16);
var midiOutForPad = initArray(-1, 16);
var currentlyStallingPadHit = false;

var padStates = initArray(null, 16);






/******************************
*     QUNEO HOST DEFINITION:
******************************/
var quneoPortNames = ["QUNEO"];
var QUNEONoteIn;

host.defineController("Keith McMillen Instruments", "QUNEO", "1.0", "A323D780-5AF5-11E4-8ED6-0800200C9A66");
host.defineMidiPorts(1, 1); 
host.addDeviceNameBasedDiscoveryPair(quneoPortNames, quneoPortNames);








/******************************
*     INITIALIZATION
******************************/
function quneoInit()  {
   //further *Quneo Host* definining
   	host.println(QUNEO_LOAD_MSG);
	host.getMidiInPort(0).setMidiCallback(onMidi);

	// var test = host.getPreferences().getStringSetting("Engage", null, 25, "Hello World");
	
	QUNEONoteIn = host.getMidiInPort(0).createNoteInput("QUNEO", "82????", "92????");
	QUNEONoteIn.setShouldConsumeEvents(false);

	for(var i = 0; i < LIVE_BANK_HEIGHT; i++){
		trackSolos[i] = new ToggleableButton(i, TGL_BTN_SOLO);
		trackMutes[i] = new ToggleableButton(i, TGL_BTN_MUTE);  }

	for(var i = 0; i < padStates.length; i++)  {
		padStates[i] = new PadState(i);   }
	
	initializeBitwigInterface();
	octaveHandlerInit();
	MDI_addPageObserver(setPage);
	// setPage(CLIP_PAGE);
}















/******************************
*     MIDI IN PROCESSING
*	this is where the bulk of 
*	the user expression happens
******************************/

//This function returns true if the midi is used
function onMidi(status, data1, data2) {

	if (isChannelController(status)) {
		var channel = status%16;

		if(channel == 0)  {
			var vertex = null;
			var padNum = data1%20;
			if(data1 < 20) {  
				vertex = "pressure";
				padStates[padNum].setPressure(data2);  }

			else if(data1 < 40) {  
				vertex = "x";
				padStates[padNum].setXPos(data2);  }

			else if(data1 < 60) {  
				vertex = "y";
				padStates[padNum].setYPos(data2);  }

			return (vertex != null) && tryAsPadPosData(padNum, vertex, data2);
		}

		else if (channel == 1) {  return tryAsTrackCCData(data1, data2);  }
	}

	else if(data1 < TOP_PAD_NOTE_LIMIT)  {
		padStates[data1].setVelocity(data2);
		return tryAsDrumPadTrigger(data1, data2);  }
		
	else return (tryAsPageIndifferentData(data1, data2)
		|| 	tryAsTrackButtonData(data1, data2)
		|| 	tryAsClipButtonData(data1, data2)
		|| 	tryAsDrumButtonData(data1, data2));  


	return true;
}
 
//---------------------------------------------------------------------------

function tryAsMidiCornerTrigger(x, y, velocity)  {
	return tryAsDrumCornerTrigger(x, y, velocity)
		||	tryAsClipCornerTrigger(x, y, velocity)
		||	tryAsConductorCornerTrigger(x, y, velocity);
}

//---------------------------------------------------------------------------

function tryAsMidiCornerPressure(x, y, pressure)  {

}

//---------------------------------------------------------------------------

function tryAsPadPosData(padNum, vertex, position)  {
	return tryAsConductorPadPosData(padNum, vertex, position)
		||	tryAsDrumPadPosData(padNum, vertex, position);
}

//---------------------------------------------------------------------------

//this function deals with button presses that do not change 
//in effect based off the current page
function tryAsPageIndifferentData(data1, data2)  {
		//
	if(data1 == DIAMOND_BTN) {  diamondButtonUpdate(data2);  }
	else if(data1 == SQUARE_BTN) {  squareButtonUpdate(data2);  }
		//
	else if(data2 != 0)  {  //all other button presses respond only to being pushed (and not released)
		switch(data1)  {
			case TRIANGLE_BTN:  triangleButtonHit();  break;
		   //the eyes of vader
			case RIGHT_ROTARY:  rightRotaryButtonHit();  break;
			case LEFT_ROTARY:  leftRotaryButtonHit();  break;
			default: return false;
	}	}
	else return false;

   //if the midi couldn't be consumed, false was already returned.
	return true;
}

//---------------------------------------------------------------------------

//the diamondButton. If it is pressed while nothing is playing, it engages
//track record.  Otherwise, it is used like ALT or CTRL or CMD
//when an *mod button is used*, it's state changes
function diamondButtonUpdate(data2)  {
	if(data2 == 0)  {
		if(currentlyPlaying == false)  {
			transport.record();  }
		diamondButton.setHeld(false); }
	else  {
		diamondButton.setHeld(true);  }
}

//---------------------------------------------------------------------------

//the square is modButton2.  If not held and used as an alt button, it stops the 
//currently selectred track.  Otherwise, it is used like ALT or CTRL or CMD
function squareButtonUpdate(data2)  {
	if(data2 == 0)  {
		if(squareButton.numUses == 0)	{
			getTrackFromBank(selectedTrack).stop();  }
		squareButton.setHeld(false);
	}
	else  {
		squareButton.setHeld(true);  }
}

//---------------------------------------------------------------------------

//if the triangle button is pressed: with mod 2 it starts and stops the transport.  
//with mod 1 it enables record
//while playback is stopped, it starts it
//otherwise it turns the metronome on and off
function triangleButtonHit() {
	if(squareButton.held == true) {
		if(currentlyPlaying == true) {  transport.togglePlay();  }  
		else  {  transport.stop();  }
		squareButton.numUses++;  //when an *mod button is used*, it's state changes
	}
	else if(diamondButton.held == true) {
		diamondButton.numUses++;
		transport.record();  }
			//
	else if(currentlyPlaying == false) {  transport.play();  }
		//
	else {  transport.toggleClick();   }
}

//---------------------------------------------------------------------------

//the right rotary is used for switching pages and completing recordings.  
//these are usually done at the same time.
function rightRotaryButtonHit() {
   //if squareButton is held this calls redo (left calls undo)
	if(squareButton.held == true)  {  
		squareButton.numUses++;
		application.redo();  }
	else {
		MDI_hitRightRecButton();
	}

   //while a recording is happening, this closes the recording and if there is a next track
   //in line for recording, this qeues it.
	// else if(pageAutoSwitch.status == RECORDING_NOW) {
	// 	var track = pageAutoSwitch.track;
	// 	var scene = pageAutoSwitch.scene;
	// 	pageAutoSwitch.status = RECORDING_CLOSED;
	// 	MDI_liveBank[track].getChannel(track).getClipLauncher().launch(scene);

	// 	nextTrack = pageAutoSwitch.nextTrack;
	// 	if(nextTrack != -1)  {
	// 		createRecordingForLiveTrack(nextTrack);  }
	// }

   //otherwise, this switchs the page from drum page to clip.
	// else {
	// 	pageAutoSwitch.status = RECORDING_OFF;  //*bad code*

	// 	releaseAllHeldToggles();

	// 	if(currentPage == DRUM_PAGE) {  MDI_setPage(CLIP_PAGE);  }
	// 	else if(currentPage == CLIP_PAGE) {  MDI_setPage(CONDUCTOR_PAGE);  }
	// 	else {  MDI_setPage(DRUM_PAGE);  }
	// }	
}

//---------------------------------------------------------------------------

//the left rotary is used for starting recordings, undo, and tap tempo 
function leftRotaryButtonHit()  {
	if(squareButton.held == true)  {  
		squareButton.numUses++;
		application.undo();  }
	else {
		MDI_hitLeftRecButton();
	}

   //if clip page is unavailable to start a recording, this can be used
	// else if(pageAutoSwitch.status == RECORDING_OFF)  {  
	// 	createRecordingForCurrentLiveTrack();  }
	
   //if this is not already in recording retry mode, start it.
   //recording retry deletes the current recording and starts a new one.
   //I'm rather proud of this bit.  It feels really natural when you're playing.
	// else if(pageAutoSwitch.status != RECORDING_RETRY) {
	// 	var track = pageAutoSwitch.track;
	// 	var scene = pageAutoSwitch.scene;
	// 	var clipLauncher = MDI_liveBank[track].getChannel(track).getClipLauncher();
	// 	//disfunctional.  Delete's things that aren't the clip often.
	// 	removeClip(track, scene);

	// 	pageAutoSwitch.status = RECORDING_RETRY;
	// 	hitClip(track, scene);
	// }
	
   //this can be used for tap tempo from the clip page
	// else if (currentPage == CLIP_PAGE) {  transport.tapTempo();  }
}













/******************************
*     MIDI OUT PROCESSING
******************************/

//
function tryReleasingStalledPadNotes()  {
	// println("attempting release of stalled pad hits "+currentlyStallingPadHit+" "+numTracksArmed);
	if(currentlyStallingPadHit)  {
	   //pad hits are only stalled for recording purposes
	   //if not recording, ensure that all functionality is initialized
		if(pageAutoSwitch.status == RECORDING_OFF)  {
			for(var i = 0; i < stalledPadHits.length; i++)  {
				stalledPadHits[i] = null;}	
			currentlyStallingPadHit = false;
		}

	   //if there is no track arm interference and pad hit's are stalled,
	   //release the hits
		else if(numTracksArmed == 1)  {
			for(var i = 0; i < stalledPadHits.length; i++)  {
				if(stalledPadHits[i] != null)  {
					// println("releasing stalled pad hit "+i);
					sendPadHitToBitwig(midiOutForPad[i], stalledPadHits[i].velocity);

					if(stalledPadHits[i].impulseOnly == true)  {
						sendNoteOnToBitwig(midiOutForPad[i], 0);
						midiOutForPad[i] = -1;
					}

					stalledPadHits[i] = null;
			}	}

			currentlyStallingPadHit = false;
		}
	}
}

//---------------------------------------------------------------------------

function releaseAllPads()  {
	for(var i = 0; i < padHitsData.length; i++)  {
		if (padHitsData[i] != null)  {
			sendPadHitToBitwig(i, 0);  }
	}
}

//---------------------------------------------------------------------------

function releaseAllHeldToggles()  {
	for(var i = 0; i < trackSolos.length; i++)  {
		trackSolos[i].setHeld(false);
		trackMutes[i].setHeld(false);
}	}

//---------------------------------------------------------------------------

function sendPadHitToBitwig(padNum, velocity)  {

	if(midiOutForPad[padNum] == -1) {
		var trackIndex = MDI_liveBankPosition + selectedTrack;
		var midiOut = trackOctaveOffsets[trackIndex] * 12;
		if(padNum == 14)  {  midiOut += 12;  }
		else  {  midiOut += padNum;  }

		midiOutForPad[padNum] = midiOut;
	}
		//
	if(pageAutoSwitch.status == RECORDING_QUEUED)  {
		var nextMeasureWorthy = (1 - (beatPosition%1)) < BITWIG_UPDATE_LAG;  //within 1/16 of beat start
		var doubleArmIssue = (numTracksArmed > 1 && velocity != 0);
		if(nextMeasureWorthy || doubleArmIssue)  {
			// if (pageAutoSwitch.nextTrack != -1)  {
			// 	println("attempting early arm");
			// 	armSingleTrack(pageAutoSwitch.nextTrack);
			// }
			// releaseAllPads();

			if(stalledPadHits[padNum] == null && velocity > 0)  {

				stalledPadHits[padNum] = new StalledPadHit(velocity);
				currentlyStallingPadHit = true;
				println("note caught to be put in next measure");
				return true;  
			}
			else if(stalledPadHits[padNum] != null && velocity == 0)  {
				stalledPadHits[padNum].impulseOnly = true;
				return true;
		}	}	
	}

	

	sendNoteOnToBitwig(midiOutForPad[padNum], velocity);
	if(velocity == 0) {  midiOutForPad[padNum] = -1;  }
}

// //---------------------------------------------------------------------------

// function sendNoteOnToBitwig(midiNum, velocity)  {
// 	println("note, vel: "+midiNum+" "+velocity+" :: "+beatPosition);
// 	sendMidiToBitwig(144, midiNum, velocity);
// }

// //---------------------------------------------------------------------------

// function sendMidiToBitwig(status, data1, data2)  {
// 	QUNEONoteIn.sendRawMidiEvent(status, data1, data2);  }


















/******************************
*     HELPER FUNCTIONS
*	these are used by all pages
******************************/

//set page updates mostly updates the lighting
function setPage(page)  {
	println("set page "+page);
	// if(page != currentPage)  {  
		clearPadLEDS();  

		if(page == CLIP_PAGE) {
			sendMidi(176, 7, 0);  //right eye up
			showClipPage();  }
		else if (page == DRUM_PAGE) {
			sendMidi(176, 7, 45);   
			showDrumPage();  }//right eye down
		else if (page == CONDUCTOR_PAGE) {
			sendMidi(176, 7, 90);   
			showConductorPage();  }//right eye down
}	

//---------------------------------------------------------------------------

//when selecting a track, it is armed independent from it's selection.
function selectTrackFromBank(trackNum)  {
	if(currentPage == DRUM_PAGE)  {
		trackSolos[selectedTrack].setHeld(false);  }

	selectedTrack = trackNum;  
	armSingleLiveTrack(trackNum);
		//
	println("select track from bank "+trackNum);
	getTrackFromBank(trackNum).select();

	if(currentPage == CLIP_PAGE)  {
		for(var t = 0; t < 8; t++) {
			showTrackSettings(t);  }
	}
}

//---------------------------------------------------------------------------

//the track bank used here is a hack due to a glitch in Bitwig
//having multiple track banks of one track can't be done.
//I expect this *code to break*
function getTrackFromBank(trackNum)  
{	return MDI_liveBank[trackNum].getTrack(trackNum);  }

//---------------------------------------------------------------------------

// function setSoloToggleHeld(trackNum, held)  {
// 	if(trackSolos[trackNum].held != held)  {
// 		getTrackFromBank(trackNum).getSolo().toggle();  
// 		trackSolos[trackNum].held = held;  }
// }

//---------------------------------------------------------------------------

//this takes a midiNum and returns which corner of the pad it would be
//the corners of the pad are numbered like so:
//  2  3
//  0  1
// function getCornerFromMidiNum(midiNum)  {
// 	var corner = 3;
// 	if(midiNum % 16 >= 8){
// 		if(midiNum % 2 == 0) {  corner = 0; }
// 		else {  corner = 1;  }
// 	}
// 	else if(midiNum % 2 == 0) { corner = 2;  }

// 	return corner;
// }

//---------------------------------------------------------------------------

//the note which is played has a strange relationship to the way the
//notes are output from the Quneo.
//the quneo starts at zero in the North West and goes to 64 in the South East
//the note out goes from zero in the South West to 16 in the North East
// function convertToDrumPadNum(data1) {
// 	var col = data1 % 8;
// 		col /= 2;
// 		col -= col%1;

// 	var row = data1/16;
// 		row -= row%1;

// 	return (3-row)*4 + col;
// }

//---------------------------------------------------------------------------

function ensureRange(value, min, max) {
   return Math.min(Math.max(value, min), max);
}



















/******************************
*       LED FUNCTIONS
*	these are LED states 
*	used by all pages
******************************/

//clears all leds in pad area
function clearPadLEDS() {
	for(var i = 0; i < 64; i++) 
	{	setPadLED(i, OFF);  }
}

//---------------------------------------------------------------------------

//index starts at the top left and ends at the bottom right
//there are 64 leds
function setPadLED(index, color) {
	var midiNum = getMidiNumFromIndex(index);
	sendMidi(146, midiNum, color);
}

//---------------------------------------------------------------------------

//index starts at the top left and ends at the bottom right
//there are 64 leds
function setPadLEDFromXY(x, y, color) {
	var midiNum = getLEDNumFromXY(x, y);
	sendMidi(146, midiNum, color);
}

//---------------------------------------------------------------------------

//same as above but for the green LED only
function setPadGreenLED(index, color) {
	var midiNum = getMidiNumFromIndex(index);
	sendMidi(145, midiNum, color);
}

//---------------------------------------------------------------------------

//same as above but for the red LED only
function setPadRedLED(index, color) {
	var midiNum = getMidiNumFromIndex(index) + 1;
	sendMidi(145, midiNum, color);
}

//---------------------------------------------------------------------------

//this computes the midi num to send for a light
function getMidiNumFromIndex(index)  {
	var col = index %8;
	var row = index/8;
	row -= row%1;
		//
	var x = col;
	var y = 7 - row;

	return ((y*8)+x)*2;
}

//---------------------------------------------------------------------------

//this computes the midi num to send for a light
function getLEDNumFromXY(x, y)  {
	return (y*16) + (x*2);  }















/******************************
*   QUNEO BEAT TIME UPDATES
******************************/

//controls the position of the spinning eyes when recording, the blinking of the play button when playing,
//and instructs all other beatTime based functions in sub classes to update.
function updateQuneoToBeatTime() {
		//
	// updateSlides();
	updateClipPageAnimationsToBeatTime();
	updateEyesAndTriangleToBeatTime();
   	checkForEndOfRecordingMeasure();
}

//---------------------------------------------------------------------------

// at the end of a recording, all note's go off.  Unfortunately
function checkForEndOfRecordingMeasure()  {
	// if(pageAutoSwitch.status == RECORDING_QUEUED)  {
	if(recStatus.queuedTrack != -1)  {
		var tillEndOfMeasure = (4 - (beatPosition%4));
		var atEndOfMeasure =  tillEndOfMeasure < BITWIG_UPDATE_LAG;  //within 1/16 of end of measure
		if(atEndOfMeasure)  {
			println(tillEndOfMeasure + " beats till measure end");  
			// for(var i = 0; i < padHitsData.length; i++)  {
			// 	if (padHitsData[i] != null)  {
			// 		sendPadHitToBitwig(i, 0);  }
			// }
			if (pageAutoSwitch.nextTrack != -1)  {
				println("early arm");
				armSingleLiveTrack(pageAutoSwitch.nextTrack);
			}

		}
	}
}

//---------------------------------------------------------------------------

function updateEyesAndTriangleToBeatTime() {
	//convert beatposition to a number from 127 to 0 based on it's position in the measure (4 beats)
	var value = beatPosition % 4;
	value *= Math.floor(127/4);
	value = 127 - value;

   //play button blinks hard every two beats, soft every beat
	var playButton = ((2*value)%127) * 80/127;
		playButton += ((4*value)%127) * 40/127;
	sendMidi(144, 35, playButton);

   //when a recording is in process, the spinners show the measure position.  rec button blinks.
	// if(pageAutoSwitch.status != RECORDING_OFF) {
	if(recStatus.recTrack != -1 || recStatus.queuedTrack != -1)  {
		var recBut = (4*value)%127;
		if(recBut < 100) { recBut = 0;  }
		sendMidi(144, 33, recBut);

		var spinner = value;  
		sendMidi(176, 7, convertToSpinnerPosition(spinner)); // spinner right
		sendMidi(176, 6, convertToSpinnerPosition(127-spinner)); // spinner left
	}
}

//---------------------------------------------------------------------------

//Spinners are not actually symmetrical.  Here's a hack to make them look like it though.
function convertToSpinnerPosition(position)  {
	var out;
	if(position < 64) { out = (position/64) * 70;  }
	else {  out = (((position%64)/64) * 77) + 70;  }

	if(out > 127) {  out = 0;  }
	else  {  out = Math.floor(out);  }

	return out;
}






















//---------------------------------------------------------------------------

//STANKY OLD CODE I MAY NEED
// host.getMidiInPort(0).setSysexCallback(onSysex);
// function onSysex(data)
// {
// 	if (String(data) == "f07e00060300015f1e0000001e12000ff7")
// 	{	}
// }