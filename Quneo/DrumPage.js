/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	DrumPage.js:  This is for drum page mode.  For the most part, it plays notes, but it also
+		has finger slide functionality and a built from scratch pad lighting system
+     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/




/******************************
*     CONSTANTS:
******************************/
	//2  3
	//0  1
	//[0 is closest to 1 and 2 not 3], [2 is closest to 0 and 3 not 2], [2 :: 0, 3, !1],  [3 :: 2, 1, !0]
	// var CORNER_RELATIONSHIPS = [[1,2,3],[0,3,2],[0,3,1],[2,1,0]];  
var CHANGE_BEFORE_RETRIGGER = 60;  //the change in pressure required before a note slide is engaged






/******************************
*     VARIABLES:
******************************/
var currentCornerValues = initArray(0, 64);
var drumHitsData = initArray(null, 16);





/******************************
*     MIDI PROCCESSING
******************************/

//there are some buttons which are used differently for the drum page
//specifically, the up and down arrow change the octave
function tryAsDrumButtonData(data1, data2)  {
	if(currentPage != DRUM_PAGE)  {  return false;  }

   	if(data1 == VERT_ARROW_1_DOWN && data2 != 0)  {
		modTrackOctave(MDI_seleced_track, -1);
	}
	else if(data1 == VERT_ARROW_1_UP && data2 != 0)  {
		modTrackOctave(MDI_seleced_track, 1);
	}
		//
	return true;
}

//---------------------------------------------------------------------------

function tryAsDrumCornerTrigger(x, y, velocity)  {
	if(currentPage != DRUM_PAGE) {  return false; }

	if(x < 4 && y >= 6 && velocity != 0)  {
		y %= 6;
		var trackHitNum = ((1-y)*4) + x;

		if(pageAutoSwitch.status == RECORDING_NOW)  {
			pageAutoSwitch.nextTrack = trackHitNum;  }
		else  {
			if(selectedTrack != trackHitNum)  
			{	selectTrackFromBank(trackHitNum);  }
	}	}

	return true;
}


//---------------------------------------------------------------------------

function tryAsDrumPadTrigger(padNum, velocity)  {
	if(currentPage != DRUM_PAGE)  {  return false;  }

	//If it's in the drum pad note range
	if(padNum < 12 || padNum == 14)  {
		sendPadHitToBitwig(padNum, velocity);
			
		var xHitPos = padStates[padNum].xPos;
		var yHitPos = padStates[padNum].yPos;
		drumHitsData[padNum] = new DrumPadHitData(xHitPos, yHitPos);  

	   //update the lighting of the pad
		if(velocity != 0)  {  padStates[padNum].lightPad();  }
		else {  
			padStates[padNum].unlightPad(); 
			drumHitsData[padNum] = null;
		}
	}
	else if (padNum == 15) {
		soloTrack(selectedTrack, velocity > 0);  }

	return true;
}

//---------------------------------------------------------------------------

function tryAsDrumPadPosData(padNum, vertex, position)  {
	if(currentPage != DRUM_PAGE)  {  return false;  }
	
	if(padNum < 12 || padNum == 14)  {
		if(drumHitsData[padNum] != null) {
			var lastYHit = drumHitsData[padNum].yHitPos;

			if(vertex == "x")  {
				var lastXHit = drumHitsData[padNum].xHitPos;
				if(Math.abs(position - lastXHit) > CHANGE_BEFORE_RETRIGGER) {
					drumHitsData[padNum].xHitPos = padStates[padNum].xPos;
					drumHitsData[padNum].yHitPos = padStates[padNum].yPos;

					sendPadHitToBitwig(padNum, padStates[padNum].pressure);
				}	
			}
			else if(vertex == "y")  {
				var lastYHit = drumHitsData[padNum].yHitPos;
				if(Math.abs(position - lastYHit) > CHANGE_BEFORE_RETRIGGER) {
					drumHitsData[padNum].xHitPos = padStates[padNum].xPos;
					drumHitsData[padNum].yHitPos = padStates[padNum].yPos;

					sendPadHitToBitwig(padNum, padStates[padNum].pressure);
				}	
			}
		}

		if(padStates[padNum].velocity != 0)  {
			padStates[padNum].lightPad();  }
	}
	
	return true;
}






/******************************
*     HELPER FUNCTIONS
******************************/

//checks all corner pressure values for anything greater than zero
function padHeld(padNum)  {
	padNum %= 16;
	var i_p = padNum * 4;
	for(var i = 0; i < 4; i++) {
		if(currentCornerValues[i_p + i] != 0){ return true;  }
	}
	return false;
}









/******************************
*       LED FUNCTIONS
******************************/

function showDrumPage() {
	drumPageUpdateSoloLED(selectedTrack);  }



//depreciated
// function relightDrumChunkArrows()  {
// 	if(drumChunk%2 == 1)  {
// 		sendMidi(144, 47, 127);  }
// 	else {
// 		sendMidi(144, 47, 0);  }

// 	if (drumChunk >= 2)  {
// 		sendMidi(144, 46, 127);  }
// 	else {
// 		sendMidi(144, 46, 0);  }
// }

//---------------------------------------------------------------------------

//The corner pressed hardest gets a light amount of the max of it's pressure and 100
//the two closest corners a max of 80 and their pressures
//the furthest a max of 60 and it's pressure
//all lights are turned off if 
// function lightPad(padIndex)  {
// 	padIndex %= 16; //safety
// 	var i_p = padIndex * 4;

//    //find the max corner
// 	var maxCorner = 0;
// 	var maxValue = -1;
// 		//
// 	for(var i = i_p; i < i_p+4; i++) {
// 		if(currentCornerValues[i] > maxValue) {
// 			maxValue = currentCornerValues[i];
// 			maxCorner = i%4;
// 	}	}

//    //find the midi out num for corner 0 (South West)
// 	var row = Math.floor(padIndex/4);
// 	var SW = row*16 + padIndex*4;

//    //if all corners have 0 pressure
// 	if(maxValue == 0) {
// 		sendMidi(146, SW, 0);
// 		sendMidi(146, SW+2, 0);
// 		sendMidi(146, SW+16, 0);
// 		sendMidi(146, SW+18, 0);   
// 	}
//    //otherwise, light the max pressure corner the most.  this imitates the way Quneo normaly reacts to
//    //moving pressure on pads
// 	else {
// 		var cornerOutVal = initArray(0, 4);
// 		cornerOutVal[maxCorner] = Math.min(maxValue, 100);

// 		for(var i = 0; i < 4; i++)  {
// 			if(i != maxCorner)  {
// 				var min = 80;
// 				if(i == 3 - maxCorner) {  min = 60;  } //furthest corner
// 					//
// 				cornerOutVal[i] = Math.max(min, currentCornerValues[i_p+i]);  
// 		}	}

// 		// var relationships = CORNER_RELATIONSHIPS[maxCorner];
// 		// for(var i = 0; i < relationships.length; i++)  {
// 		// 	var cornerNum = relationships[i];
// 		// 	var min = 0;
// 		// 	if(i < 2) {  min = 80; }
// 		// 	else { min = 60;  }
// 		// 	cornerOutVal[cornerNum] = Math.max(min, currentCornerValues[i_p+cornerNum]);  
// 		// }

// 		for(var i = 0; i < cornerOutVal.length; i++)  {
// 			if(cornerOutVal[i] != 0) {
// 				cornerOutVal[i] = 127 - cornerOutVal[i];
// 		}	}

// 		sendMidi(146, SW, cornerOutVal[0]);
// 		sendMidi(146, SW+2, cornerOutVal[1]);
// 		sendMidi(146, SW+16, cornerOutVal[2]);
// 		sendMidi(146, SW+18, cornerOutVal[3]);	
// }	}

//---------------------------------------------------------------------------

//each track gets a corner of one of the top two pads.  The VU is
//output to these corners so you can see which track is which by
//comparing the color and the sound level
function drumPageUpdateVU(trackNum)  {
	if(currentPage != DRUM_PAGE) {  return false;  }

	var index = Math.floor(trackNum / 4) * 8;
	index += trackNum%4;

	var out = getRangedVU(trackNum);
	setPadLED(index, out);

	if(selectedTrack == trackNum)  {
		sendMidi(176, 5, out);
	}

	return true;
}


function drumPageUpdateSoloLED(trackNum)  {
	if(selectedTrack == trackNum)  {
		var color = LIGHT_GREEN;
		if(trackSolos[trackNum] != null && trackSolos[trackNum].status == true) {  color = YELLOW;  }

		setPadLEDFromXY(6, 6, color);
		setPadLEDFromXY(7, 6, color);
		setPadLEDFromXY(6, 7, color);
		setPadLEDFromXY(7, 7, color);
	}
}









/******************************
*      HELPER CLASSES
******************************/

//this class holds which corner was first hit with a pad and how hard
//it's used to tell the difference between a wobbly hit and a finger slide
//see *slide mode*
// function DrumPadHitData(corner, vel){
//    this.corner = corner;
//    this.vel = vel;  }



function DrumPadHitData(xHitPos, yHitPos){
   this.xHitPos = xHitPos;
   this.yHitPos = yHitPos;  }










