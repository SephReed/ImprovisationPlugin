
//For the most part, this just creates observers which you can find
//at them bottom of the page labeled as *initialization helpers*
function initializeBitwigObservers()  {
  MDI_addLiveBankPositionObserver(moveAllTrackBanks);

	for (var t = 0; t < LIVE_BANK_HEIGHT; t++)
	{
		var track = MDI_liveBank[t].getTrack(t);
    track.addVuMeterObserver(128, -1, true, createVuMeterObserver(t));
    track.getSolo().addValueObserver(createSoloObserver(t));
    track.getMute().addValueObserver(createMuteObserver(t));
    // track.getArm().addValueObserver(createArmObserver(t));
    track.addIsSelectedInEditorObserver(createSelectObserver(t));
    track.getVolume().addValueObserver(127, createVolumeObserver(t)); 

		var clipLauncher = track.getClipLauncher();
		clipLauncher.setIndication(true);
		// clipLauncher.addHasContentObserver(createGridObserver(t, HAS_CONTENT));
  	clipLauncher.addIsPlayingObserver(createGridObserver(t, IS_PLAYING));
  	clipLauncher.addIsRecordingObserver(createRecordingObserver(t));
  	clipLauncher.addIsQueuedObserver(createQeuedObserver(t));


    deviceBanks[t] = track.createDeviceBank(1);
    for(var m = 0; m < MAX_MODABLE_MACROS; m++) {
      deviceBanks[t].getDevice(0).getMacro(m).getAmount().addValueObserver(127, createMacroObserver(t, m));  }

    for(var s = 0; s < MAX_MODABLE_SENDS; s++) {
      track.getSend(s).addValueObserver(127, createSendObserver(t, s));  }

		createMeasureEndCarpetBomb(track);
	}

	host.createSceneBank(1).addSceneCountObserver(createSceneCountObsterver());
}



/******************************
*     INITIALIZATION
******************************/

//most of what this initialization does is creating observers for every track
//there is a max of 128 tracks as a default.  It can be increased or decreased by 
//simply changing the value in Queno Init
// function deviceControlInit() {
// 	for (var t = 0; t < LIVE_BANK_HEIGHT; t++) {
// 		// var track = allSeeingTrackBank.getTrack(t);
// 		track.addIsSelectedInEditorObserver(createDeviceControlObserver(t)); 
// 		track.getVolume().addValueObserver(127, createVolumeObserver(t));
// 		deviceBanks[t] = track.createDeviceBank(1);

// 		for(var m = 0; m < 8; m++) {
// 			deviceBanks[t].getDevice(0).getMacro(m).getAmount().addValueObserver(127, createMacroObserver(t, m));  }

// 		for(var s = 0; s < MODABLE_SENDS; s++) {
// 			track.getSend(s).addValueObserver(127, createSendObserver(t, s));  }
// }	}

















/******************************
*   INITIALIZATION HELPERS
******************************/

//Stolen from Quneo!  This sends a value change for the scene and 
//track to the given bank
function createGridObserver(track, statusBank)  {
    return function(scene, statusEngaged)  {
    	var index = (track*LIVE_BANK_WIDTH)+scene;
   		statusBank[index] = statusEngaged;
   		updateClipLED(index);
}	}

//---------------------------------------------------------------------------

//if a scene is queued, this updates the bank
//also, if another scene is queued to be recorded, this get's it ready 
//by arming it slightly before the recording observer would
function createQeuedObserver(track) {
	return function(scene, statusEngaged)  {
		var index = (track*LIVE_BANK_WIDTH)+scene;
   		IS_QEUED[index] = statusEngaged;


   		if(statusEngaged == true && pageAutoSwitch.track == track && pageAutoSwitch.nextTrack != -1 )  {
			getTrackFromBank(pageAutoSwitch.nextTrack).getArm().set(true);	
		}

		updateClipLED(index);
}	}	

//---------------------------------------------------------------------------

//the recording observer updates the IS_RECORDING bank
//it also updates the currently recording variable and double checks the track
//the only one selected and armed
function createRecordingObserver(track) {
	return function(scene, statusEngaged)  {
		pageAutoSwitch.track = track;
		pageAutoSwitch.scene = scene;

    	var index = (track*LIVE_BANK_WIDTH)+scene;
   		IS_RECORDING[index] = statusEngaged;
   		var nextTrack = pageAutoSwitch.nextTrack;

   		if(statusEngaged == true) {
   			println("recording started");
   			pageAutoSwitch.nextTrack = -1;
   			// if(nextTrack != -1)  {    }
   			if(nextTrack == track)  {  selectTrackFromBank(track);  }
   			pageAutoSwitch.status = RECORDING_NOW;  
   		}

   		//RIGHT HERE.  Record queue instead.  Release all pads not working.
   		else  { 
   			if (pageAutoSwitch.status == RECORDING_QUEUED && nextTrack != -1)  {  
   				// releaseAllPads();
   			   //not actually inherently true, but it's very very likely
   				pageAutoSwitch.status = RECORDING_NOW;
   				println("track coming up "+nextTrack);  
   			}
   			else {  pageAutoSwitch.status = RECORDING_OFF;   }
   		}
}	}

//---------------------------------------------------------------------------

//is track selected
function createSelectObserver(track)  {
    return function(value)  {
    	if(value == true) {
    		selectedTrack = track;  
        showTracknum(track);
      }

    	if(currentPage == CLIP_PAGE)  {  setTrackSelectLED(track, value);  } 	
}	}

//---------------------------------------------------------------------------

//is track soloed
function createSoloObserver(track)  {
    return function(value)  {
    	trackSolos[track].status = value;

    	if(currentPage == CLIP_PAGE)  {  setTrackSoloLED(track, value);  }
      else if (currentPage == CONDUCTOR_PAGE) {  conductorUpdateSoloLED(track);  }
      else if (currentPage == DRUM_PAGE) {  drumPageUpdateSoloLED(track);  }
      
}	}

//---------------------------------------------------------------------------

//is track muted
function createMuteObserver(track)  {
    return function(value)  {
    	trackMutes[track].status = value;
    	if(currentPage == CLIP_PAGE)  {  setTrackMuteLED(track, value);  }
      else if (currentPage == CONDUCTOR_PAGE) {  conductorUpdateMuteLED(track);  }
}	}

//---------------------------------------------------------------------------

//is track armed
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

//---------------------------------------------------------------------------

//*clean me* this goes straight to drum page
function createVuMeterObserver(track)  {
    return function(value)  {
    	trackVUs[track] = value;  
    	if(drumPageUpdateVU(track) 
    		|| conductorPageUpdateVU(track)
    		|| clipPageUpdateVU(track)
    	){}
}   }	

//---------------------------------------------------------------------------

//how many scenes are there total
function createSceneCountObsterver()  {
	return function(value) {
		totalScenesAvailable = value;  }
}

//---------------------------------------------------------------------------

function createMeasureEndCarpetBomb(track)  {
	var clipLauncher = track.getClipLauncher();
	
	clipLauncher.addIsRecordingObserver(function(scene, statusEngaged)  {	
   		// println("recording "+statusEngaged);
   		tryReleasingStalledPadNotes();  
   	});

	clipLauncher.addIsRecordingQueuedObserver(function(scene, statusEngaged)  {
		// println("recording queue for track "+statusEngaged);
   		if(statusEngaged == false)  {
   			tryReleasingStalledPadNotes();  }
   	});

	clipLauncher.addIsQueuedObserver(function(scene, statusEngaged)  {
		// println("queue for track "+statusEngaged);
   		if(statusEngaged == false)  {
   			tryReleasingStalledPadNotes();  }
	});
}









/******************************
*   INITIALIZATION HELPERS
******************************/

//which device is chosen
// function createDeviceControlObserver(track)  {
//     return function(value)  {
//     	if(value == true) {  
//     		SELECTED_TRACK = track;
//     		showTracknum(track);  
// }	}	}

//---------------------------------------------------------------------------

//the values of each send
function createSendObserver(trackNum, sendNum)  {
    return function(value)  {
    	trackSends[trackNum * MAX_MODABLE_SENDS + sendNum] = value;
    	if(trackNum == selectedTrack) {
    		showSend(trackNum, sendNum);  }
    };
} 

//---------------------------------------------------------------------------

//the value of the volume fader
function createVolumeObserver(trackNum)  {
	// println("creating function for track #"+track);
    return function(value)  {
    	// println("track#"+t+" volume set: "+value); 
    	trackVolumes[trackNum] = value;
    	if(trackNum == selectedTrack) {
    		showVolume(trackNum);  }
    };
} 

//---------------------------------------------------------------------------

//the value of each of the macros
function createMacroObserver(trackNum, macroNum)  {
	return function(value)  {
		var macroIndex = (trackNum * MAX_MODABLE_MACROS + macroNum);
		trackMacros[macroIndex] = value;
			//
		if(trackNum == selectedTrack) {
    		showMacro(trackNum, macroNum);  }
	}
}













