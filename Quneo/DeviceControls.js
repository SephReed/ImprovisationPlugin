/*~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
+	Improv Plugin for Bitwig using Quneo
+		By Seph Reed, June 11th 2015
+
+	DeviceControls.js:  This class deals with all of the non note based controls for a page.
+		Specifically, the volume knob, track sends, and macros.
+     
~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~~~~~~~~~~~~------------~~~~~~~~~~~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~*/





// /******************************
// *     VARIABLES
// ******************************/
// var trackVolumes = initArray(0, MAX_TRACKS);
// var trackSends = initArray(0, MAX_TRACKS * MODABLE_SENDS);
// var trackMacros = initArray(0, MAX_TRACKS * MAX_DEVICES * 8);
// var selectedSendPages = initArray(1, MAX_TRACKS);
// var deviceBanks = initArray(null, MAX_TRACKS);
// var macroPages = initArray(0, MAX_TRACKS * 4);
// var selectedTrack = 0;

var volumeSlides = [];
var hasVolumeSlide = initArray(false, MAX_TRACKS);







// /******************************
// *     INITIALIZATION
// ******************************/

// //most of what this initialization does is creating observers for every track
// //there is a max of 128 tracks as a default.  It can be increased or decreased by 
// //simply changing the value in Queno Init
// function deviceControlInit() {
// 	for (var t = 0; t < MAX_TRACKS; t++) {
// 		var track = allSeeingTrackBank.getTrack(t);
// 		track.addIsSelectedInEditorObserver(createDeviceControlObserver(t)); 
// 		track.getVolume().addValueObserver(127, createVolumeObserver(t));
// 		deviceBanks[t] = track.createDeviceBank(1);

// 		for(var m = 0; m < 8; m++) {
// 			deviceBanks[t].getDevice(0).getMacro(m).getAmount().addValueObserver(127, createMacroObserver(t, m));  }

// 		for(var s = 0; s < MODABLE_SENDS; s++) {
// 			track.getSend(s).addValueObserver(127, createSendObserver(t, s));  }
// }	}









/******************************
*     MIDI PROCCESSING
******************************/

//Most of the device controls come in as CC data which controls either
//volume, macros, or sends
function tryAsTrackCCData(data1, data2)  {
   //The First Vertical VU is for volume always
	if(data1 == VERT_VU_1)  {
		if(modButton2 != BTN_RELEASED)  {
			var addMe = new VolumeSlide(selectedTrack);
			volumeSlides.push(addMe);
			hasVolumeSlide[selectedTrack] = true;
		}
	   //this is still very beta code having to do with automatic fades
		else  {
			if(hasVolumeSlide[selectedTrack] == true)  {  
				stopVolSlide(selectedTrack);  }
			getTrackFromBank(selectedTrack).getVolume().set(data2, 127);  
		}
	}

   //Then Fourth Vertical VU has a value of 4, so the only thing less than 4 which
   //is not a VU for track sends is the volume
   //There are three pages for track sends
	else if (data1 <= VERT_VU_4)  {
		var track = getTrackFromBank(selectedTrack);
		if(track != null) {
			  //
			var sendNum = data1-1;
			sendNum += (selectedSendPages[selectedTrack]-1) * 3;

			var send = track.getSend(sendNum);
			
			if(send != null) {  send.set(data2, 127);  }
	}	}

   //the four horizontal VU's can be used to choose between one of two macros independently
   //which macro each has chosen is memorized for each track so you can switch to any track
   //without losing your macro choice settings.  
	else if (data1 <= HOR_VU_4)  {
		var VU_num = data1 % HOR_VU_1;
		var macroNum = VU_num;

		if(macroPages[selectedTrack * 4 + VU_num] == 1) {
			macroNum += 4;  }
			
		deviceBanks[selectedTrack].getDevice(0).getMacro(macroNum).getAmount().set(data2, 127);
}	}

//---------------------------------------------------------------------------

//If Darth Nose is pressed, the send page selection for this track is 
//cycled between 3 pages (and 9 sends)
//If any of the horizontal arrows are pressed, they change which macro that
//horizontal VU controls
function tryAsTrackButtonData(data1, data2)  {
	if(data2 > 0)  {
		if(data1 == DARTH_NOSE_BUTTON)  {
			if(selectedSendPages[selectedTrack] == 1) { selectedSendPages[selectedTrack] = 2; }
			else if(selectedSendPages[selectedTrack] == 2) { selectedSendPages[selectedTrack] = 3; }
			else {  selectedSendPages[selectedTrack] = 1;  }

			showSendsForTrack(selectedTrack);
			showDarthNose(selectedTrack);
		}

		else if(data1 >= HOR_ARROW_1_LEFT && data1 <= HOR_ARROW_4_RIGHT) {
			arrowButton = data1 - HOR_ARROW_1_LEFT;

			var macPageIndex = (selectedTrack*4) + Math.floor(arrowButton / 2);
			var macPage = arrowButton % 2;

			println(macPageIndex + " " + macPage);

			macroPages[macPageIndex] = macPage;
			showMacroPages(selectedTrack);
			showMacrosForTrack(selectedTrack);
}	}	}









/******************************
*       LED FUNCTIONS
******************************/

//all of the things that need to be shown for a track in one place
function showTracknum(trackNum) {
	println("show track"+ trackNum);
	showVolume(trackNum);
	showDarthNose(trackNum);
	showSendsForTrack(trackNum);
	showMacrosForTrack(trackNum);
	showMacroPages(trackNum);
}

//---------------------------------------------------------------------------

//not the VU, but the volume knob level
function showVolume(trackNum) {
	sendMidi(176, 1, trackVolumes[trackNum]);  }

//---------------------------------------------------------------------------

//darth nose has 3 colors.  each one is for a different page of
//the 9 sends available
function showDarthNose(trackNum)  {
	if(selectedSendPages[trackNum] == 1) {
		sendMidi(144, 44, 127);  
		sendMidi(144, 45, 0);  }
	else if(selectedSendPages[trackNum] == 2) {
		sendMidi(144, 44, 127);  
		sendMidi(144, 45, 127);  }
	else {
		sendMidi(144, 44, 0);  
		sendMidi(144, 45, 127);  }
}

//---------------------------------------------------------------------------

//attemps to show all 9 sends
function showSendsForTrack(trackNum, sendNum) {
	for(var s = 0; s < MAX_MODABLE_SENDS; s++) {
		showSend(trackNum, s);  }
}

//---------------------------------------------------------------------------

//find's the VU position relative to page
//if the send is on this page, it get's shown
function showSend(trackNum, sendNum) {
	var VU_num = sendNum;
	if(selectedSendPages[trackNum] == 2) {  VU_num -= 3;  }
	else if(selectedSendPages[trackNum] == 3) {  VU_num -= 6;  }
	
	if(VU_num < 3 && VU_num >= 0)
	{	sendMidi(176, 2 + VU_num, trackSends[trackNum * MAX_MODABLE_SENDS + sendNum]);    }
}


//attempts to show all 8 macros
function showMacrosForTrack(trackNum)  {
	for(var i = 0; i < 8; i++) {
		showMacro(trackNum, i);  
}	}

//---------------------------------------------------------------------------

//checks to see if the macro page for this macro and track
//currently shows this macro.  outputs if it does
function showMacro(trackNum, macroNum)  {
	var macroIndex = (trackNum * 8 + macroNum);
	var out = trackMacros[macroIndex];

	var macPage = macroPages[trackNum * 4 + (macroNum%4)];

	if(macroNum < 4 &&  macPage == 0)  {
		sendMidi(176, 11 - macroNum, out);   }
	else if(macroNum < 8 && macPage == 1)  {
		sendMidi(176, 11 - (macroNum%4), out);   }
}

//---------------------------------------------------------------------------

//each horizontal arrow switches between a macro, and a macro + 4
//left arrow for one, right for the other.
function showMacroPages(trackNum)  {
		//
	var firstArrowLight = 36;

	for(var m = 0; m < 4; m++){
		var macPage = macroPages[trackNum * 4 + m];
		var midiLightNum = firstArrowLight + (2 * m);

		if(macPage == 0)  {	
			sendMidi(144, midiLightNum, 127);  
			sendMidi(144, midiLightNum + 1, 0);  }

		else {	
			sendMidi(144, midiLightNum, 0);  
			sendMidi(144, midiLightNum + 1, 127);  }
}	}













// /******************************
// *   INITIALIZATION HELPERS
// ******************************/

// //which device is chosen
// function createDeviceControlObserver(track)  {
//     return function(value)  {
//     	if(value == true) {  
//     		selectedTrack = track;
//     		showTracknum(track);  
// }	}	}

// //---------------------------------------------------------------------------

// //the values of each send
// function createSendObserver(trackNum, sendNum)  {
//     return function(value)  {
//     	trackSends[trackNum * MODABLE_SENDS + sendNum] = value;
//     	if(trackNum == selectedTrack) {
//     		showSend(trackNum, sendNum);  }
//     };
// } 

// //---------------------------------------------------------------------------

// //the value of the volume fader
// function createVolumeObserver(trackNum)  {
// 	// println("creating function for track #"+track);
//     return function(value)  {
//     	// println("track#"+t+" volume set: "+value); 
//     	trackVolumes[trackNum] = value;
//     	if(trackNum == selectedTrack) {
//     		showVolume(trackNum);  }
//     };
// } 

// //---------------------------------------------------------------------------

// //the value of each of the macros
// function createMacroObserver(trackNum, macroNum)  {
// 	return function(value)  {
// 		var macroIndex = (trackNum * 8 + macroNum);
// 		trackMacros[macroIndex] = value;
// 			//
// 		if(trackNum == selectedTrack) {
//     		showMacro(trackNum, macroNum);  }
// 	}
// }








/**********************************
*   VOLUME SLIDE BEAT TIME UPDATES
*	 for one touch fade outs
*	not quite natural feeling yet
* 	still completely beta code
***********************************/
// 

// function updateSlides()  {
// 	for(var s = 0; s < volumeSlides.length; s++)  {
// 		volumeSlides[s].update();  }
// }



// var SLIDE_LENGTH_DEFAULT = 4; //beats
// function VolumeSlide(track){
// 	this.track = track;
// 	this.startVol = trackVolumes[track];
// 	this.startPos = beatPosition;
// 	this.range = SLIDE_LENGTH_DEFAULT - (this.startPos%SLIDE_LENGTH_DEFAULT);

// 	this.update = function()  {
// 		var ratio = (beatPosition-this.startPos)/this.range;
		
// 		println("update slide");

// 		if(ratio > 1)  {
// 			stopVolSlide(this.track);  }
// 		else  {
// 			ratio = 1 - ratio;

// 			var out = Math.floor(ratio * this.startVol);
// 			println(ratio, out);

// 			getTrackFromBank(selectedTrack).getVolume().set(out, 127); 		
// 		}
// 	}
// }



// function stopVolSlide(trackNum)  {
// 	var target = -1;
// 	for(var i = 0; i < volumeSlides.length && target == -1; i++)  {
// 		if(volumeSlides[i].track == trackNum)  
// 		{ 	target = i;  }
// 	}

// 	if(target != -1)  {
// 		volumeSlides.splice(target, 1);  }
// 	hasVolumeSlide[trackNum] = false;
// }

// // 
















