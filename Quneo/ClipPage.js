/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	ClipPage.js:  This is for clip page mode.  For the most part, it is used to engage and
+ 		stop clips.  It can also delete them, start recordings, and many more things are coming.
+     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/



//TODO:  fix *buggy*   *clean me*    move all observers into one place




/******************************
*     VARIABLES
******************************/
// var widthScenes = 5;
// var numScenes = widthScenes * 8;
var totalScenesAvailable = 8;   //todo, see if -1 works
var numTracksArmed = 0;

// var IS_RECORDING = initArray(0, numScenes);
// var HAS_CONTENT = initArray(0, numScenes);
// var IS_QEUED = initArray(0, numScenes);
// var IS_PLAYING = initArray(0, numScenes);








/******************************
*     INITIALIZATION
******************************/

// //For the most part, this just creates observers which you can find
// //at them bottom of the page labeled as *initialization helpers*
// function clipPageInit()  {
// 	for (var t = 0; t < 8; t++)
// 	{
// 		var track = TRACK_BANKS[t].getTrack(t); 
// 		var clipLauncher = track.getClipLauncher();
// 		clipLauncher.setIndication(true);
		
// 		clipLauncher.addHasContentObserver(createGridObserver(t, HAS_CONTENT));
//   		clipLauncher.addIsPlayingObserver(createGridObserver(t, IS_PLAYING));
//   		clipLauncher.addIsRecordingObserver(createRecordingObserver(t));
//   		clipLauncher.addIsQueuedObserver(createQeuedObserver(t));

//   		// track.getVolume().addValueObserver(127, createVolumeObserver(track, t));
//   		track.addVuMeterObserver(128, -1, true, createVuMeterObserver(t));
// 		track.getSolo().addValueObserver(createSoloObserver(t));
// 		track.getMute().addValueObserver(createMuteObserver(t));
// 		track.getArm().addValueObserver(createArmObserver(t));
// 		track.addIsSelectedInEditorObserver(createSelectObserver(t));

// 		createMeasureEndCarpetBomb(track);
// 	}

// 	host.createSceneBank(1).addSceneCountObserver(createSceneCountObsterver());
// }









/******************************
*     MIDI PROCCESSING
******************************/

//There are 8 tracks with 8 buttons.
//For each track the first button is Solo, the second mute, the third selects and arms it
//and 4-8 all call *hit clip*
function tryAsClipCornerTrigger(x, y, velocity)  {
	if(currentPage != CLIP_PAGE)  {  return false;  }

	var trackNum = 7 - y;

	if(x >= 3)  {
		if(velocity != 0) { 
			var sceneNum = x - 3;
			hitClip(trackNum, sceneNum);
	}	}
   //solo track	
	if(x == 0) {  
		soloTrack(trackNum, velocity > 0);  }
   //mute track
	else if(x == 1) {  
		muteTrack(trackNum, velocity > 0);  }

	else if(x == 2) {
		if(squareButton.held == true) {
			squareButton.numUses++;
			TRACK_BANKS[trackNum].getTrack(trackNum).stop();  }
		else {
			selectTrackFromBank(trackNum);  }
	}


	return true;
}

//---------------------------------------------------------------------------

//the arrow keys scroll scenes while on clip page
//the left two arrows move the entire scene bank up or down along tracks
//ther right two move a single tracks scene bank left or right
//the position of each track bank is memorized and shown with vertical movement
function tryAsClipButtonData(data1, data2)  {
	if(currentPage != CLIP_PAGE)  {  return false;  }

	if (data2 != 0) {
		switch(data1) {
		   //scene bank for track left
			case VERT_ARROW_1_UP:
				if(trackSceneSelectPositions[selectedTrack] > 0) {
					TRACK_BANKS[selectedTrack].scrollScenesUp();  
					trackSceneSelectPositions[selectedTrack]--;   }
				break;

		   //scene bank for track right
			case VERT_ARROW_1_DOWN:
				attemptScrollSceneUp(selectedTrack);  break;
			
		   //scroll scene bank down 1 track
			case VERT_ARROW_2_DOWN:
				if(topTrackInBank + 8 < 16) {
					moveAllTrackBanks(1);  
					topTrackInBank++;  }
				break;

		   //scroll scene bank up 1 track
			case VERT_ARROW_2_UP:
				if(topTrackInBank > 0) {
					moveAllTrackBanks(-1);  
					topTrackInBank--;  }
				break;

		}
	}

	return true;
}










// /******************************
// *     HELPER FUNCTIONS
// ******************************/

// //hit clip.  This is the bulk of clip page interactions
// //if the square mod button is held, the clip space is cleared
// //if an empty space (no content) is hit, a recording is queued
// //if a space has a clip launch or relaunch it
// function hitClip(trackNum, sceneNum)  {
//    //delete clip
// 	if(modButton2 != BTN_RELEASED)  {
// 		modButton2 = BTN_ALT_MODE;
// 		removeClip(trackNum, sceneNum);  }
// 	else  {
// 		var index = (trackNum*widthScenes)+sceneNum;
// 	   //record clip
// 		if(HAS_CONTENT[index] == false)  {
// 			if(currentPage == CLIP_PAGE)  {
// 				armSingleTrack(trackNum);  }
// 			TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().record(sceneNum);
// 			// pageAutoSwitch = new CurrentlyRecording(trackNum, sceneNum); 
// 			pageAutoSwitch.track = trackNum;
// 			pageAutoSwitch.scene = sceneNum;
// 			pageAutoSwitch.status = RECORDING_QUEUED;
// 			println("recording queued");
//    			setPage(DRUM_PAGE);

//    		   //if the scene being recorded in is the last visible one, automatically scroll
//    		   //the clips so there will be another empty one available
//    			if(sceneNum == widthScenes - 1)  {
//    				attemptScrollSceneUp(trackNum);  }
//    		}

//    	   //launch clip
//    		else  {  TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().launch(sceneNum);  }
// }	}

// //---------------------------------------------------------------------------

// //arming is not done by selecting a track
// function armSingleTrack(trackNum)  {
// 	if(numTracksArmed == 1 && trackArms[trackNum] == true){  return;  }

// 	if(trackArms[trackNum] != true)  {
// 		TRACK_BANKS[trackNum].getTrack(trackNum).getArm().set(true);  }
// 	for(var t = 0; t < 8; t++)  {
// 		if(t != trackNum && trackArms[t] == true) 
// 		{	TRACK_BANKS[t].getTrack(t).getArm().set(false);  }
// }	}
	
// //---------------------------------------------------------------------------

// //checks to see if scene bank for track can move right.  if it can, it moves 
// //it right one scene
// function attemptScrollSceneUp(trackNum)  {
// 	if(trackSceneSelectPositions[trackNum] < totalScenesAvailable - widthScenes) {
// 		TRACK_BANKS[trackNum].scrollScenesDown();  
// 		trackSceneSelectPositions[trackNum]++;  }
// }

// //---------------------------------------------------------------------------

// //this is a still *buggy*.  only works if you have your cursor in the clip area.
// //otherwise it deletes whatever you have selected.
// //if your clip is in the right area, it selects a clip and delete's it
// //Bitwig requires clipLauncher.delete(sceneNum) for this to be done correctly
// function removeClip(trackNum, sceneNum)  {
// 	TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().select(sceneNum);
// 	application.remove(); 
// 	// TRACK_BANKS[trackNum].getChannel(trackNum).getClipLauncher().createEmptyClip(sceneNum, 0);
// 	var clipIndex = (trackNum*widthScenes)+sceneNum;  
// 	HAS_CONTENT[clipIndex] = false;  
// }

// //---------------------------------------------------------------------------

// //just a one liner
// function createRecordingForCurrentTrack()  {
// 	createRecordingForTrack(selectedTrack);  }

// //---------------------------------------------------------------------------

// //iterates through all the visible clips in a bank and start's a recording
// //on the first empty one
// function createRecordingForTrack(trackNum)  {
// 	var offset = trackNum * widthScenes;
// 	for(var sc = 0; sc < widthScenes; sc++)  {
// 		if(HAS_CONTENT[offset + sc] == false) {
// 			hitClip(trackNum, sc);
// 			return;  }
// }	}

// //---------------------------------------------------------------------------

// //this scrolls all the track banks up or down x spaces, and then moves them
// //left or right to match where they once were.  Kind of a hack.
// function moveAllTrackBanks(spaces) {
// 	for(var t = 0; t < 8; t++) {
// 	   //move bank up or down
// 		var bank = TRACK_BANKS[t];
// 		for(var i = 0; i < Math.abs(spaces); i++) {
// 			if(spaces < 0) {
// 				bank.scrollTracksUp();  }
// 			else {
// 				bank.scrollTracksDown();  }
// 		}

// 	   //finds the diffence in the leftmost scene position of this track vs the 
// 	   //last track this bank once was on
// 	   //*buggy* 1 is a magic number
// 		var dScene 
// 		if(spaces > 0) {
// 			dScene = trackSceneSelectPositions[topTrackInBank + t] - trackSceneSelectPositions[topTrackInBank + t + 1];  }
// 		else  {
// 			dScene = trackSceneSelectPositions[topTrackInBank + t] - trackSceneSelectPositions[topTrackInBank + t - 1];  }

// 	   //scrolls the scenes until the diffence is muted
// 		for(var i = 0; i < Math.abs(dScene); i++) {
// 			if(dScene > 0) {
// 				bank.scrollScenesUp();  }
// 			else {
// 				bank.scrollScenesDown();  }//
// 		}
// 	}

//    //then the LED's are relit
// 	showClipPage();
// }












/******************************
*       LED FUNCTIONS
******************************/

//calls various led functions to until all corners on all pads are updated
function showClipPage() {
	for(var i = 0; i < numScenes; i++) {
		updateClipLED(i);   }

	for(var t = 0; t < 8; t++) {
		showTrackSettings(t);  }
}	

//---------------------------------------------------------------------------

//calls the three led functions for select, solo, and mute
function showTrackSettings(t)  {
	setTrackSelectLED(t, t == selectedTrack);
	setTrackSoloLED(t, trackSolos[t].status);
	setTrackMuteLED(t, trackMutes[t].status);   }

//---------------------------------------------------------------------------

//clip spaces change color depending on what's going on
function updateClipLED(index)  {
	if (currentPage != CLIP_PAGE) {  return;  }

	var color = OFF;

	if(IS_RECORDING[index]) {  color = RED;  }
	else if(IS_QEUED[index]) {  color = ORANGE;  }
	else if(IS_PLAYING[index])  { color = GREEN;  }
	else if(HAS_CONTENT[index]) { color = ORANGE;  }

	setClipLED(index, color);
}

//---------------------------------------------------------------------------

//this function does some math to find the corner index of a clip and
//pass the led color update along
function setClipLED(index, color) {
	var pos = Math.floor(index/5) * 8;
	pos += index%5;
	pos += 3;

	setPadLED(pos, color);
}

//---------------------------------------------------------------------------

//solo led has two states.  on/off
function setTrackSoloLED(track, value) {
	if(value != 0) {
		setPadLED(track*8, YELLOW)  }
	else {
		setPadLED(track*8, LIGHT_GREEN)  }
}

//---------------------------------------------------------------------------

//select led has two states.  on/off
function setTrackSelectLED(track, value) {
	if(value != 0) {
		setPadLED(track*8+2, RED)  }
	else {
		setPadLED(track*8+2, LIGHT_GREEN)  }
}

//---------------------------------------------------------------------------

//mute led has two states.  on/off
function setTrackMuteLED(track, value) {
	if(value != 0) {
		setPadLED(track*8+1, ORANGE)  }
	else {
		setPadLED(track*8+1, LIGHT_GREEN)  }
}

//---------------------------------------------------------------------------

function clipPageUpdateVU(trackNum)  {
	if(currentPage != CLIP_PAGE) {  return false;  }

	var index = trackNum * 8;

	var out = getRangedVU(trackNum);
	setPadLED(index, out);

	if(selectedTrack == trackNum)  {
		sendMidi(176, 5, out);
	}

	return true;
}







/******************************
* CLIP PAGE BEAT TIME UPDATES
******************************/

// function clipPageTick(onNotOff) {
// 	if(currentPage == CLIP_PAGE) {
// 		if(onNotOff == true)  {
// 			showTrackSettings(selectedTrack);  }
// 		else  {
// 			var offset = selectedTrack * 8;
// 			for(var i = 0; i < 8; i++)  {
// 				setPadLED(offset + i, OFF);  }
// 		}
// 	}
// }


var blinkOn = false;
function updateClipPageAnimationsToBeatTime() {
	if(currentPage != CLIP_PAGE)  {  return;  }

	var loopLength = 1;
	var ratioThreshold = .5;
	var ratio = (beatPosition%loopLength) / loopLength;

	if(blinkOn == false && ratio < ratioThreshold) {
		var offset = selectedTrack * 8;
		setPadLED(offset, OFF);
		setPadLED(offset + 1, OFF);
		setPadLED(offset + 2, OFF);
		blinkOn = true;
	}
	else if(blinkOn == true && ratio > ratioThreshold) {
		showTrackSettings(selectedTrack);
		// setTrackSelectLED(selectedTrack, true);
		// setTrackSoloLED(selectedTrack, trackSolos[selectedTrack]);
		// setTrackMuteLED(selectedTrack, trackMutes[selectedTrack]); 

		blinkOn = false ;
}	}











// /******************************
// *   INITIALIZATION HELPERS
// ******************************/

// //Stolen from Quneo!  This sends a value change for the scene and 
// //track to the given bank
// function createGridObserver(track, statusBank)  {
//     return function(scene, statusEngaged)  {
//     	var index = (track*widthScenes)+scene;
//    		statusBank[index] = statusEngaged;
//    		updateClipLED(index);
// }	}

// //---------------------------------------------------------------------------

// //if a scene is queued, this updates the bank
// //also, if another scene is queued to be recorded, this get's it ready 
// //by arming it slightly before the recording observer would
// function createQeuedObserver(track) {
// 	return function(scene, statusEngaged)  {
// 		var index = (track*widthScenes)+scene;
//    		IS_QEUED[index] = statusEngaged;


//    		if(statusEngaged == true && pageAutoSwitch.track == track && pageAutoSwitch.nextTrack != -1 )  {
// 			getTrackFromBank(pageAutoSwitch.nextTrack).getArm().set(true);	
// 		}

// 		updateClipLED(index);
// }	}	

// //---------------------------------------------------------------------------

// //the recording observer updates the IS_RECORDING bank
// //it also updates the currently recording variable and double checks the track
// //the only one selected and armed
// function createRecordingObserver(track) {
// 	return function(scene, statusEngaged)  {
// 		pageAutoSwitch.track = track;
// 		pageAutoSwitch.scene = scene;

//     	var index = (track*widthScenes)+scene;
//    		IS_RECORDING[index] = statusEngaged;
//    		var nextTrack = pageAutoSwitch.nextTrack;

//    		// if()


//    		if(statusEngaged == true) {
//    			println("recording started");
//    			pageAutoSwitch.nextTrack = -1;
//    			// if(nextTrack != -1)  {    }
//    			if(nextTrack == track)  {  selectTrackFromBank(track);  }
//    			pageAutoSwitch.status = RECORDING_NOW;  
//    		}

//    		//RIGHT HERE.  Record queue instead.  Release all pads not working.
//    		else  { 
//    			if (pageAutoSwitch.status == RECORDING_QUEUED && nextTrack != -1)  {  
//    				// releaseAllPads();
//    			   //not actually inherently true, but it's very very likely
//    				pageAutoSwitch.status = RECORDING_NOW;
//    				println("track coming up "+nextTrack);  
//    			}
//    			else {  pageAutoSwitch.status = RECORDING_OFF;   }
//    		}
   		
   		
//   //  		else if (pageAutoSwitch.status == RECORDING_CLOSED) {
//   //  			setPage(CLIP_PAGE);
//   //  			pageAutoSwitch.status = RECORDING_OFF; 
// 		// }	

		
// }	}

// //---------------------------------------------------------------------------

// //is track selected
// function createSelectObserver(track)  {
//     return function(value)  {
//     	if(value == true) {
//     		selectedTrack = track;  }
//     	if(currentPage == CLIP_PAGE)  {  setTrackSelectLED(track, value);  } 	
// }	}

// //---------------------------------------------------------------------------

// //is track soloed
// function createSoloObserver(track)  {
//     return function(value)  {
//     	// if(value == true && trackSolos[track] != SOLO_HELD_ON)  {
//     	// 	trackSolos[track] = SOLO_ON;  }
//     	// else if(value == false && trackSolos[track] != SOLO_HELD_OFF)  {
//     	// 	trackSolos[track] = SOLO_OFF;  }

//     	trackSolos[track].status = value;

//     	if(currentPage == CLIP_PAGE)  {  setTrackSoloLED(track, value);  }
// }	}

// //---------------------------------------------------------------------------

// //is track muted
// function createMuteObserver(track)  {
//     return function(value)  {
//     	trackMutes[track] = value;
//     	if(currentPage == CLIP_PAGE)  {  setTrackMuteLED(track, value);  }
// }	}

// //---------------------------------------------------------------------------

// //is track armed
// function createArmObserver(track)  {
//     return function(value)  {
//     	println("arm for track "+track+" = "+value);
//     	var previouslyMultiArmed = numTracksArmed > 1;

//     	trackArms[track] = value;

//     	numTracksArmed = 0;
// 		for(var i = 0; i < trackArms.length; i++) {
// 			if(trackArms[i] == true)  {  
// 				numTracksArmed++;  }
// 		}

// 		var nowSingularlyArmed = numTracksArmed == 1; 
// 		if(previouslyMultiArmed && nowSingularlyArmed)  {
// 			tryReleasingStalledPadNotes();  }
//     	// if(currentPage == CLIP_PAGE)  {  setTrackMuteLED(track, value);  }
// }	}

// //---------------------------------------------------------------------------

// //*clean me* this goes straight to drum page
// function createVuMeterObserver(track)  {
//     return function(value)  {
//     	trackVolumes[track] = value;  
//     	if(currentPage == DRUM_PAGE) {
//     		showVuForTrack(track);
// }   }	}

// //---------------------------------------------------------------------------

// //how many scenes are there total
// function createSceneCountObsterver()  {
// 	return function(value) {
// 		totalScenesAvailable = value;  }
// }

// //---------------------------------------------------------------------------

// function createMeasureEndCarpetBomb(track)  {
// 	var clipLauncher = track.getClipLauncher();
	
// 	clipLauncher.addIsRecordingObserver(function(scene, statusEngaged)  {	
//    		// println("recording "+statusEngaged);
//    		tryReleasingStalledPadNotes();  
//    	});

// 	clipLauncher.addIsRecordingQueuedObserver(function(scene, statusEngaged)  {
// 		// println("recording queue for track "+statusEngaged);
//    		if(statusEngaged == false)  {
//    			tryReleasingStalledPadNotes();  }
//    	});

// 	clipLauncher.addIsQueuedObserver(function(scene, statusEngaged)  {
// 		// println("queue for track "+statusEngaged);
//    		if(statusEngaged == false)  {
//    			tryReleasingStalledPadNotes();  }
// 	});
// }







