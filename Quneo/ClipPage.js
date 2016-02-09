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
			getTrackFromBank(trackNum).stop();  }
			// TRACK_BANKS[trackNum].getTrack(trackNum).stop();  }
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
				if(trackSceneSelectPositions[MDI_selected_track] > 0) {
					TRACK_BANKS[MDI_selected_track].scrollScenesUp();  
					trackSceneSelectPositions[MDI_selected_track]--;   }
				break;

		   //scene bank for track right
			case VERT_ARROW_1_DOWN:
				attemptScrollSceneUp(MDI_selected_track);  break;
			
		   //scroll scene bank down 1 track
			case VERT_ARROW_2_DOWN:
				modLiveBankPosition(1);  break;

		   //scroll scene bank up 1 track
			case VERT_ARROW_2_UP:
				modLiveBankPosition(-1);  break;

		}
	}

	return true;
}










/******************************
*       LED FUNCTIONS
******************************/

//calls various led functions to until all corners on all pads are updated
function showClipPage() {
	for(var i = 0; i < LIVE_BANK_TOTAL_SCENES; i++) {
		updateClipLED(i);   }

	for(var t = 0; t < 8; t++) {
		showTrackSettings(t);  }
}	

//---------------------------------------------------------------------------

//calls the three led functions for select, solo, and mute
function showTrackSettings(t)  {
	setTrackSelectLED(t, t == MDI_focusedLiveTrack);
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

	if(MDI_focusedLiveTrack == trackNum)  {
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
		var offset = MDI_focusedLiveTrack * 8;
		setPadLED(offset, OFF);
		setPadLED(offset + 1, OFF);
		setPadLED(offset + 2, OFF);
		blinkOn = true;
	}
	else if(blinkOn == true && ratio > ratioThreshold) {
		showTrackSettings(MDI_focusedLiveTrack); 

		blinkOn = false ;
}	}












